from app.services.voice_client import (
    evaluate_voice_confidence,
    prepare_synthesis_text,
)


def test_low_confidence():
    assert evaluate_voice_confidence(0.50) is True


def test_good_confidence():
    assert evaluate_voice_confidence(0.90) is False


def test_text_cleanup():
    assert prepare_synthesis_text(
        "  hello   world  "
    ) == "hello world"
