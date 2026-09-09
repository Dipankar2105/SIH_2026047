from pathlib import Path
import sys

import torch
import soundfile as sf
import torchaudio
from transformers import AutoModel


MODEL_NAME = "ai4bharat/indic-conformer-600m-multilingual"
AUDIO_FILE = Path("test_audio.wav")
LANGUAGE = "hi"


def run_standalone_test():
    print("=" * 60)
    print("AarogyaFlow - IndicConformer ASR Test")
    print("=" * 60)

    print(f"PyTorch      : {torch.__version__}")
    print(f"Torchaudio   : {torchaudio.__version__}")
    print(f"Transformers : {__import__('transformers').__version__}")
    print("Device       : CPU")

    print("\nLoading IndicConformer model...")
    print("The first run may take several minutes while the model downloads.\n")

    try:
        model = AutoModel.from_pretrained(
            MODEL_NAME,
            trust_remote_code=True,
            local_files_only=True,
        )
        model.eval()

        print("MODEL LOADED SUCCESSFULLY")

    except Exception as e:
        print("\nMODEL LOADING FAILED")
        print(str(e))
        sys.exit(1)

    print("\nLoading audio...")

    if not AUDIO_FILE.exists():
        print(f"\nAUDIO FILE NOT FOUND: {AUDIO_FILE.resolve()}")
        sys.exit(1)

    try:
        audio, sample_rate = sf.read(
            str(AUDIO_FILE),
            dtype="float32"
        )

        print(f"Original sample rate : {sample_rate} Hz")
        print(f"Audio shape          : {audio.shape}")

        # Convert stereo -> mono
        if audio.ndim > 1:
            audio = audio.mean(axis=1)

        # Convert NumPy array to PyTorch tensor
        wav = torch.from_numpy(audio).unsqueeze(0)

        target_sample_rate = 16000

        if sample_rate != target_sample_rate:
            print(
                f"Resampling {sample_rate} Hz -> "
                f"{target_sample_rate} Hz..."
            )

            resampler = torchaudio.transforms.Resample(
                orig_freq=sample_rate,
                new_freq=target_sample_rate
            )

            wav = resampler(wav)

        print(f"Final audio shape    : {wav.shape}")
        print(f"Final sample rate    : {target_sample_rate} Hz")

    except Exception as e:
        print("\nAUDIO LOADING FAILED")
        print(str(e))
        sys.exit(1)

    print("\nRunning IndicConformer CTC inference...")
    print(f"Language             : {LANGUAGE}")

    try:
        with torch.inference_mode():
            transcription_ctc = model(
                wav,
                LANGUAGE,
                "ctc"
            )

        print("\n" + "=" * 60)
        print("CTC TRANSCRIPTION")
        print("=" * 60)
        print(transcription_ctc)

    except Exception as e:
        print("\nCTC INFERENCE FAILED")
        print(str(e))
        sys.exit(1)

    print("\nRunning IndicConformer RNNT inference...")

    try:
        with torch.inference_mode():
            transcription_rnnt = model(
                wav,
                LANGUAGE,
                "rnnt"
            )

        print("\n" + "=" * 60)
        print("RNNT TRANSCRIPTION")
        print("=" * 60)
        print(transcription_rnnt)

    except Exception as e:
        print("\nRNNT INFERENCE FAILED")
        print(str(e))
        sys.exit(1)

    print("\n" + "=" * 60)
    print("INDICCONFORMER ASR TEST PASSED")
    print("=" * 60)
    print("Audio was successfully loaded and transcribed.")


if __name__ == "__main__":
    run_standalone_test()

