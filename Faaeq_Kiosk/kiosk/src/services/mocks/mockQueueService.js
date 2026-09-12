import { KIOSK } from '../../data/kiosk.js'

export async function mockIssueToken({ patientId, hospitalName, doctorName }) {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 300))
  return {
    appointmentId: crypto.randomUUID?.() || `mock-apt-${Date.now()}`,
    queuePosition: 42,
    token: 42,
    number: 42,
    status: 'Waiting',
    statusLabel: 'Live Ready',
    waitMin: '12\u201315 min',
    patientsAhead: 3,
    hospitalName: hospitalName || KIOSK.hospitalName,
    doctorName: doctorName || KIOSK.doctorName,
    opdRoom: KIOSK.opdRoom,
    department: KIOSK.department,
    slot: KIOSK.scheduledSlot,
    route: `${KIOSK.opdRoom} \u00b7 Ground Floor`,
  }
}