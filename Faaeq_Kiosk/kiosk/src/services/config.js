export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
export const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS || '0') === '1'
export const FORCE_LOW_CONFIDENCE = String(import.meta.env.VITE_FORCE_LOW_CONFIDENCE || '0') === '1'
export const KIOSK_HEADERS = { 'X-User-Role': 'kiosk_operator', 'X-User-Id': '00000000-0000-0000-0000-000000000080' }