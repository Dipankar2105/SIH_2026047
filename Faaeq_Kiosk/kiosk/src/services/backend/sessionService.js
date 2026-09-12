import { apiPost, apiGet } from '../apiClient.js'

export async function startSession(kioskId = 'KIOSK-04', patientId = null) {
  const res = await apiPost('/identity/kiosk/session/start', { kiosk_id: kioskId, patient_id: patientId })
  return res
}

export async function validateSession(sessionId) {
  const res = await apiGet(`/identity/kiosk/session/validate/${sessionId}`)
  return res
}

export async function endSession(sessionId) {
  const res = await apiPost(`/identity/kiosk/session/end/${sessionId}`)
  return res
}

export async function registerPatient(data) {
  const res = await apiPost('/identity/patient/register', data)
  return res
}

export async function grantConsent(patientId, type = 'health_record_sharing') {
  const res = await apiPost('/identity/consent/grant', { patient_id: patientId, consent_type: type })
  return res
}

export async function getLanguages() {
  const res = await apiGet('/identity/languages')
  return res
}

export async function getLanguagePack(code) {
  const res = await apiGet(`/identity/languages/${code}`)
  return res
}

export async function requestMobileOtp(mobile) {
  const res = await apiPost('/identity/mobile/request-otp', { mobile })
  return res
}

export async function verifyMobileOtp(txnId, otp, patientId = null) {
  const res = await apiPost('/identity/mobile/verify-otp', { txn_id: txnId, otp, patient_id: patientId })
  return res
}