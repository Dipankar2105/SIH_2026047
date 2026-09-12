import { LANGUAGES } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'

export default function LanguageSelector({ compact = false }) {
  const { state, setLanguage, toast } = useKiosk()

  const handle = (code) => {
    setLanguage(code)
    toast(code === 'en' ? 'English selected' : code === 'hi' ? 'हिन्दी चुनी गई' : 'मराठी निवडले', 'success')
  }

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-btn ${state.language === l.code ? 'active' : ''}`}
          onClick={() => handle(l.code)}
          aria-pressed={state.language === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}