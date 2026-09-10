from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_voice_transcription_and_synthesis():
    # 1. Voice transcription
    transcribe_res = client.post(
        "/voice/transcribe",
        json={"language": "hi", "audio_base64": "UklGRiQAAABXQVZFZm10"},
    )
    assert transcribe_res.status_code == 200
    t_data = transcribe_res.json()
    assert "text" in t_data
    assert t_data["language"] == "hi"
    assert t_data["confidence"] > 0.8

    # 2. Voice synthesis
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
