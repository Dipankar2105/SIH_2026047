from dataclasses import dataclass


@dataclass
class SafetyFinding:
    rule_id: str
    severity: str
    details: str


RULES = {
    "chest_pain": [
        (
            "chest_breathing",
            ["difficulty breathing", "breathing difficulty", "shortness of breath", "trouble breathing", "difficulty in breathing", "breathlessness", "hard to breathe"],
            "high",
            "Breathing difficulty reported with chest pain.",
        ),
        (
            "chest_radiation",
            ["left arm", "both arms", "jaw", "shoulder", "back"],
            "high",
            "Chest pain is reported as spreading to another area.",
        ),
        (
            "chest_fainting",
            ["fainting", "passed out", "loss of consciousness"],
            "high",
            "Fainting or loss of consciousness reported.",
        ),
        (
            "chest_sweating",
            ["cold sweat", "heavy sweating", "sweating"],
            "medium",
            "Sweating reported with chest symptoms.",
        ),
    ],

    "headache": [
        (
            "headache_sudden_severe",
            ["worst headache", "sudden severe", "sudden and severe"],
            "high",
            "Sudden or unusually severe headache reported.",
        ),
        (
            "headache_neurological",
            ["weakness", "paralysis", "one side", "numbness"],
            "high",
            "Neurological symptoms reported with headache.",
        ),
        (
            "headache_vision",
            ["loss of vision", "vision loss", "blurred vision"],
            "high",
            "Vision changes reported with headache.",
        ),
    ],

    "cough": [
        (
            "cough_breathing",
            ["difficulty breathing", "breathing difficulty", "shortness of breath", "trouble breathing", "breathlessness"],
            "high",
            "Breathing difficulty reported.",
        ),
        (
            "cough_blood",
            ["coughing blood", "blood while coughing", "blood in cough"],
            "high",
            "Blood reported while coughing.",
        ),
    ],

    "vomiting": [
        (
            "vomiting_fluids",
            ["cannot keep fluids", "unable to keep fluids", "cannot keep water"],
            "high",
            "Unable to keep fluids down.",
        ),
    ],

    "diarrhoea": [
        (
            "diarrhoea_blood",
            ["blood in stool", "blood in the stool", "bloody stool", "blood is passing in stool", "blood passing in stool", "blood stool"],
            "high",
            "Blood reported in stool.",
        ),
        (
            "diarrhoea_dehydration",
            ["severe dehydration", "very weak", "reduced urination", "not urinating"],
            "high",
            "Possible significant dehydration reported.",
        ),
    ],
}


NEGATION_PATTERNS = ["not ", "no ", "denies ", "without ", "free of ", "neither "]

def check_answer(complaint: str, question_id: str, answer: str):
    complaint = complaint.lower().strip()
    answer = answer.lower().strip()

    findings = []

    for rule_id, keywords, severity, details in RULES.get(complaint, []):
        matched = False
        for keyword in keywords:
            if keyword in answer:
                negated = False
                for neg in NEGATION_PATTERNS:
                    if f"{neg}{keyword}" in answer or f"{neg}having {keyword}" in answer or f"{neg}any {keyword}" in answer or f"{neg}have {keyword}" in answer:
                        negated = True
                        break
                if keyword in ["sweating", "cold sweat", "heavy sweating"] and ("not sweating" in answer or "no sweating" in answer or "without sweating" in answer):
                    negated = True
                if keyword in ["difficulty breathing", "breathing difficulty", "shortness of breath"] and ("breathe normally" in answer or "normal breathing" in answer or "no difficulty" in answer or "not having difficulty" in answer):
                    negated = True

                if not negated:
                    matched = True
                    break

        if matched:
            findings.append(
                SafetyFinding(
                    rule_id=rule_id,
                    severity=severity,
                    details=details,
                )
            )

    return findings


def calculate_priority(findings):
    if any(f.severity == "high" for f in findings):
        return "high"

    if findings:
        return "medium"

    return "normal"

