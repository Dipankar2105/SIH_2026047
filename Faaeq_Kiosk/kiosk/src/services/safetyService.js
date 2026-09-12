import { USE_MOCKS } from './config.js'
import * as MockSafety from './mocks/mockSafetyService.js'
import * as BackendSafety from './backend/safetyService.js'

let backendOk = false

async function ensureBackend() {
  if (!backendOk && !USE_MOCKS) {
    try {
      backendOk = await import('./apiClient.js').then(m => m.backendAvailable())
    } catch {
      backendOk = false
    }
  }
  return backendOk
}

export async function checkSafety(message, language = 'en') {
  if (await ensureBackend()) return BackendSafety.checkSafety(message, language)
  return MockSafety.mockSafetyCheck(message)
}