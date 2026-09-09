import os
os.environ["HF_HOME"] = r"D:\HuggingFace"
os.environ["HF_HUB_CACHE"] = r"D:\HuggingFace\hub"
os.environ["TRANSFORMERS_CACHE"] = r"D:\HuggingFace\transformers"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

from pathlib import Path
from typing import Literal

import soundfile as sf
import torch
import torchaudio
import huggingface_hub.constants
huggingface_hub.constants.HF_HUB_OFFLINE = True
huggingface_hub.constants.HF_HUB_CACHE = r"D:\HuggingFace\hub"

from transformers import AutoModel
from app.config import settings

MODEL_NAME = "ai4bharat/indic-conformer-600m-multilingual"

SUPPORTED_LANGUAGES = {
    "hi": "Hindi",
    "mr": "Marathi",
}

MODEL = None


def load_model():
    """
    Load IndicConformer only once and keep it in memory.
    Checks D: drive HF cache first, then C: drive fallback with local_files_only=True.
    """

    global MODEL

    if MODEL is None:
        print("Loading IndicConformer model...")
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
        huggingface_hub.constants.HF_HUB_OFFLINE = True

        # 1. Try D: drive cache first with local_files_only=True
        try:
            MODEL = AutoModel.from_pretrained(
                MODEL_NAME,
                trust_remote_code=True,
                local_files_only=True,
                cache_dir=settings.hf_hub_cache,
            )
        except Exception:
            # 2. Try default/C: drive cache with local_files_only=True
            try:
                MODEL = AutoModel.from_pretrained(
                    MODEL_NAME,
                    trust_remote_code=True,
                    local_files_only=True,
                )
            except Exception:
                # 3. Standard load with D: drive cache
                print("Local cache lookup failed, loading model from default HF cache...")
                MODEL = AutoModel.from_pretrained(
                    MODEL_NAME,
                    trust_remote_code=True,
                    cache_dir=settings.hf_hub_cache,
                )

        MODEL.eval()

        print("IndicConformer model loaded successfully.")

    return MODEL


def load_audio(audio_path: str | Path):
    """
    Load audio using SoundFile.

    Converts:
    - stereo -> mono
    - any sample rate -> 16000 Hz
    """

    audio_path = Path(audio_path)

    if not audio_path.exists():
        raise FileNotFoundError(
            f"Audio file not found: {audio_path}"
        )

    audio, sample_rate = sf.read(
        str(audio_path),
        dtype="float32",
    )

    # Stereo -> mono
    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    waveform = torch.from_numpy(audio).unsqueeze(0)

    target_sample_rate = 16000

    if sample_rate != target_sample_rate:
        resampler = torchaudio.transforms.Resample(
            orig_freq=sample_rate,
            new_freq=target_sample_rate,
        )

        waveform = resampler(waveform)

    return waveform, target_sample_rate


def transcribe_audio(
    audio_path: str | Path,
    language: Literal["hi", "mr"] = "hi",
):
    """
    Transcribe an audio file using IndicConformer.

    language:
        hi = Hindi
        mr = Marathi
    """

    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Unsupported language '{language}'. "
            f"Supported languages: {list(SUPPORTED_LANGUAGES.keys())}"
        )

    model = load_model()

    waveform, sample_rate = load_audio(audio_path)

    print(
        f"Running IndicConformer CTC inference "
        f"for language: {language}"
    )

    with torch.inference_mode():
        transcription = model(
            waveform,
            language,
            "ctc",
        )

    return {
        "text": str(transcription).strip(),
        "language": language,
        "language_name": SUPPORTED_LANGUAGES[language],
        "sample_rate": sample_rate,
        "model": MODEL_NAME,
    }
