from __future__ import annotations

import re
from typing import Any

from app.services.question_banks import get_question_bank


COMPLAINT_PREFIXES = {
    "chest_": "chest_pain",
    "fever_": "fever",
    "headache_": "headache",
    "cough_": "cough",
    "abdominal_": "abdominal_pain",
    "vomiting_": "vomiting",
    "diarrhoea_": "diarrhoea",
}


def normalize_text(value: Any) -> str:
    if value is None:
        return ""

    return re.sub(r"\s+", " ", str(value).strip().lower())


def infer_complaint_from_question(question_id: str) -> str | None:
    question_id = normalize_text(question_id)

    for prefix, complaint in COMPLAINT_PREFIXES.items():
        if question_id.startswith(prefix):
            return complaint

    return None


def get_answer_map(answers: Any) -> dict[str, str]:
    """
    Convert answer data into:

        {
            question_id: answer_text
        }

    Supports:

    - {"question_id": "answer"}
    - [{"question_id": "...", "answer_text": "..."}]
    - SQLAlchemy IntakeAnswer objects
    - ["question_id", "question_id"]

    The last format is used by older tests/code to represent
    already answered questions.
    """

    result: dict[str, str] = {}

    if answers is None:
        return result

    # Dictionary
    if isinstance(answers, dict):

        for key, value in answers.items():

            result[str(key)] = (
                "" if value is None else str(value)
            )

        return result

    # Single value
    if not isinstance(answers, (list, tuple)):
        answers = [answers]

    for item in answers:

        # ----------------------------------------------------
        # Dictionary answer
        # ----------------------------------------------------

        if isinstance(item, dict):

            question_id = (
                item.get("question_id")
                or item.get("question_key")
                or item.get("id")
            )

            answer = (
                item.get("answer_text")
                or item.get("answer")
                or ""
            )

            if question_id:

                result[str(question_id)] = str(answer)

            continue

        # ----------------------------------------------------
        # SQLAlchemy answer object
        # ----------------------------------------------------

        question_id = (
            getattr(item, "question_id", None)
            or getattr(item, "question_key", None)
        )

        if question_id:

            answer = (
                getattr(item, "answer_text", None)
                or getattr(item, "answer", None)
                or ""
            )

            result[str(question_id)] = str(answer)

            continue

        # ----------------------------------------------------
        # Old format:
        #
        # ["chest_location", "chest_onset"]
        #
        # Means these questions have been answered.
        # ----------------------------------------------------

        if isinstance(item, str):

            result[item] = ""

    return result


def get_complaint_from_answers(answers: Any) -> str | None:

    answer_map = get_answer_map(answers)

    for question_id in answer_map:

        complaint = infer_complaint_from_question(
            question_id
        )

        if complaint:
            return complaint

    return None


def is_yes_answer(answer: str) -> bool:

    text = normalize_text(answer)

    yes_words = [
        "yes",
        "yeah",
        "yep",
        "yup",
        "true",
        "present",
        "having",
        "i have",
        "i do",
    ]

    if text in yes_words:
        return True

    return any(
        text.startswith(word + " ")
        for word in yes_words
    )


def is_no_answer(answer: str) -> bool:

    text = normalize_text(answer)

    no_words = [
        "no",
        "nope",
        "nah",
        "false",
        "none",
        "absent",
    ]

    if text in no_words:
        return True

    return any(
        text.startswith(word + " ")
        for word in no_words
    )


def contains_any(
    text: str,
    keywords: list[str],
) -> bool:

    text = normalize_text(text)

    return any(
        keyword.lower() in text
        for keyword in keywords
    )


# ============================================================
# ADAPTIVE BRANCHING RULES
# ============================================================

