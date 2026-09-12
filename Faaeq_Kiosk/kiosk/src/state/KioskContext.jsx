import { useReducer } from 'react'
import { KioskContext, kioskReducer, SCREENS } from './kioskReducer.js'
import { KIOSK } from '../data/kiosk.js'

const initialContext = {
  screen: SCREENS.WELCOME,
  language: 'en',
  patient: null,
  consent: false,
  sessionId: null,
  sessionIdCore: null,
  intake: {},
  safety: null,
  emergencyTrigger: '',
  emergencyFrom: null,
  alerted: false,
  token: null,
  toast: null,
  busy: false,
}

export { KioskContext }

export function KioskProvider({ children }) {
  const [state, dispatch] = useReducer(kioskReducer, initialContext)

  return (
    <KioskContext.Provider value={{ state, dispatch }}>
      {children}
    </KioskContext.Provider>
  )
}