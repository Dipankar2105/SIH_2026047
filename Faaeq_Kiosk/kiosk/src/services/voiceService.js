import { USE_MOCKS, FORCE_LOW_CONFIDENCE } from './config.js'
import * as MockVoice from './mocks/mockVoiceService.js'
import * as BackendVoice from './backend/voiceService.js'

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

export async function transcribeVoice(audioBase64, language = 'en', step = 0) {
  if (await ensureBackend()) return BackendVoice.transcribeVoice(audioBase64, language)
  return MockVoice.mockTranscribe({ language, step })
}

export async function synthesizeVoice(text, language = 'en', voiceGender = 'female') {
  if (await ensureBackend()) return BackendVoice.synthesizeVoice(text, language, voiceGender)
  return { text, language, voice_gender: voiceGender, audio_format: 'wav', audio_base64: '' }
}