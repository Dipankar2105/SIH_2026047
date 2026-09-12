from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_voice_transcription_and_synthesis():
    # 1. Voice transcription (Hindi native Devanagari)
    transcribe_res = client.post(
        "/voice/transcribe",
        json={"language": "hi", "audio_base64": "UklGRiQAAABXQVZFZm10"},
    )
    assert transcribe_res.status_code == 200
    t_data = transcribe_res.json()
    assert "text" in t_data
    assert "original_text" in t_data
    assert t_data["language"] == "hi"
    assert t_data["confidence"] > 0.8
    assert "पेट" in t_data["text"]  # Verify Devanagari native script

    # 1b. Voice transcription (Marathi native Devanagari)
    mr_transcribe_res = client.post(
        "/voice/transcribe",
        json={"language": "mr", "audio_base64": "UklGRiQAAABXQVZFZm10"},
    )
    assert mr_transcribe_res.status_code == 200
    mr_t_data = mr_transcribe_res.json()
    assert "text" in mr_t_data
    assert "original_text" in mr_t_data
    assert mr_t_data["language"] == "mr"
    assert "पोटात" in mr_t_data["text"]  # Verify Devanagari native script


    # 2. Voice synthesis (Hindi)
    synth_res = client.post(
        "/voice/synthesize",
        json={
            "text": "कृपया अपनी मुख्य समस्या बताएं",
            "language": "hi",
            "voice_gender": "female",
        },
    )
    assert synth_res.status_code == 200
    s_data = synth_res.json()
    assert s_data["audio_format"] == "wav"
    assert "audio_base64" in s_data
    assert len(s_data["audio_base64"]) > 10

    # 3. Voice synthesis (Marathi - authentic gTTS/ffmpeg)
    mr_synth_res = client.post(
        "/voice/synthesize",
        json={
            "text": "कृपया आपली मुख्य समस्या निवडा किंवा सांगा.",
            "language": "mr",
            "voice_gender": "female",
        },
    )
    assert mr_synth_res.status_code == 200
    mr_data = mr_synth_res.json()
    assert mr_data["audio_format"] == "wav"
    assert len(mr_data["audio_base64"]) > 100
