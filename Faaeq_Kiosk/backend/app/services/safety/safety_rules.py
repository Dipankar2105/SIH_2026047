"""
Safety rules and emergency symptom keyword dictionary across 7 Indian languages.
"""

EMERGENCY_KEYWORD_RULES = [
    {
        "category": "cardiac",
        "specialty": "Cardiology",
        "severity": "emergency",
        "keywords": [
            "chest pain", "heart attack", "cardiac", "chest pressure",
            "छाती में दर्द", "सीने में दर्द", "दिल का दौरा",
            "छातीत दुखणे", "हृदयविकार",
            "நெஞ்சு வலி", "மாரடைப்பு",
            "ఛాతీ నొప్పి", "గుండెపోటు",
            "ಎದೆ ನೋವು", "ಹೃದಯಾಘಾತ",
            "বুকে ব্যথা", "হার্ট অ্যাটাক",
        ],
    },
    {
        "category": "respiratory",
        "specialty": "Pulmonology",
        "severity": "emergency",
        "keywords": [
            "breathless", "cannot breathe", "choking", "gasping", "suffocating",
            "सांस फूलना", "दम घुटना",
            "श्वास घेण्यास त्रास",
            "மூச்சுத்திணறல்",
            "శ్వాస ఆడకపోవడం",
            "ಉಸಿರಾಟದ ತೊಂದರೆ",
            "শ্বাসকষ্ট",
        ],
    },
    {
        "category": "neurological",
        "specialty": "Neurology",
        "severity": "emergency",
        "keywords": [
            "fainted", "unconscious", "paralysis", "stroke", "seizure", "convulsions",
            "बेहोश", "दौरा", "लकवा",
            "बेहोश", "झटका", "पक्षाघात",
            "மயக்கம்", "பக்கவாதம்", "வலிப்பு",
            "స్పృహ తప్పడం", "పక్షవాతం",
            "ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು", "ಪಾರ್ಶ್ವವಾಯು",
            "অজ্ঞান", "প্যারালাইসিস",
        ],
    },
    {
        "category": "trauma_bleeding",
        "specialty": "Emergency Medicine",
        "severity": "emergency",
        "keywords": [
            "severe bleeding", "profuse bleeding", "heavy bleeding", "deep wound",
            "भारी रक्तस्राव", "बहुत खून बहना",
            "रक्तस्त्राव", "जास्त रक्त वाहणे",
            "கடுமையான ரத்தப்போக்கு",
            "తీవ్ర రక్తస్రావం",
            "ತೀವ್ರ ರಕ್ತಸ್ರಾವ",
            "অতিরিক্ত রক্তক্ষরণ",
        ],
    },
]
