from pathlib import Path
import pytest
from unittest.mock import MagicMock

from app.services.asr_engine import transcribe_speech
from app.services.translation_engine import translate_to_english, translate_from_english
from app.services.language_id import detect_language
from app.services.safety_engine import check_answer, calculate_priority
from app.services.tts_engine import synthesize_speech
from app.services.ocr_client import process_document_ocr
from app.services.ayush_question_banks import get_ayush_questions, build_ayush_mapping
from app.services.voice_client import evaluate_voice_confidence


AUDIO_FILE = Path("test_audio.wav")


def test_matrix_1_english_text_flow():
    text = "I have chest pain"
    lang = detect_language(text)
    assert lang == "en"
    findings = check_answer("chest_pain", "chest_location", text)
    priority = calculate_priority(findings)
    assert priority == "normal"


def test_matrix_2_hindi_text_translation_flow():
    hindi_text = "मुझे सीने में दर्द है"
    lang = detect_language(hindi_text)
    assert lang == "hi"
    english_text = translate_to_english(hindi_text, source_lang=lang)
    assert "chest pain" in english_text.lower()
    hindi_response = translate_from_english(english_text, target_lang="hi")
    assert hindi_response is not None


def test_matrix_3_marathi_text_translation_flow():
    marathi_text = "माझ्या छातीत दुखत आहे"
    lang = detect_language(marathi_text)
    assert lang == "mr"
    english_text = translate_to_english(marathi_text, source_lang=lang)
    assert "chest pain" in english_text.lower()
    marathi_response = translate_from_english(english_text, target_lang="mr")
    assert marathi_response is not None


def test_matrix_4_hindi_voice_asr():
    if AUDIO_FILE.exists():
        res = transcribe_speech(AUDIO_FILE, language="hi")
        assert res["language"] == "hi"
        assert res["text"] is not None


def test_matrix_5_marathi_voice_asr():
    if AUDIO_FILE.exists():
        res = transcribe_speech(AUDIO_FILE, language="mr")
        assert res["language"] == "mr"
        assert res["text"] is not None


def test_matrix_6_english_voice_asr():
    if AUDIO_FILE.exists():
        res = transcribe_speech(AUDIO_FILE, language="en")
        assert res["language"] == "en"
        assert res["text"] is not None


def test_matrix_7_hindi_voice_tts_response():
    prompt = "आपको सीने में दर्द ठीक कहाँ महसूस हो रहा है?"
    audio_bytes = synthesize_speech(prompt, language="hi")
    assert audio_bytes is not None
    assert len(audio_bytes) > 0


def test_matrix_8_marathi_voice_tts_response():
    prompt = "तुम्हाला छातीत नक्की कुठे दुखत आहे?"
    audio_bytes = synthesize_speech(prompt, language="mr")
    assert audio_bytes is not None
    assert len(audio_bytes) > 0


def test_matrix_9_chest_pain_breathing_high_priority():
    findings = check_answer("chest_pain", "chest_associated", "I have difficulty breathing and sweating")
    assert len(findings) > 0
    priority = calculate_priority(findings)
    assert priority == "high"


def test_matrix_10_hosted_ocr_integration():
    sample_doc = b"%PDF-1.4 sample medical document"
    res = process_document_ocr(sample_doc, filename="sample.pdf")
    assert res["status"] == "success"
    assert "extracted_text" in res


def test_matrix_11_low_confidence_fallback():
    assert evaluate_voice_confidence(0.50) is True
    assert evaluate_voice_confidence(0.90) is False


def test_matrix_12_ayush_dashavidha_mapping():
    questions = get_ayush_questions()
    assert len(questions) == 19
    answers = [
        {"question_id": "ayush_prakriti", "answer": "Medium build"},
        {"question_id": "ayush_vikriti", "answer": "Appetite loss"},
    ]
    mapping = build_ayush_mapping(answers)
    assert mapping["prakriti"] == "Medium build"
    assert mapping["vikriti"] == "Appetite loss"


def test_matrix_13_track_a_handoff_contract():
    findings = check_answer("chest_pain", "chest_associated", "I have difficulty breathing")
    priority = calculate_priority(findings)
    contract = {
        "session_id": "test-uuid",
        "priority": priority,
        "requires_urgent_review": priority == "high",
        "red_flag_count": len(findings),
    }
    assert contract["priority"] == "high"
    assert contract["requires_urgent_review"] is True


def test_matrix_14_track_c_handoff_contract():
    ayush_answers = [
        {"question_id": "ayush_prakriti", "answer": "Pitta build"},
        {"question_id": "ayush_appetite", "answer": "Low"},
    ]
    mapping = build_ayush_mapping(ayush_answers)
    summary_contract = {
        "session_id": "test-uuid",
        "status": "completed",
        "total_answers": 2,
        "ayush_dashavidha_mapping": mapping,
    }
    assert summary_contract["ayush_dashavidha_mapping"]["prakriti"] == "Pitta build"
