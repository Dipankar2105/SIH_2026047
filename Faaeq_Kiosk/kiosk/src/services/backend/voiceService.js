import { apiPost } from '../apiClient.js'

export async function transcribeVoice(audioBase64, language = 'en') {
  const res = await apiPost('/voice/transcribe', { audio_base64: audioBase64, language })
  return res
}

export async function synthesizeVoice(text, language = 'en', voiceGender = 'female') {
  const res = await apiPost('/voice/synthesize', { text, language, voice_gender: voiceGender })
  return res
}