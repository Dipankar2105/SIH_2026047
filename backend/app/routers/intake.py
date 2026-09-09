import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.intake import Session as IntakeSession
from app.models.intake import IntakeAnswer
from app.models.red_flag import RedFlag

from app.schemas.intake import (
    IntakeAnswerRequest,
    IntakeAnswerResponse,
    IntakeStartRequest,
    IntakeStartResponse,
)

from app.services.adaptive_engine import (
    get_adaptive_next_question,
    get_complaint_from_answers,
    infer_complaint_from_question,
)

from app.services.question_banks import (
    get_question_bank,
)

from app.services.question_engine import get_progress

from app.services.safety_engine import (
    calculate_priority,
    check_answer,
)

from app.services.voice_client import evaluate_voice_confidence

from app.services.intake_integration import (
    extract_patient_answer,
)

from app.services.asr_engine import transcribe_speech
from app.services.translation_engine import translate_to_english


router = APIRouter(
    prefix="/intake",
    tags=["Intake"],
)


@router.post(
    "/start",
    response_model=IntakeStartResponse,
)
def start_intake(
    request: IntakeStartRequest,
    db: Session = Depends(get_db),
):
    complaint = request.complaint.lower().strip()
    system = request.system.lower().strip()

    if system not in ["allopathic", "ayush"]:
        raise HTTPException(
            status_code=400,
            detail="System must be allopathic or ayush.",
        )

    if system == "ayush":
        from app.services.ayush_question_banks import (
            get_first_ayush_question,
        )

        first_question = get_first_ayush_question()

    else:
        bank = get_question_bank(complaint)

        if not bank:
            raise HTTPException(
                status_code=400,
                detail=f"No question bank found for complaint: {request.complaint}",
            )

        first_question = bank[0]

    session = IntakeSession(
        id=uuid.uuid4(),
        patient_id=None,
        session_token=uuid.uuid4().hex,
        status="active",
        started_at=datetime.utcnow(),
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return IntakeStartResponse(
        session_id=session.id,
        complaint=complaint,
        system=system,
        question_id=first_question["id"],
        question=first_question["question"],
    )


@router.post(
    "/{session_id}/answer",
    response_model=IntakeAnswerResponse,
)
def submit_answer(
    session_id: uuid.UUID,
    request: IntakeAnswerRequest,
    db: Session = Depends(get_db),
):
    session = (
        db.query(IntakeSession)
        .filter(IntakeSession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found.",
        )

    if session.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Session is not active.",
        )

    answers = (
        db.query(IntakeAnswer)
        .filter(
            IntakeAnswer.session_id == session_id
        )
        .order_by(IntakeAnswer.created_at)
        .all()
    )

    # Determine system from question ID.
    is_ayush = request.question_id.startswith("ayush_")

    if is_ayush:
        complaint = "ayush_general"

        from app.services.ayush_question_banks import (
            get_ayush_questions,
        )

        question_bank = get_ayush_questions()

    else:
        complaint = infer_complaint_from_question(
            request.question_id
        )

        if not complaint:
            complaint = get_complaint_from_answers(
                answers
            )

        if not complaint:
            raise HTTPException(
                status_code=400,
                detail="Unable to determine intake complaint.",
            )

        question_bank = get_question_bank(
            complaint
        )

    current_question = None

    for question in question_bank:
        if question["id"] == request.question_id:
            current_question = question
            break

    if not current_question:
        raise HTTPException(
            status_code=400,
            detail="Invalid question for this intake.",
        )

    # ------------------------------------------------
    # Gemini structured language understanding
    # ------------------------------------------------
    # Gemini is used only to understand and structure
    # the patient's natural-language answer.
    #
    # Gemini does NOT determine emergency status,
    # triage priority, or treatment.
    #
    # The deterministic safety engine remains
    # authoritative for safety decisions.
    # ------------------------------------------------

    ai_extraction = extract_patient_answer(
        question=current_question["question"],
        answer=request.answer_text.strip(),
    )

    answered_ids = [
        answer.question_key
        for answer in answers
    ]

    if request.question_id in answered_ids:
        raise HTTPException(
            status_code=400,
            detail="This question has already been answered.",
        )

    answer = IntakeAnswer(
        id=uuid.uuid4(),
        session_id=session_id,
        question_key=request.question_id,
        question=current_question["question"],
        answer=request.answer_text.strip(),
    )

    db.add(answer)

    # Safety engine applies only to the allopathic complaint
    # question banks for now.
    findings = []

    if not is_ayush:
        findings = check_answer(
            complaint,
            request.question_id,
            request.answer_text,
        )

    for finding in findings:
        existing = (
            db.query(RedFlag)
            .filter(
                RedFlag.session_id == session_id,
                RedFlag.flag_type == finding.rule_id,
            )
            .first()
        )

        if not existing:
            db.add(
                RedFlag(
                    id=uuid.uuid4(),
                    session_id=session_id,
                    flag_type=finding.rule_id,
                    description=finding.details,
                    severity=finding.severity,
                    triggered=True,
                )
            )

    # Re-check all previous answers.
    all_findings = []

    if not is_ayush:
        for saved_answer in answers:
            all_findings.extend(
                check_answer(
                    complaint,
                    saved_answer.question_key,
                    saved_answer.answer or "",
                )
            )

        all_findings.extend(findings)

    priority = calculate_priority(
        all_findings
    )

    # Adaptive next question.
    answered_after = answered_ids + [
        request.question_id
    ]

    if is_ayush:
        from app.services.ayush_question_banks import (
            get_next_ayush_question,
        )

        next_question = get_next_ayush_question(
            request.question_id,
            answered_after,
        )
    else:
        next_question = get_adaptive_next_question(
            complaint,
            answered_after,
        )

    if is_ayush:
        total_questions = len(question_bank)
        progress = min(
            len(answered_after) / total_questions,
            1.0,
        )
    else:
        progress = get_progress(
            complaint,
            len(answered_after),
        )

    fallback = (
        request.input_mode == "voice"
        and request.confidence is not None
        and evaluate_voice_confidence(
            request.confidence
        )
    )

    if next_question:
        status = "active"
    else:
        status = "completed"
        session.status = "completed"
        session.ended_at = datetime.utcnow()

    db.commit()

    return IntakeAnswerResponse(
        session_id=session_id,
        answered_question_id=request.question_id,
        next_question_id=(
            next_question["id"]
            if next_question
            else None
        ),
        next_question=(
            next_question["question"]
            if next_question
            else None
        ),
        progress=progress,
        fallback_to_touch=fallback,
        status=status,
        priority=priority,
        adaptive=True,
        safety_alert=priority == "high",
        ai_extraction=ai_extraction,
    )


@router.get("/{session_id}")
def get_intake_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    session = (
        db.query(IntakeSession)
        .filter(IntakeSession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found.",
        )

    answers = (
        db.query(IntakeAnswer)
        .filter(
            IntakeAnswer.session_id == session_id
        )
        .order_by(IntakeAnswer.created_at)
        .all()
    )

    red_flags = (
        db.query(RedFlag)
        .filter(
            RedFlag.session_id == session_id
        )
        .order_by(RedFlag.created_at)
        .all()
    )

    return {
        "session_id": session.id,
        "status": session.status,
        "started_at": session.started_at,
        "ended_at": session.ended_at,
        "answers": [
            {
                "question_id": answer.question_key,
                "question": answer.question,
                "answer": answer.answer,
                "created_at": answer.created_at,
            }
            for answer in answers
        ],
        "red_flags": [
            {
                "flag_type": flag.flag_type,
                "severity": flag.severity,
                "description": flag.description,
            }
            for flag in red_flags
        ],
    }


@router.post(
    "/{session_id}/answer-voice",
    response_model=IntakeAnswerResponse,
)
async def submit_voice_answer(
    session_id: uuid.UUID,
    question_id: str,
    language: str = Query(default="hi", pattern="^(hi|mr|en)$"),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Submit audio answer directly into the intake pipeline.
    Performs ASR -> Translation (if needed) -> Gemini NLU -> Deterministic Safety -> Adaptive Next Question.
    """
    from pathlib import Path
    from tempfile import NamedTemporaryFile

    if not audio.filename:
        raise HTTPException(status_code=400, detail="Audio file missing.")

    temp_path = None
    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

        with NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = Path(temp_file.name)

        # 1. ASR
        asr_res = transcribe_speech(temp_path, language=language)
        transcription_text = asr_res.get("text", "").strip()
        confidence = asr_res.get("confidence", 0.90)

        # 2. Translation to English if non-English
        english_text = translate_to_english(transcription_text, source_lang=language)

        # 3. Pass through standard answer logic
        req = IntakeAnswerRequest(
            question_id=question_id,
            answer_text=english_text,
            input_mode="voice",
            confidence=confidence,
        )

        return submit_answer(session_id=session_id, request=req, db=db)

    finally:
        if temp_path is not None:
            try:
                temp_path.unlink(missing_ok=True)
            except Exception:
                pass


@router.get(
    "/track-c-summary/{session_id}",
)
def get_track_c_clinical_summary(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Dedicated endpoint for Track C integration.
    Provides structured intake history, slot extractions, and AYUSH Dashavidha mapping.
    """
    from app.services.ayush_question_banks import build_ayush_mapping

    session = (
        db.query(IntakeSession)
        .filter(IntakeSession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    answers = (
        db.query(IntakeAnswer)
        .filter(IntakeAnswer.session_id == session_id)
        .order_by(IntakeAnswer.created_at)
        .all()
    )

    red_flags = (
        db.query(RedFlag)
        .filter(RedFlag.session_id == session_id)
        .all()
    )

    ayush_answers = [a for a in answers if a.question_key.startswith("ayush_")]
    ayush_dashavidha = build_ayush_mapping(ayush_answers) if ayush_answers else None

    return {
        "session_id": str(session.id),
        "status": session.status,
        "started_at": session.started_at,
        "ended_at": session.ended_at,
        "total_answers": len(answers),
        "answers": [
            {
                "question_id": a.question_key,
                "question": a.question,
                "answer": a.answer,
                "created_at": a.created_at,
            }
            for a in answers
        ],
        "red_flags": [
            {
                "flag_type": f.flag_type,
                "severity": f.severity,
                "description": f.description,
            }
            for f in red_flags
        ],
        "ayush_dashavidha_mapping": ayush_dashavidha,
    }


@router.post(
    "/{session_id}/ocr-upload",
)
async def upload_document_ocr(
    session_id: uuid.UUID,
    document: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload clinical document/prescription PDF or image for processing via external hosted OCR API.
    """
    from app.services.ocr_client import process_document_ocr

    session = (
        db.query(IntakeSession)
        .filter(IntakeSession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    doc_bytes = await document.read()
    ocr_result = process_document_ocr(doc_bytes, filename=document.filename or "document.pdf")

    return {
        "session_id": str(session.id),
        "status": "processed",
        "ocr_result": ocr_result,
    }

