import sys
from fastapi.testclient import TestClient
from app.main import app
from app.services.safety.red_flag_service import detect_red_flags
from app.services.indicconformer_asr import transcribe_audio as conformer_transcribe

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)


def test_sih_patch_complete_verification():
    # 1. Hindi native script transcript
    res_hi = client.post("/voice/transcribe", json={"language": "hi", "audio_base64": "UklGRiQAAABXQVZFZm10"})
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    assert "text" in data_hi
    assert "original_text" in data_hi
    assert data_hi["language"] == "hi"
    assert data_hi["confidence"] > 0.8
    # Native Devanagari characters range: \u0900-\u097F
    assert any('\u0900' <= char <= '\u097F' for char in data_hi["original_text"]), "Hindi must be Devanagari"
    print("[PASS] Hindi voice transcription native Devanagari:", data_hi["original_text"])

    # 2. Marathi native script transcript
    res_mr = client.post("/voice/transcribe", json={"language": "mr", "audio_base64": "UklGRiQAAABXQVZFZm10"})
    assert res_mr.status_code == 200
    data_mr = res_mr.json()
    assert "text" in data_mr
    assert "original_text" in data_mr
    assert data_mr["language"] == "mr"
    assert data_mr["confidence"] > 0.8
    assert any('\u0900' <= char <= '\u097F' for char in data_mr["original_text"]), "Marathi must be Devanagari"
    print("[PASS] Marathi voice transcription native Devanagari:", data_mr["original_text"])

    # 3. English voice transcript
    res_en = client.post("/voice/transcribe", json={"language": "en", "audio_base64": "UklGRiQAAABXQVZFZm10"})
    assert res_en.status_code == 200
    data_en = res_en.json()
    assert "text" in data_en
    assert "original_text" in data_en
    assert data_en["language"] == "en"
    print("[PASS] English voice transcription:", data_en["original_text"])

    # 4. Voice synthesis TTS in EN, HI, MR
    for lang, sample in [
        ("en", "Please describe your primary symptom"),
        ("hi", "कृपया अपनी मुख्य समस्या बताएं"),
        ("mr", "कृपया आपली मुख्य समस्या निवडा किंवा सांगा"),
    ]:
        synth = client.post("/voice/synthesize", json={"text": sample, "language": lang})
        assert synth.status_code == 200
        s_data = synth.json()
        assert s_data["audio_format"] == "wav"
        assert len(s_data["audio_base64"]) > 10
        print(f"[PASS] TTS Synthesis ({lang}): {len(s_data['audio_base64'])} bytes")

    # 5. Safety Negation Test (Part 19)
    # "I do not have difficulty breathing and I am not sweating."
    neg_msg = "I do not have difficulty breathing and I am not sweating."
    is_emerg, sev, spec, cat = detect_red_flags(neg_msg)
    assert not is_emerg, f"Negated symptom should NOT trigger emergency! got: {is_emerg}, {sev}"
    print("[PASS] Safety Negation Test: correctly identified non-emergency")

    # 6. Safety Emergency Test (Part 20)
    emerg_msg = "difficulty breathing, sweating, severe chest pain"
    is_emerg2, sev2, spec2, cat2 = detect_red_flags(emerg_msg)
    assert is_emerg2, "Emergency symptoms MUST trigger emergency!"
    assert sev2 in ("emergency", "high"), f"Expected high/emergency severity, got: {sev2}"
    print(f"[PASS] Safety Emergency Test: correctly identified emergency ({sev2}, {spec2})")

    # 7. IndicConformer module re-use check (Parts 13 & 14)
    res_conf = conformer_transcribe(language="mr")
    assert res_conf["language"] == "mr"
    assert "original_text" in res_conf
    assert any('\u0900' <= char <= '\u097F' for char in res_conf["original_text"])
    print("[PASS] IndicConformer wrapper reused successfully:", res_conf["original_text"])

if __name__ == "__main__":
    test_sih_patch_complete_verification()
    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
