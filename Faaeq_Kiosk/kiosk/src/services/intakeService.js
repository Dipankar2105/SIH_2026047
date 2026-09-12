import { USE_MOCKS } from './config.js'
import * as MockIntake from './mocks/mockIntakeService.js'
import * as BackendIntake from './backend/intakeService.js'

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

export async function getIntakeQuestions(language = 'en') {
  if (await ensureBackend()) return BackendIntake.getIntakeQuestions(language)
  return MockIntake.mockGetQuestions(language)
}

export async function submitIntakeMessage({ message, language = 'en', step = 0, sessionId }) {
  if (await ensureBackend()) return BackendIntake.submitIntakeMessage({ message, language, step, sessionId })
  return MockIntake.mockSubmitMessage({ message, language, step, sessionId })
}