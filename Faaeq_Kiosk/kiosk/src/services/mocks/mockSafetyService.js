import { CARDIAC_KEYWORDS } from './mockIntakeService.js'

const CHEST = ['chest pain', 'chest pressure', 'heart attack', 'cardiac',
  'सीने में दर्द', 'छाती में दर्द', 'छातीत दुखणे', 'नेञ्चु वलि']
const RESP = ['breathless', 'cannot breathe', 'difficulty breathing', 'choking', 'gasping',
  'सांस फूलना', 'दम घुटना', 'श्वास घेण्यास त्रास', 'శ్వాస ఆడకపోవడం', 'ಉಸಿರಾಟದ ತೊಂದರೆ', 'শ্বাসকষ্ট']
const NEURO = ['fainted', 'unconscious', 'stroke', 'seizure', 'convulsions', 'बेहोश', 'दौरा', 'বেহোশ']
const TRAUMA = ['severe bleeding', 'profuse bleeding', 'deep wound', 'भारी रक्तस्राव']

const RULES = [
  { cat: 'cardiac', spec: 'Cardiology', kw: CHEST },
  { cat: 'respiratory', spec: 'Pulmonology', kw: RESP },
  { cat: 'neurological', spec: 'Neurology', kw: NEURO },
  { cat: 'trauma_bleeding', spec: 'Emergency Medicine', kw: TRAUMA },
]

export async function mockSafetyCheck(message) {
  const m = (message || '').toLowerCase()
  for (const r of RULES) {
    if (r.kw.some((k) => m.includes(k))) {
      return { is_emergency: true, severity: 'emergency', recommended_specialty: r.spec, matched_category: r.cat }
    }
  }
  return { is_emergency: false, severity: 'normal', recommended_specialty: null, matched_category: null }
}