BRANCH_RULES = {

    "chest_pain": [

        {
            "question": "chest_radiation",
            "condition": "yes",
            "next": "chest_radiation_detail",
        },

        {
            "question": "chest_radiation",
            "condition": "no",
            "next": "chest_severity",
        },

        {
            "question": "chest_character",
            "keywords": [
                "pressure",
                "tightness",
                "tight",
                "squeezing",
                "heavy",
                "crushing",
            ],
            "next": "chest_radiation",
        },

        {
            "question": "chest_associated",
            "keywords": [
                "breathing",
                "breathless",
                "shortness of breath",
                "sweating",
                "sweat",
                "nausea",
                "vomiting",
                "dizziness",
            ],
            "next": "chest_duration",
        },
    ],

    "fever": [

        {
            "question": "fever_chills",
            "condition": "yes",
            "next": "fever_pattern",
        },

        {
            "question": "fever_chills",
            "condition": "no",
            "next": "fever_pattern",
        },
    ],

    "cough": [

        {
            "question": "cough_breathing",
            "condition": "yes",
            "next": "cough_blood",
        },

        {
            "question": "cough_breathing",
            "condition": "no",
            "next": "cough_blood",
        },
    ],

    "abdominal_pain": [

        {
            "question": "abdominal_vomiting",
            "condition": "yes",
            "next": "abdominal_vomiting_frequency",
        },

        {
            "question": "abdominal_vomiting",
            "condition": "no",
            "next": None,
        },
    ],

    "vomiting": [

        {
            "question": "vomiting_pain",
            "condition": "yes",
            "next": "vomiting_pain_location",
        },

        {
            "question": "vomiting_pain",
            "condition": "no",
            "next": None,
        },
    ],

    "diarrhoea": [

        {
            "question": "diarrhoea_blood",
            "condition": "yes",
            "next": "diarrhoea_blood_details",
        },

        {
            "question": "diarrhoea_blood",
            "condition": "no",
            "next": "diarrhoea_pain",
        },
    ],
}


def get_branch_target(
    complaint: str,
    current_question_id: str,
    answer: str,
) -> str | None:

    rules = BRANCH_RULES.get(
        normalize_text(complaint),
        [],
    )

    for rule in rules:

        if rule["question"] != current_question_id:
            continue

        condition = rule.get("condition")

        if condition == "yes":
            if is_yes_answer(answer):
                return rule["next"]

        elif condition == "no":
            if is_no_answer(answer):
                return rule["next"]

        elif "keywords" in rule:

            if contains_any(
                answer,
                rule["keywords"],
            ):
                return rule["next"]

    return None


def get_adaptive_next_question(
    complaint: str,
    answers: Any,
    current_question_id: str | None = None,
):
    """
    Main adaptive question selector.

    Supports both:

        ["chest_location", "chest_onset"]

    and:

        [
            {
                "question_id": "chest_location",
                "answer_text": "middle of chest"
            }
        ]

    Branching is attempted first when a real answer is
    available. Otherwise the next unanswered question
    is selected sequentially.
    """

    bank = get_question_bank(complaint)

    if not bank:
        return None

    answer_map = get_answer_map(answers)

    # --------------------------------------------------------
    # Adaptive branch
    # --------------------------------------------------------

    if current_question_id:

        current_answer = answer_map.get(
            current_question_id,
            "",
        )

        # Only attempt branching when there is an actual
        # answer. Old answered-question lists have empty
        # strings and should simply continue sequentially.
        if current_answer:

            branch_target = get_branch_target(
                complaint,
                current_question_id,
                current_answer,
            )

            if branch_target:

                if branch_target not in answer_map:

                    for question in bank:

                        if question.get("id") == branch_target:

                            return question

    # --------------------------------------------------------
    # Sequential fallback
    # --------------------------------------------------------

    for question in bank:

        question_id = question.get("id")

        if question_id not in answer_map:

            return question

    return None


def get_progress(
    complaint: str,
    answers: Any,
) -> float:
    """
    Calculate progress.

    Supports both:

        get_progress("chest_pain", ["chest_location"])

    and the older:

        get_progress("chest_pain", 1)
    """

    bank = get_question_bank(complaint)

    if not bank:
        return 0.0

    # --------------------------------------------------------
    # Backward-compatible integer count
    # --------------------------------------------------------

    if isinstance(answers, int):

        return min(
            answers / len(bank),
            1.0,
        )

    # --------------------------------------------------------
    # Normal answer/question list
    # --------------------------------------------------------

    answer_map = get_answer_map(answers)

    answered = sum(
        1
        for question in bank
        if question.get("id") in answer_map
    )

    return min(
        answered / len(bank),
        1.0,
    )


def should_ask_followup(
    question_id: str,
    answer: str,
) -> bool:

    text = normalize_text(answer)

    keywords = [
        "yes",
        "pain",
        "severe",
        "breathing",
        "breathless",
        "shortness of breath",
        "blood",
        "vomiting",
        "dizziness",
        "fainting",
        "radiating",
        "spreading",
    ]

    return any(
        keyword in text
        for keyword in keywords
    )
