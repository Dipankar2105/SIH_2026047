QUESTION_BANKS = {
    "chest_pain": [
        {"id": "chest_location", "question": "Where exactly do you feel the chest pain?"},
        {"id": "chest_onset", "question": "When did the pain start?"},
        {"id": "chest_character", "question": "What does the pain feel like, such as pressure, burning, or stabbing?"},
        {"id": "chest_radiation", "question": "Does the pain spread to your arm, shoulder, jaw, back, or anywhere else?"},
        {"id": "chest_severity", "question": "On a scale of 0 to 10, how severe is the pain?"},
        {"id": "chest_associated", "question": "Do you have sweating, breathing difficulty, dizziness, nausea, or fainting?"},
    ],

    "fever": [
        {"id": "fever_onset", "question": "When did the fever start?"},
        {"id": "fever_temperature", "question": "Do you know your temperature?"},
        {"id": "fever_pattern", "question": "Is the fever continuous or does it come and go?"},
        {"id": "fever_chills", "question": "Do you have chills or shivering?"},
        {"id": "fever_associated", "question": "Do you have any other symptoms with the fever?"},
    ],

    "headache": [
        {"id": "headache_location", "question": "Where is the headache located?"},
        {"id": "headache_onset", "question": "When did the headache start?"},
        {"id": "headache_character", "question": "What does the headache feel like, such as throbbing, pressure, or stabbing?"},
        {"id": "headache_severity", "question": "On a scale of 0 to 10, how severe is the headache?"},
        {"id": "headache_associated", "question": "Do you have vomiting, weakness, numbness, vision problems, or dizziness?"},
    ],

    "cough": [
        {"id": "cough_onset", "question": "When did the cough start?"},
        {"id": "cough_type", "question": "Is the cough dry or are you bringing up mucus?"},
        {"id": "cough_duration", "question": "How often are you coughing?"},
        {"id": "cough_breathing", "question": "Are you having any difficulty breathing?"},
        {"id": "cough_blood", "question": "Have you noticed any blood while coughing?"},
    ],

    "abdominal_pain": [
        {"id": "abdominal_location", "question": "Where exactly is the abdominal pain?"},
        {"id": "abdominal_onset", "question": "When did the pain start?"},
        {"id": "abdominal_character", "question": "What does the pain feel like?"},
        {"id": "abdominal_severity", "question": "On a scale of 0 to 10, how severe is the pain?"},
        {"id": "abdominal_vomiting", "question": "Do you also have vomiting?"},
    ],

    "vomiting": [
        {"id": "vomiting_onset", "question": "When did the vomiting start?"},
        {"id": "vomiting_frequency", "question": "How many times have you vomited?"},
        {"id": "vomiting_content", "question": "What does the vomit contain?"},
        {"id": "vomiting_pain", "question": "Do you have any abdominal pain?"},
        {"id": "vomiting_dehydration", "question": "Are you able to keep fluids down?"},
    ],

    "diarrhoea": [
        {"id": "diarrhoea_onset", "question": "When did the diarrhoea start?"},
        {"id": "diarrhoea_frequency", "question": "How many loose stools have you had?"},
        {"id": "diarrhoea_blood", "question": "Is there any blood in the stool?"},
        {"id": "diarrhoea_pain", "question": "Do you have abdominal pain?"},
        {"id": "diarrhoea_dehydration", "question": "Are you experiencing excessive thirst, weakness, or reduced urination?"},
    ],
}


def normalize_complaint(complaint: str) -> str:
    value = complaint.lower().strip()

    aliases = {
        "chest": "chest_pain",
        "chest pain": "chest_pain",
        "temperature": "fever",
        "head pain": "headache",
        "stomach pain": "abdominal_pain",
        "stomach ache": "abdominal_pain",
        "loose motion": "diarrhoea",
        "loose motions": "diarrhoea",
        "vomit": "vomiting",
    }

    return aliases.get(value, value)


def get_question_bank(complaint: str):
    return QUESTION_BANKS.get(normalize_complaint(complaint), [])


def get_question(question_id: str, complaint: str):
    for question in get_question_bank(complaint):
        if question["id"] == question_id:
            return question
    return None
