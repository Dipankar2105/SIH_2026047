import { useCallback } from 'react'
import Icon from '../common/Icon.jsx'
import { useKiosk } from '../../state/kioskReducer.js'
import { t } from '../../data/kiosk.js'
import { synthesizeVoice } from '../../services/voiceService.js'

const VOICE_LANG = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }

let cachedVoices = []
let activeAudio = null

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return []
  try {
    const v = window.speechSynthesis.getVoices()
    if (v && v.length) {
      cachedVoices = v
    }
  } catch (_) {
    /* ignore */
  }
  return cachedVoices
}

if (typeof window !== 'undefined') {
  window.speechSynthesis?.onvoiceschanged?.()
}

export function stopSpeaking() {
  if (activeAudio) {
    try {
      activeAudio.pause()
      activeAudio.currentTime = 0
    } catch (_) {}
    activeAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch (_) {}
  }
}

export async function speak(text, language = 'en') {
  const cleanText = (text || '').trim()
  if (!cleanText) return false

  stopSpeaking()

  // For Marathi, use backend Marathi TTS for authentic pronunciation
  if (language === 'mr') {
    try {
      const res = await synthesizeVoice(cleanText, 'mr')
      if (res && res.audio_base64 && res.audio_base64.length > 50) {
        const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`)
        activeAudio = audio
        audio.play().catch(() => {})
        return true
      }
    } catch (e) {
      /* fallback to browser voice if backend fails */
    }
  }

  // For English, Hindi, and browser fallback:
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(cleanText)
    const lang = VOICE_LANG[language] || 'en-IN'
    u.lang = lang
    u.rate = 0.95
    u.pitch = 1

    const voices = loadVoices()
    if (voices.length) {
      const exact = voices.find((v) => v.lang === lang)
      if (exact) {
        u.voice = exact
      } else {
        const prefix = lang.split('-')[0]
        const match = voices.find((v) => v.lang && v.lang.startsWith(prefix))
        if (match) u.voice = match
      }
    }

    window.speechSynthesis.speak(u)
    return true
  }

  // If browser synthesis is absent, invoke backend synthesis
  try {
    const res = await synthesizeVoice(cleanText, language)
    if (res && res.audio_base64 && res.audio_base64.length > 50) {
      const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`)
      activeAudio = audio
      audio.play().catch(() => {})
      return true
    }
  } catch (_) {}

  return false
}

export default function AudioAssist({ text }) {
  const { toast, state } = useKiosk()

  const handle = useCallback(async () => {
    const ok = await speak(text || '', state.language)
    if (!ok) toast(t(state.language, 'voiceErr'), 'error')
  }, [text, state.language, toast])

  return (
    <button
      type="button"
      className="icon-btn wrap-label"
      onClick={handle}
      aria-label={t(state.language, 'audioAssist')}
    >
      <Icon name="speaker" />
      <span className="mini-label">{t(state.language, 'audioAssist')}</span>
    </button>
  )
}