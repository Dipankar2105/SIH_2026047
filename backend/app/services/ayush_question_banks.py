# AarogyaFlow Track B
# AYUSH Question Bank
#
# Purpose:
# Structured AYUSH history-taking using Dashavidha
# Pariksha-oriented categories.
#
# IMPORTANT:
# This module only collects patient information.
# It does not diagnose or determine emergency status.
# Safety/triage remains handled by the deterministic
# safety engine.

AYUSH_GENERAL_BANK = [

    # ------------------------------------------------
    # 1. Prakriti
    # ------------------------------------------------

    {
        "id": "ayush_prakriti",
        "question": "How would you describe your usual body build and general nature?",
        "category": "prakriti",
        "pariksha": "Prakriti",
    },

    # ------------------------------------------------
    # 2. Vikriti / Present condition
    # ------------------------------------------------

    {
        "id": "ayush_vikriti",
        "question": "What changes or discomfort have you noticed compared with your usual health?",
        "category": "vikriti",
        "pariksha": "Vikriti",
    },

    {
        "id": "ayush_symptoms",
        "question": "What is the main symptom or discomfort you want to discuss?",
        "category": "presenting_complaint",
        "pariksha": "Vikriti",
    },

    # ------------------------------------------------
    # 3. Sara
    # ------------------------------------------------

    {
        "id": "ayush_sara",
        "question": "How would you describe the general strength and quality of your body, such as your muscles, skin and overall nourishment?",
        "category": "sara",
        "pariksha": "Sara",
    },

    # ------------------------------------------------
    # 4. Samhanana
    # ------------------------------------------------

    {
        "id": "ayush_samhanana",
        "question": "How would you describe your usual body structure and muscle development?",
        "category": "samhanana",
        "pariksha": "Samhanana",
    },

    # ------------------------------------------------
    # 5. Pramana
    # ------------------------------------------------

    {
        "id": "ayush_pramana",
        "question": "What are your approximate height and weight?",
        "category": "pramana",
        "pariksha": "Pramana",
    },

    # ------------------------------------------------
    # 6. Satmya
    # ------------------------------------------------

    {
        "id": "ayush_satmya",
        "question": "Are there any foods, daily habits or routines that suit you particularly well or cause discomfort?",
        "category": "satmya",
        "pariksha": "Satmya",
    },

    # ------------------------------------------------
    # 7. Satva
    # ------------------------------------------------

    {
        "id": "ayush_satva",
        "question": "How would you describe your usual mental strength and ability to handle stress?",
        "category": "satva",
        "pariksha": "Satva",
    },

    # ------------------------------------------------
    # 8. Ahara Shakti
    # ------------------------------------------------

    {
        "id": "ayush_appetite",
        "question": "How is your appetite usually?",
        "category": "ahara_shakti",
        "pariksha": "Ahara Shakti",
    },

    {
        "id": "ayush_digestion",
        "question": "How is your digestion after meals?",
        "category": "digestion",
        "pariksha": "Ahara Shakti",
    },

    # ------------------------------------------------
    # 9. Vyayama Shakti
    # ------------------------------------------------

    {
        "id": "ayush_activity",
        "question": "How would you describe your usual physical activity and exercise capacity?",
        "category": "vyayama_shakti",
        "pariksha": "Vyayama Shakti",
    },

    # ------------------------------------------------
    # 10. Vaya
    # ------------------------------------------------

    {
        "id": "ayush_vaya",
        "question": "What is your age group or approximate age?",
        "category": "vaya",
        "pariksha": "Vaya",
    },

    # ------------------------------------------------
    # Additional general AYUSH history
    # ------------------------------------------------

    {
        "id": "ayush_sleep",
        "question": "How has your sleep been recently?",
        "category": "sleep",
        "pariksha": "Lifestyle",
    },

    {
        "id": "ayush_thirst",
        "question": "How is your thirst compared with usual?",
        "category": "thirst",
        "pariksha": "Lifestyle",
    },

    {
        "id": "ayush_bowel",
        "question": "How are your bowel movements compared with usual?",
        "category": "bowel",
        "pariksha": "Lifestyle",
    },

    {
        "id": "ayush_urination",
        "question": "Have you noticed any recent changes in urination?",
        "category": "urination",
        "pariksha": "Lifestyle",
    },

    {
        "id": "ayush_mental_state",
        "question": "Have you noticed any recent changes in stress, mood or mental wellbeing?",
        "category": "mental_wellbeing",
        "pariksha": "Satva",
    },

    {
        "id": "ayush_duration",
        "question": "How long have you been experiencing your main problem?",
        "category": "duration",
        "pariksha": "Vikriti",
    },

    # ------------------------------------------------
    # Optional symptom details
    # ------------------------------------------------

    {
        "id": "ayush_severity",
        "question": "How severe is the main discomfort on a scale from 0 to 10?",
        "category": "severity",
        "pariksha": "Vikriti",
    },

]


