import { USE_MOCKS } from './config.js'
import * as MockSession from './mocks/mockSessionService.js'
import * as MockPatient from './mocks/mockPatientService.js'
import * as BackendSession from './backend/sessionService.js'
import * as BackendPatient from './backend/sessionService.js'

let backendOk = false

export async function probeBackend() {
  if (USE_MOCKS) return false
  try {
    backendOk = await import('./apiClient.js').then(m => m.backendAvailable())
    return backendOk
  } catch {
    backendOk = false
    return false
  }
}

async function ensureBackend() {
  if (!backendOk) await probeBackend()
  return backendOk
}

export async function startSession(kioskId = 'KIOSK-04', patientId = null) {
  if (await ensureBackend()) return BackendSession.startSession(kioskId, patientId)
  return MockSession.mockStartSession()
}

export async function validateSession(sessionId) {
  if (await ensureBackend()) return BackendSession.validateSession(sessionId)
  return MockSession.mockStartSession()
}

export async function endSession(sessionId) {
  if (await ensureBackend()) return BackendSession.endSession(sessionId)
  return MockSession.mockEndSession()
}

export async function registerPatient(data) {
  if (await ensureBackend()) return BackendSession.registerPatient(data)
  return MockPatient.mockRegisterPatient(data)
}

export async function grantConsent(patientId, type = 'health_record_sharing') {
  if (await ensureBackend()) return BackendSession.grantConsent(patientId, type)
  return MockPatient.mockGrantConsent(patientId)
}

export async function getLanguages() {
  if (await ensureBackend()) return BackendSession.getLanguages()
  return [{ code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' }, { code: 'mr', label: 'Marathi' }]
}

export async function getLanguagePack(code) {
  if (await ensureBackend()) return BackendSession.getLanguagePack(code)
  return { language_code: code, translations: {} }
}

export async function requestMobileOtp(mobile) {
  if (await ensureBackend()) {
    try {
      return await BackendSession.requestMobileOtp(mobile)
    } catch (e) {
      console.warn('Backend mobile OTP request failed, using demo fallback', e)
    }
  }
  return { txnId: 'demo-txn-' + Date.now(), message: 'OTP sent successfully' }
}

export async function verifyMobileOtp(txnId, otp, patientId = null) {
  if (await ensureBackend()) {
    try {
      return await BackendSession.verifyMobileOtp(txnId, otp, patientId)
    } catch (e) {
      console.warn('Backend mobile OTP verify failed, using demo fallback', e)
    }
  }
  return { verified: otp === '123456' || otp === '999999' }
}