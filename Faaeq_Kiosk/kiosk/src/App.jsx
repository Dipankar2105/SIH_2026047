import { useContext, useEffect, useRef } from 'react'
import { KioskProvider, KioskContext } from './state/KioskContext.jsx'
import ToastStack from './components/common/ToastStack.jsx'
import { SCREENS, useKiosk } from './state/kioskReducer.js'
import WelcomeScreen from './screens/Welcome/WelcomeScreen.jsx'
import IdentificationScreen from './screens/Identification/IdentificationScreen.jsx'
import ConsentScreen from './screens/Consent/ConsentScreen.jsx'
import IntakeScreen from './screens/Intake/IntakeScreen.jsx'
import EmergencyScreen from './screens/Emergency/EmergencyScreen.jsx'
import CompletionScreen from './screens/Completion/CompletionScreen.jsx'
import RecordsScreen from './screens/Records/RecordsScreen.jsx'
import { KIOSK } from './data/kiosk.js'

function ScreenRouter() {
  const { state } = useContext(KioskContext)

  switch (state.screen) {
    case SCREENS.IDENTIFICATION:
      return <IdentificationScreen />
    case SCREENS.CONSENT:
      return <ConsentScreen />
    case SCREENS.INTAKE:
      return <IntakeScreen />
    case SCREENS.EMERGENCY:
      return <EmergencyScreen />
    case SCREENS.COMPLETION:
      return <CompletionScreen />
    case SCREENS.RECORDS:
      return <RecordsScreen />
    case SCREENS.WELCOME:
    default:
      return <WelcomeScreen />
  }
}

function KioskShell() {
  const { state, reset } = useKiosk()
  const idleTimerRef = useRef(null)

  useEffect(() => {
    const handleActivity = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      // Only set idle timeout if not on welcome screen
      if (state.screen !== SCREENS.WELCOME) {
        idleTimerRef.current = setTimeout(() => {
          reset()
        }, KIOSK.idleResetMs || 220_000)
      }
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }))

    handleActivity()

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      events.forEach((ev) => window.removeEventListener(ev, handleActivity))
    }
  }, [state.screen, reset])

  return (
    <>
      <ScreenRouter />
      <ToastStack />
    </>
  )
}

export default function App() {
  return (
    <KioskProvider>
      <KioskShell />
    </KioskProvider>
  )
}