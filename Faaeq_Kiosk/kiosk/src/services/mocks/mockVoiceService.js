import { FORCE_LOW_CONFIDENCE } from '../config.js'

function mockForQuestion(step = 0, language = 'en') {
  const lang = (language || 'en').toLowerCase().trim()
  if (lang.startsWith('hi')) {
    switch (step) {
      case 0: return 'मुझे सुबह से पेट में दर्द है, पेट के निचले हिस्से में दर्द है'
      case 1: return 'तीन दिन से लगातार दर्द हो रहा है'
      case 2: return 'दर्द 10 में से 7 है'
      case 3: return 'कोई गंभीर बीमारी नहीं है, हल्का बीपी है'
      case 4: return 'कभी-कभी पैरासिटामोल लेता हूँ'
      default: return 'सीने में दर्द और सांस लेने में तकलीफ'
    }
  }
  if (lang.startsWith('mr')) {
    switch (step) {
      case 0: return 'मला सकाळपासून पोटात त्रास होत आहे, पोटाच्या खालच्या भागात दुखत आहे'
      case 1: return 'तीन दिवसांपासून सतत दुखत आहे'
      case 2: return 'त्रास 10 पैकी 7 आहे'
      case 3: return 'कोणताही मोठा आजार नाही, सौम्य बीपी आहे'
      case 4: return 'कधीकधी पॅरासिटामॉल घेतो'
      default: return 'छातीत दुखणे आणि श्वास घेण्यास त्रास'
    }
  }
  switch (step) {
    case 0: return 'I have stomach problem since morning, pain in lower abdomen'
    case 1: return 'For three days, constant pain'
    case 2: return 'It is 7 out of 10'
    case 3: return 'No major conditions, mild BP'
    case 4: return 'I take Paracetamol sometimes'
    default: return 'Chest pain and difficulty breathing'
  }
}

export async function mockTranscribe({ language = 'en', step = 0 }) {
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 500))
  const confidence = FORCE_LOW_CONFIDENCE ? 0.42 : 0.96
  const txt = mockForQuestion(step, language)
  return {
    text: txt,
    original_text: txt,
    language,
    confidence,
    duration_seconds: 2.8,
  }
}