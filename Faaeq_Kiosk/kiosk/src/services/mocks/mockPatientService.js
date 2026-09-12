import { KIOSK } from '../../data/kiosk.js'

let patientCount = 0

export async function mockRegisterPatient({ name, abhaId, phone, language }) {
  patientCount++
  const id = crypto.randomUUID ? crypto.randomUUID() : `mock-pat-${patientCount}`
  return {
    id,
    first_name: name || KIOSK.demoPatientName,
    last_name: 'Guest',
    abha_id: abhaId || null,
    phone: phone || null,
    preferred_language: language || 'en',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function mockGrantConsent(patientId) {
  return { id: crypto.randomUUID?.() || 'consent-1', patient_id: patientId, type: 'health_record_sharing', granted: true }
}