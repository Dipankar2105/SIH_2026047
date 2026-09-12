import { apiPost } from '../apiClient.js'

export async function checkSafety(message, language = 'en') {
  const res = await apiPost('/safety/check', { message, language })
  return res
}