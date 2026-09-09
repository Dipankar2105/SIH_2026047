from app.services.question_banks import get_question_bank

from app.services.adaptive_engine import (
    get_adaptive_next_question,
    get_answer_map,
    get_progress,
)


def get_first_question(complaint: str):

    bank = get_question_bank(complaint)

    if not bank:
        return None

    return bank[0]


def get_next_question(
    complaint: str,
    current_question_id: str,
    answers=None,
):
    """
    Backward-compatible next-question function.

    If answers are supplied, adaptive branching is used.

    If answers are not supplied, the function follows the
    original sequential question-bank behaviour.
    """

    bank = get_question_bank(complaint)

    if not bank:
        return None

    # --------------------------------------------------------
    # Preserve old behaviour
    # --------------------------------------------------------

    if answers is None:

        for index, question in enumerate(bank):

            if question.get("id") == current_question_id:

                if index + 1 < len(bank):
                    return bank[index + 1]

                return None

        return None

    # --------------------------------------------------------
    # New adaptive behaviour
    # --------------------------------------------------------

    return get_adaptive_next_question(
        complaint=complaint,
        answers=answers,
        current_question_id=current_question_id,
    )


def get_adaptive_question(
    complaint: str,
    answers=None,
    current_question_id=None,
):

    if answers is None:
        answers = []

    return get_adaptive_next_question(
        complaint=complaint,
        answers=answers,
        current_question_id=current_question_id,
    )


def get_question_progress(
    complaint: str,
    answers=None,
):

    if answers is None:
        answers = []

    return get_progress(
        complaint,
        answers,
    )


def get_answered_question_ids(
    answers=None,
):

    if answers is None:
        answers = []

    return list(
        get_answer_map(answers).keys()
    )
