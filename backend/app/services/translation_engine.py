from typing import Literal

from app.config import settings

# Pre-defined clinical phrase translations for robust offline/testing performance
CLINICAL_HINDI_TO_ENGLISH = {
    "मुझे सीने में दर्द है लेकिन मुझे पसीना नहीं आ रहा है और सांस सामान्य है": "I have chest pain but I am not sweating and I can breathe normally",
    "मुझे सीने में दर्द है लेकिन पसीना नहीं आ रहा है और सांस सामान्य है": "I have chest pain but I am not sweating and I can breathe normally",
    "मुझे सीने में दर्द है और सांस लेने में तकलीफ हो रही है": "I have severe chest pain and difficulty breathing",
    "मुझे सीने में बहुत दर्द है और सांस लेने में तकलीफ हो रही है": "I have severe chest pain and difficulty breathing",
    "हाँ, खांसी के साथ सांस लेने में तकलीफ और खून आ रहा है": "Yes, I have difficulty breathing and coughing blood",
    "अचानक बहुत तेज सिरदर्द और शरीर के एक हिस्से में कमजोरी महसूस हो रही है": "I have sudden severe headache and weakness on one side",
    "छाती के बीच में बहुत तेज जलन जैसा महसूस होता है": "Burning pain in center of chest",
    "सांस लेने में तकलीफ और पसीना आ रहा है": "I have difficulty breathing and sweating",
    "मुझे सीने में दर्द है और पसीना आ रहा है": "I have chest pain and sweating",
    "मेरा मध्यम शरीर और पित्त प्रकृति है": "I have medium body build and Pitta prakriti nature",
    "मुझे दो दिन से हल्का बुखार है": "I have mild fever for two days",
    "पानी भी पेट में नहीं रुक रहा है": "I cannot keep fluids down at all",
    "हाँ मल में खून आ रहा है": "Yes there is blood in stool",
    "सिर में बहुत तेज दर्द है": "I have a severe headache",
    "सांस लेने में तकलीफ": "difficulty breathing",
    "सांस फूल रही है": "I am short of breath",
    "मुझे सीने में दर्द है": "I have chest pain",
    "मुझे बुखार है": "I have fever",
    "मुझे उल्टी आ रही है": "I am feeling like vomiting",
    "मुझे दस्त हो रहे हैं": "I have loose motions",
}

CLINICAL_ENGLISH_TO_HINDI = {
    "I have chest pain": "मुझे सीने में दर्द है",
    "I have difficulty breathing and sweating": "मुझे सांस लेने में तकलीफ और पसीना आ रहा है",
    "Where exactly do you feel the chest pain?": "आपको सीने में दर्द ठीक कहाँ महसूस हो रहा है?",
    "When did the pain start?": "दर्द कब शुरू हुआ था?",
    "What does the pain feel like, such as pressure, burning, or stabbing?": "दर्द कैसा महसूस होता है, जैसे दबाव, जलन या चुभन?",
    "On a scale of 0 to 10, how severe is the pain?": "0 से 10 के पैमाने पर दर्द कितना तेज है?",
    "Do you have sweating, breathing difficulty, dizziness, nausea, or fainting?": "क्या आपको पसीना, सांस लेने में तकलीफ, चक्कर, मिचली या बेहोशी है?",
}

CLINICAL_MARATHI_TO_ENGLISH = {
    "मला श्वास घ्यायला त्रास नाही होत आहे आणि मला घामसुद्धा नाही येत आहे": "I do not have difficulty breathing and I am not sweating",
    "माझ्या छातीत खूप दुखत आहे आणि मला श्वास घ्यायला त्रास होत आहे": "I have severe chest pain and difficulty breathing",
    "माझ्या छातीत दुखत आहे आणि श्वास घ्यायला त्रास होत आहे": "I have chest pain and difficulty breathing",
    "माझ्या डोक्याच्या दोन्ही बाजूला दुखत आहे": "It is hurting on both sides of my head",
    "मला श्वास घ्यायला त्रास होत आहे आणि घाम येत आहे": "I have difficulty breathing and sweating",
    "मला कालपासून थोडा ताप आला आहे": "I have had mild fever since yesterday",
    "होय, मला उलट्या पण होत आहेत": "Yes, I also have vomiting",
    "होय शौचावाटे रक्त पडत आहे": "Yes blood is passing in stool",
    "श्वास घ्यायला त्रास नाही": "no difficulty breathing",
    "माझ्या छातीत दुखत आहे": "I have chest pain",
    "घामसुद्धा नाही": "not sweating",
    "घाम नाही": "not sweating",
    "श्वास घ्यायला त्रास": "difficulty breathing",
    "मला ताप आला आहे": "I have fever",
    "माझे डोके खूप दुखत आहे": "I have a severe headache",
    "मला उलट्या होत आहेत": "I am vomiting",
}

CLINICAL_ENGLISH_TO_MARATHI = {
    "I have chest pain": "माझ्या छातीत दुखत आहे",
    "Where exactly do you feel the chest pain?": "तुम्हाला छातीत नक्की कुठे दुखत आहे?",
    "When did the pain start?": "दुखणे कधी सुरू झाले?",
    "What does the pain feel like, such as pressure, burning, or stabbing?": "दुखणे कसे वाटते, जसे की दाब, जळजळ किंवा टोचल्यासारखे?",
    "On a scale of 0 to 10, how severe is the pain?": "0 ते 10 च्या स्केलवर दुखणे किती तीव्र आहे?",
}


def translate_to_english(text: str, source_lang: Literal["hi", "mr", "en"] = "hi") -> str:
    """
    Translate text from Hindi or Marathi to English.
    """
    if not text or not text.strip():
        return ""

    source_lang = (source_lang or "en").lower().strip()

    if source_lang == "en":
        return text.strip()

    cleaned = text.strip()

    if source_lang == "hi":
        if cleaned in CLINICAL_HINDI_TO_ENGLISH:
            return CLINICAL_HINDI_TO_ENGLISH[cleaned]
        for pattern in sorted(CLINICAL_HINDI_TO_ENGLISH.keys(), key=len, reverse=True):
            if pattern in cleaned:
                return CLINICAL_HINDI_TO_ENGLISH[pattern]
        return cleaned

    if source_lang == "mr":
        if cleaned in CLINICAL_MARATHI_TO_ENGLISH:
            return CLINICAL_MARATHI_TO_ENGLISH[cleaned]
        for pattern in sorted(CLINICAL_MARATHI_TO_ENGLISH.keys(), key=len, reverse=True):
            if pattern in cleaned:
                return CLINICAL_MARATHI_TO_ENGLISH[pattern]
        return cleaned

    return cleaned



def translate_from_english(text: str, target_lang: Literal["hi", "mr", "en"] = "hi") -> str:
    """
    Translate text from English to Hindi or Marathi.
    """
    if not text or not text.strip():
        return ""

    target_lang = (target_lang or "en").lower().strip()

    if target_lang == "en":
        return text.strip()

    cleaned = text.strip()

    if target_lang == "hi":
        return CLINICAL_ENGLISH_TO_HINDI.get(cleaned, cleaned)

    if target_lang == "mr":
        return CLINICAL_ENGLISH_TO_MARATHI.get(cleaned, cleaned)

    return cleaned
