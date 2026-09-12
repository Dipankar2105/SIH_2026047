import { USE_MOCKS } from './config.js'
import * as MockQueue from './mocks/mockQueueService.js'
import * as BackendQueue from './backend/queueService.js'

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

export async function issueToken(payload) {
  if (await ensureBackend()) {
    const item = await BackendQueue.addToQueue({
      patient_id: payload.patientId,
      doctor_id: payload.doctorId || '00000000-0000-0000-0000-000000000011',
      hospital_id: payload.hospitalId || '00000000-0000-0000-0000-000000000001',
      reason: 'Kiosk Check-in',
    })
    return {
      appointmentId: item.appointment_id,
      queuePosition: item.queue_position,
      token: item.queue_position,
      number: item.queue_position,
      status: item.status,
      statusLabel: 'Live Ready',
      waitMin: '12\u201315 min',
      patientsAhead: Math.max(0, item.queue_position - 1),
      hospitalName: payload.hospitalName || '',
      doctorName: payload.doctorName || '',
      opdRoom: 'OPD-04',
      department: 'General Medicine',
      slot: '09:45 AM',
      route: 'OPD-04 \u00b7 Ground Floor',
    }
  }
  return MockQueue.mockIssueToken(payload)
}