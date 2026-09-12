import { apiPost, apiGet } from '../apiClient.js'

export async function addToQueue(queueIn) {
  const res = await apiPost('/hospital/queue/add', queueIn)
  return res
}

export async function getLiveQueue(hospitalId) {
  const res = await apiGet(`/hospital/queue/live/${hospitalId}`)
  return res
}