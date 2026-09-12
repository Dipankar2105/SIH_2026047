let fakeSessionId = null

export async function mockStartSession() {
  if (!fakeSessionId) {
    fakeSessionId = crypto.randomUUID ? crypto.randomUUID() : `mock-session-${Date.now()}`
  }
  return { id: fakeSessionId, kiosk_id: 'KIOSK-04', status: 'active' }
}

export async function mockEndSession() {
  fakeSessionId = null
  return { id: fakeSessionId, status: 'ended', temp_state_cleared: true }
}