# ----------------------------------------------------
# Basic bank access
# ----------------------------------------------------

def get_ayush_questions():
    return AYUSH_GENERAL_BANK


def get_first_ayush_question():
    return AYUSH_GENERAL_BANK[0]


# ----------------------------------------------------
# Simple answer normalization
# ----------------------------------------------------

def _normalize_answer(answer):
    if answer is None:
        return ""

    return str(answer).strip().lower()


# ----------------------------------------------------
# Determine whether an optional question is relevant
# ----------------------------------------------------

def should_include_ayush_question(
    question,
    answers_by_id,
):
    """
    Determines whether an AYUSH question should be asked.

    The current AYUSH tree is intentionally conservative.
    Most Dashavidha Pariksha questions are always relevant.

    This function is kept separate so more detailed
    branching can be added later without changing the
    intake router.
    """

    question_id = question["id"]

    # These questions are currently always included.
    always_include = {
        "ayush_prakriti",
        "ayush_vikriti",
        "ayush_symptoms",
        "ayush_sara",
        "ayush_samhanana",
        "ayush_pramana",
        "ayush_satmya",
        "ayush_satva",
        "ayush_appetite",
        "ayush_digestion",
        "ayush_activity",
        "ayush_vaya",
        "ayush_sleep",
        "ayush_thirst",
        "ayush_bowel",
        "ayush_urination",
        "ayush_mental_state",
        "ayush_duration",
        "ayush_severity",
    }

    if question_id in always_include:
        return True

    return True


# ----------------------------------------------------
# Adaptive next-question selection
# ----------------------------------------------------

def get_next_ayush_question(
    current_question_id: str,
    answered_ids: list[str],
    answers_by_id: dict | None = None,
):
    """
    Return the next unanswered AYUSH question.

    answers_by_id is accepted for future adaptive
    branching and backwards compatibility.
    """

    answered = set(answered_ids)

    if answers_by_id is None:
        answers_by_id = {}

    current_index = -1

    for index, question in enumerate(AYUSH_GENERAL_BANK):
        if question["id"] == current_question_id:
            current_index = index
            break

    if current_index == -1:
        return None

    for next_index in range(
        current_index + 1,
        len(AYUSH_GENERAL_BANK),
    ):
        candidate = AYUSH_GENERAL_BANK[next_index]

        if candidate["id"] in answered:
            continue

        if not should_include_ayush_question(
            candidate,
            answers_by_id,
        ):
            continue

        return candidate

    return None


# ----------------------------------------------------
# AYUSH category lookup
# ----------------------------------------------------

def get_ayush_question_by_id(question_id: str):
    for question in AYUSH_GENERAL_BANK:
        if question["id"] == question_id:
            return question

    return None


def get_ayush_pariksha_category(question_id: str):
    question = get_ayush_question_by_id(question_id)

    if not question:
        return None

    return question.get("pariksha")


# ----------------------------------------------------
# Structured AYUSH mapping
# ----------------------------------------------------

def build_ayush_mapping(answers):
    """
    Convert collected AYUSH answers into a structured
    Dashavidha-oriented dictionary.

    This is useful later for Track C summary generation.
    """

    result = {
        "prakriti": None,
        "vikriti": None,
        "sara": None,
        "samhanana": None,
        "pramana": None,
        "satmya": None,
        "satva": None,
        "ahara_shakti": None,
        "vyayama_shakti": None,
        "vaya": None,
    }

    category_map = {
        "ayush_prakriti": "prakriti",
        "ayush_vikriti": "vikriti",
        "ayush_sara": "sara",
        "ayush_samhanana": "samhanana",
        "ayush_pramana": "pramana",
        "ayush_satmya": "satmya",
        "ayush_satva": "satva",
        "ayush_appetite": "ahara_shakti",
        "ayush_digestion": "ahara_shakti",
        "ayush_activity": "vyayama_shakti",
        "ayush_vaya": "vaya",
    }

    for answer in answers:
        question_id = getattr(
            answer,
            "question_key",
            None,
        )

        answer_text = getattr(
            answer,
            "answer",
            None,
        )

        if isinstance(answer, dict):
            question_id = answer.get(
                "question_id",
                answer.get("question_key"),
            )

            answer_text = answer.get(
                "answer",
                answer.get("answer_text"),
            )

        if question_id in category_map:
            key = category_map[question_id]

            # Preserve multiple answers where necessary.
            if result[key] is None:
                result[key] = answer_text
            else:
                result[key] = (
                    str(result[key])
                    + "; "
                    + str(answer_text)
                )

    return result
