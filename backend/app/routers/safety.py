import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.intake import IntakeAnswer
from app.models.red_flag import RedFlag
from app.services.safety_engine import calculate_priority, check_answer
from app.schemas.safety import (
    SafetyCheckResponse,
    SafetyFindingResponse,
)

router = APIRouter(prefix="/safety", tags=["Safety"])


@router.post(
    "/check/{session_id}",
    response_model=SafetyCheckResponse,
)
def check_session_safety(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    answers = (
        db.query(IntakeAnswer)
        .filter(IntakeAnswer.session_id == session_id)
        .order_by(IntakeAnswer.created_at)
        .all()
    )

    if not answers:
        raise HTTPException(
            status_code=404,
            detail="No intake answers found for this session.",
        )

    complaint_prefix = answers[0].question_key.split("_")[0]

    prefix_map = {
        "chest": "chest_pain",
        "fever": "fever",
        "headache": "headache",
        "cough": "cough",
        "abdominal": "abdominal_pain",
        "vomiting": "vomiting",
        "diarrhoea": "diarrhoea",
    }

    complaint = prefix_map.get(complaint_prefix, complaint_prefix)

    findings = []

    for answer in answers:
        findings.extend(
            check_answer(
                complaint,
                answer.question_key,
                answer.answer or "",
            )
        )

    priority = calculate_priority(findings)

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

    db.commit()

    return SafetyCheckResponse(
        session_id=session_id,
        priority=priority,
        red_flags=[
            SafetyFindingResponse(
                rule_id=f.rule_id,
                severity=f.severity,
                details=f.details,
            )
            for f in findings
        ],
        requires_urgent_review=priority == "high",
    )


@router.get(
    "/track-a-summary/{session_id}",
)
def get_track_a_safety_summary(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Dedicated endpoint for Track A integration.
    Provides session priority, triage flags, and urgent review requirements.
    """
    red_flags = (
        db.query(RedFlag)
        .filter(RedFlag.session_id == session_id)
        .all()
    )

    severities = [flag.severity for flag in red_flags]
    priority = "high" if "high" in severities else ("medium" if severities else "normal")

    return {
        "session_id": str(session_id),
        "priority": priority,
        "requires_urgent_review": priority == "high",
        "red_flag_count": len(red_flags),
        "red_flags": [
            {
                "flag_type": flag.flag_type,
                "severity": flag.severity,
                "description": flag.description,
                "created_at": flag.created_at,
            }
            for flag in red_flags
        ],
    }

