import { apiGet, apiPost } from '../apiClient.js'

export async function getIntakeQuestions(language = 'en') {
  const res = await apiGet(`/intake/questions?language=${encodeURIComponent(language)}`)
  return res
}

export async function submitIntakeMessage({ message, language = 'en', step = 0, sessionId }) {
  const res = await apiPost('/intake/message', { message, language, step, session_id: sessionId })
  return res
}