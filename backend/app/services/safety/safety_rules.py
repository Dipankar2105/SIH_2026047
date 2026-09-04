from typing import List, Dict, Any

RED_FLAG_RULES = [
    {
        "rule_id": "RF-001",
        "keywords": ["chest pain", "heart attack", "crushing pain", "tightness in chest"],
        "severity": "CRITICAL",
        "recommendation": "Direct patient to Emergency Room / Triage Nurse immediately. Alert ER Doctor."
    },
    {
        "rule_id": "RF-002",
        "keywords": ["shortness of breath", "difficulty breathing", "choking", "gasping"],
        "severity": "CRITICAL",
        "recommendation": "Check SpO2 immediately & provide oxygen support."
    },
    {
        "rule_id": "RF-003",
        "keywords": ["stroke", "facial drooping", "slurred speech", "numbness one side"],
        "severity": "CRITICAL",
        "recommendation": "Activate Stroke Protocol."
    },
    {
        "rule_id": "RF-004",
        "keywords": ["high fever", "chills", "stiff neck"],
        "severity": "HIGH",
        "recommendation": "Fast-track general OPD consultation for infectious disease check."
    }
]
