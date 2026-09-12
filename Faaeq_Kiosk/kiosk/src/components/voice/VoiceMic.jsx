import { t } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import Icon from '../common/Icon.jsx'

export const VOICE_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  LOW_CONFIDENCE: 'low_confidence',
  ERROR: 'error',
}

export default function VoiceMic({
  state: micState = VOICE_STATES.IDLE,
  language = 'en',
  step = 0,
  onStart,
  onStop,
  disabled = false,
}) {
  const { state } = useKiosk()

  const labels = {
    [VOICE_STATES.IDLE]: t(state.language, 'tapSpeak'),
    [VOICE_STATES.LISTENING]: t(state.language, 'listening'),
    [VOICE_STATES.PROCESSING]: t(state.language, 'processing'),
    [VOICE_STATES.LOW_CONFIDENCE]: t(state.language, 'lowConf'),
    [VOICE_STATES.ERROR]: t(state.language, 'voiceErr'),
  }

  const classes = ['vmic']
  if (micState === VOICE_STATES.LISTENING) classes.push('listening')
  else if (micState === VOICE_STATES.PROCESSING) classes.push('processing')
  else if (micState === VOICE_STATES.ERROR || micState === VOICE_STATES.LOW_CONFIDENCE) classes.push('error')

  return (
    <button
      type="button"
      className={classes.join(' ')}
      disabled={disabled}
      onClick={micState === VOICE_STATES.IDLE ? onStart : onStop}
      aria-label={labels[micState]}
      aria-pressed={micState === VOICE_STATES.LISTENING}
    >
      <div className="mic-bubble">
        {micState === VOICE_STATES.LISTENING && <Icon name="mic" size={20} />}
        {micState === VOICE_STATES.PROCESSING && (
          <div className="voice-wave" aria-hidden="true">
            <i style={{ height: 6 }} />
            <i style={{ height: 12 }} />
            <i style={{ height: 18 }} />
            <i style={{ height: 22 }} />
            <i style={{ height: 18 }} />
          </div>
        )}
        {(micState === VOICE_STATES.SUCCESS || micState === VOICE_STATES.IDLE) && <Icon name="mic" size={20} />}
        {micState === VOICE_STATES.LOW_CONFIDENCE && <Icon name="warning" size={20} />}
        {micState === VOICE_STATES.ERROR && <Icon name="info" size={20} />}
      </div>
      <span>{labels[micState]}</span>
    </button>
  )
}