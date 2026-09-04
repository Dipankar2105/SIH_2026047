from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_voice_asr_and_tts():
    # Test ASR transcription endpoint
    files = {'file': ('sample.wav', b'fake audio data', 'audio/wav')}
    data = {'language': 'hi'}
    asr_resp = client.post("/api/v1/voice/asr", files=files, data=data)
    assert asr_resp.status_code == 200
    assert "transcription" in asr_resp.json()["data"]

    # Test TTS synthesis endpoint
    tts_resp = client.post("/api/v1/voice/tts?text=Welcome+to+Medikiosk&language=en")
    assert tts_resp.status_code == 200
    assert "audio_url" in tts_resp.json()["data"]
