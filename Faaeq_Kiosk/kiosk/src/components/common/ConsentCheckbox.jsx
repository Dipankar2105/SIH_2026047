import { t } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'

export default function ConsentCheckbox({ checked, onChange, id = 'consent-main' }) {
  const { state } = useKiosk()

  return (
    <div className={`consent-row ${checked ? 'checked' : ''}`}>
      <label htmlFor={id} className="checkbox-label" onClick={() => onChange(!checked)}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={() => {}}
          tabIndex={-1}
        />
        <span className="checkbox-tile" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7"/></svg>
        </span>
        <span>
          {t(state.language, 'consentA')}
        </span>
      </label>
    </div>
  )
}