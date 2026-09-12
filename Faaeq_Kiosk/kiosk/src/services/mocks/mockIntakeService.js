import { KIOSK } from '../../data/kiosk.js'

const QUESTIONS_EN = [
  { id: 'q2', key: 'ai_question_greeting', field: 'chief_complaint', type: 'chips', text: 'What brings you here today? Please select your main symptom or tap the microphone below to tell me in your own words.' },
  { id: 'q3', key: 'ai_question_duration', field: 'duration', type: 'text', text: 'For how many days or hours have you been experiencing this issue?' },
  { id: 'q4', key: 'ai_question_severity', field: 'severity', type: 'scale', text: 'On a scale of 1 to 10, how severe is your pain or discomfort?' },
  { id: 'q5', key: 'ai_question_conditions', field: 'conditions', type: 'text', text: 'Do you have any existing medical conditions like diabetes, hypertension, or heart disease?' },
  { id: 'q6', key: 'ai_question_medications', field: 'medications', type: 'text', text: 'Are you currently taking any prescription medicines or ongoing treatments?' },
]

const QUESTIONS_HI = [
  { id: 'q2', text: 'आज आप यहाँ क्यों आए हैं? कृपया अपना मुख्य लक्षण चुनें या नीचे माइक्रोफ़ोन पर टैप करें।' },
  { id: 'q3', text: 'आपको यह समस्या कितने दिनों से है?' },
  { id: 'q4', text: '1 से 10 के पैमाने पर, आपका दर्द कितना गंभीर है?' },
  { id: 'q5', text: 'क्या आपको पहले से मधुमेह, उच्च रक्तचाप या हृदय रोग है?' },
  { id: 'q6', text: 'क्या आप कोई नियमित दवाएं ले रहे हैं?' },
]

const QUESTIONS_MR = [
  { id: 'q2', text: 'आज तुम्ही इथे का आलात? कृपया तुमचे मुख्य लक्षण निवडा किंवा खाली माइक्रोफोनवर टॅप करा.' },
  { id: 'q3', text: 'हा त्रास तुम्हाला किती दिवसपासून आहे?' },
  { id: 'q4', text: '१ ते १० च्या प्रमाणात, तुमची वेदना किती तीव्र आहे?' },
  { id: 'q5', text: 'तुम्हाला आधीपासून मधुमेह, उच्च रक्तदाब किंवा हृदयरोग आहे का?' },
  { id: 'q6', text: 'तुम्ही सध्या कोणती औषधे घेत आहात का?' },
]

function pack(lang) {
  return lang === 'hi' ? QUESTIONS_HI : lang === 'mr' ? QUESTIONS_MR : QUESTIONS_EN
}

function merge(lang) {
  const base = QUESTIONS_EN
  const local = pack(lang)
  return base.map((q) => ({ ...q, ...(local.find((l) => l.id === q.id) || {}) }))
}

const CARDIAC_KEYWORDS = [
  'chest pain', 'chest pressure', 'heart attack', 'cardiac',
  'severe chest', 'chest discomfort',
  'सीने में दर्द', 'छाती में दर्द',
  'छातीत दुखणे', 'नेञ्चु वलि',
]

const RESPIRATORY_KEYWORDS = [
  'breathless', 'cannot breathe', 'difficulty breathing', 'choking', 'gasping',
  'सांस फूलना', 'दम घुटना', 'श्वास घेण्यास त्रास',
  'मूच्चुत्तिणरल்', 'శ్వాస ఆడకపోవడం', 'ಉಸಿರಾಟದ ತೊಂದರೆ', 'শ্বাসকষ্ট',
]

function detectEmergency(message) {
  const m = message.toLowerCase()
  const foundCardiac = CARDIAC_KEYWORDS.some((k) => m.includes(k))
  const foundResp = RESPIRATORY_KEYWORDS.some((k) => m.includes(k))
  if (foundCardiac || foundResp) {
    return {
      is_emergency: true,
      severity: 'emergency',
      recommended_specialty: foundCardiac ? 'Cardiology' : 'Pulmonology',
      matched_category: foundCardiac ? 'cardiac' : 'respiratory',
    }
  }
  return { is_emergency: false, severity: 'normal' }
}

export async function mockGetQuestions(language = 'en') {
  return { language, questions: merge(language) }
}

export async function mockSubmitMessage({ message, language = 'en', step = 0, sessionId }) {
  const msg = (message || '').trim()
  const ev = detectEmergency(msg)

  if (ev.is_emergency) {
    return {
      reply: 'CRITICAL EMERGENCY: Please proceed to Emergency Room immediately.',
      is_urgent: true,
      triage_priority: 'emergency',
      next_step: step,
      next_question: null,
      recommended_specialty: ev.recommended_specialty,
      _match: ev,
    }
  }

  const questions = merge(language)
  const nextStep = step + 1
  const nextQ = questions[nextStep] || null

  if (!nextQ) {
    return {
      reply: 'Intake complete. The doctor has been notified.',
      is_urgent: false,
      triage_priority: 'normal',
      next_step: nextStep,
      next_question: null,
      recommended_specialty: 'General Medicine',
    }
  }

  return {
    reply: 'Noted.',
    is_urgent: false,
    triage_priority: 'normal',
    next_step: nextStep,
    next_question: nextQ.text,
    recommended_specialty: null,
  }
}