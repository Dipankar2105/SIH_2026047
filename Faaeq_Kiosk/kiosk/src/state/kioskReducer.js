import { createContext, useContext, useCallback } from 'react'

export const KioskContext = createContext(null)

export const SCREENS = {
  WELCOME: 'welcome',
  IDENTIFICATION: 'identification',
  CONSENT: 'consent',
  INTAKE: 'intake',
  EMERGENCY: 'emergency',
  COMPLETION: 'completion',
  RECORDS: 'records',
}

const initialState = {
  screen: SCREENS.WELCOME,
  language: 'en',
  patient: null,
  consent: false,
  sessionId: null,
  sessionIdCore: null,
  intake: {
    step: 0,
    symptom: null,
    painLocation: null,
    extraAnswer: '',
    severity: null,
    conditions: '',
    medications: '',
    answers: [],
    complete: false,
  },
  safety: null,
  emergencyTrigger: '',
  emergencyFrom: null,
  alerted: false,
  token: null,
  toast: null,
  busy: false,
}

export function kioskReducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { ...initialState, language: state.language, toast: state.toast }

    case 'SET_LANGUAGE':
      return { ...state, language: action.language }

    case 'START_CONSULTATION':
      return {
        ...state,
        screen: SCREENS.IDENTIFICATION,
        sessionId: action.sessionId ?? state.sessionId,
        sessionIdCore: action.sessionIdCore ?? state.sessionIdCore,
      }

    case 'GOTO_IDENTIFICATION':
      return { ...state, screen: SCREENS.IDENTIFICATION }

    case 'GOTO_CONSENT':
      return {
        ...state,
        screen: SCREENS.CONSENT,
        patient: action.patient ?? state.patient,
      }

    case 'GIVE_CONSENT':
      return {
        ...state,
        consent: true,
        screen: SCREENS.INTAKE,
        intake: {
          ...state.intake,
          step: state.intake?.step || 0,
        },
      }

    case 'GOTO_RECORDS':
      return { ...state, screen: SCREENS.RECORDS }

    case 'GOTO_WELCOME':
      return { ...state, screen: SCREENS.WELCOME }

    case 'IDENTIFY':
      return {
        ...state,
        patient: action.patient,
        consent: action.consent ?? state.consent,
        screen: SCREENS.INTAKE,
        intake: {
          ...state.intake,
          step: state.intake?.step || 0,
        },
      }

    case 'INTAKE_UPDATE':
      return {
        ...state,
        intake: { ...state.intake, ...action.intake },
      }

    case 'EMERGENCY_TRIGGER':
      return {
        ...state,
        screen: SCREENS.EMERGENCY,
        safety: action.safety,
        emergencyTrigger: action.trigger || state.emergencyTrigger,
        emergencyFrom: action.from || state.emergencyFrom || 'intake',
        alerted: false,
      }

    case 'EMERGENCY_ALERTED':
      return { ...state, alerted: true }

    case 'EMERGENCY_CONTINUE': {
      if (state.emergencyFrom === 'welcome') {
        return { ...state, screen: SCREENS.WELCOME, alerted: false, safety: null }
      }
      return { ...state, screen: SCREENS.INTAKE, alerted: false }
    }

    case 'COMPLETE':
      return {
        ...state,
        screen: SCREENS.COMPLETION,
        token: action.token,
        intake: { ...state.intake, complete: true },
      }

    case 'FINISHED':
      return { ...initialState, language: state.language, toast: state.toast }

    case 'SET_TOAST':
      return { ...state, toast: action.toast }

    case 'SET_BUSY':
      return { ...state, busy: action.busy }

    default:
      return state
  }
}

export function useKiosk() {
  const ctx = useContext(KioskContext)
  if (!ctx) throw new Error('useKiosk must be inside KioskProvider')
  const { state, dispatch } = ctx

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch])
  const setLanguage = useCallback(
    (lang) => dispatch({ type: 'SET_LANGUAGE', language: lang }),
    [dispatch],
  )
  const startConsult = useCallback(
    (sessionId, sessionIdCore) =>
      dispatch({ type: 'START_CONSULTATION', sessionId, sessionIdCore }),
    [dispatch],
  )
  const identify = useCallback(
    (patient, consent = true) =>
      dispatch({ type: 'IDENTIFY', patient, consent }),
    [dispatch],
  )
  const updateIntake = useCallback(
    (intake) => dispatch({ type: 'INTAKE_UPDATE', intake }),
    [dispatch],
  )
  const triggerEmergency = useCallback(
    (trigger, safety, from = 'intake') =>
      dispatch({ type: 'EMERGENCY_TRIGGER', trigger, safety, from }),
    [dispatch],
  )
  const alertStaff = useCallback(
    () => dispatch({ type: 'EMERGENCY_ALERTED' }),
    [dispatch],
  )
  const continueFromEmergency = useCallback(
    () => dispatch({ type: 'EMERGENCY_CONTINUE' }),
    [dispatch],
  )
  const goToIdentification = useCallback(
    () => dispatch({ type: 'GOTO_IDENTIFICATION' }),
    [dispatch],
  )
  const goToConsent = useCallback(
    (patient) => dispatch({ type: 'GOTO_CONSENT', patient }),
    [dispatch],
  )
  const giveConsent = useCallback(
    () => dispatch({ type: 'GIVE_CONSENT' }),
    [dispatch],
  )
  const goToRecords = useCallback(
    () => dispatch({ type: 'GOTO_RECORDS' }),
    [dispatch],
  )
  const goToWelcome = useCallback(
    () => dispatch({ type: 'GOTO_WELCOME' }),
    [dispatch],
  )
  const complete = useCallback(
    (token) => dispatch({ type: 'COMPLETE', token }),
    [dispatch],
  )
  const finish = useCallback(() => dispatch({ type: 'FINISHED' }), [dispatch])

  const toast = useCallback(
    (msg, variant = 'info') => {
      dispatch({ type: 'SET_TOAST', toast: { msg, variant, id: Date.now() } })
      setTimeout(() => dispatch({ type: 'SET_TOAST', toast: null }), 3800)
    },
    [dispatch],
  )

  const setBusy = useCallback(
    (b) => dispatch({ type: 'SET_BUSY', busy: b }),
    [dispatch],
  )

  return {
    state,
    dispatch,
    reset,
    setLanguage,
    startConsult,
    identify,
    updateIntake,
    triggerEmergency,
    alertStaff,
    continueFromEmergency,
    goToIdentification,
    goToConsent,
    giveConsent,
    goToRecords,
    goToWelcome,
    complete,
    finish,
    toast,
    setBusy,
  }
}