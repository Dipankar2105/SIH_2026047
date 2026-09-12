import { useState } from 'react'
import { t } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import TopBar from '../../components/kiosk/TopBar.jsx'
import FooterBar from '../../components/kiosk/FooterBar.jsx'
import StepIndicator from '../../components/kiosk/StepIndicator.jsx'
import Icon from '../../components/common/Icon.jsx'
import BusyOverlay from '../../components/common/BusyOverlay.jsx'
import { grantConsent as svcGrantConsent } from '../../services/sessionService.js'

export default function ConsentScreen() {
  const { state, giveConsent, goToIdentification, toast, setBusy } = useKiosk()
  const [consentChecked, setConsentChecked] = useState(state.consent || false)
  const [busyLocal, setBusyLocal] = useState(false)

  const consentBullets = [
    { key: 'consentA', icon: 'message' },
    { key: 'consentB', icon: 'clock' },
    { key: 'consentC', icon: 'printer' },
    { key: 'consentD', icon: 'shield' },
  ]

  const handleToggle = () => {
    setConsentChecked((prev) => !prev)
  }

  const handleContinue = async () => {
    if (!consentChecked) {
      toast(t(state.language, 'consentRequiredPrompt'), 'error')
      return
    }

    setBusyLocal(true)
    setBusy(true)
    try {
      if (state.patient?.id) {
        try {
          await svcGrantConsent(state.patient.id)
        } catch (_) {
          /* Local consent recorded if offline */
        }
      }
      giveConsent()
    } catch (_) {
      giveConsent()
    } finally {
      setBusyLocal(false)
      setBusy(false)
    }
  }

  return (
    <div className="kiosk">
      <TopBar voiceText={t(state.language, 'voiceConsent')} />
      {(busyLocal || state.busy) && <BusyOverlay message={t(state.language, 'pleaseWait')} />}

      <main className="kiosk-main">
        <div className="screen-scroll">
          <div className="screen-pad">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <StepIndicator step={2} total={4} label={t(state.language, 'consentTitle')} />
              <span className="pill pill-teal">
                <Icon name="shield" size={15} /> {t(state.language, 'abdmBadge')}
              </span>
            </div>

            <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card consent-box" style={{ padding: '32px 36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                  <div className="logo-mark" style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <Icon name="shield" size={24} />
                  </div>
                  <div>
                    <h1 className="screen-title" style={{ fontSize: 26, margin: 0 }}>
                      {t(state.language, 'consentTitle')}
                    </h1>
                    <p className="screen-sub" style={{ fontSize: 15, margin: 0, marginTop: 4 }}>
                      {t(state.language, 'consentSub')}
                    </p>
                  </div>
                </div>

                <div className="divider" style={{ margin: '18px 0' }} />

                <ul className="consent-bullets" style={{ margin: '16px 0 24px' }}>
                  {consentBullets.map((b) => (
                    <li key={b.key} style={{ fontSize: 16.5, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Icon name={b.icon} size={20} />
                      <span>{t(state.language, b.key)}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`consent-row ${consentChecked ? 'checked' : ''}`}
                  onClick={handleToggle}
                  role="checkbox"
                  aria-checked={consentChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault()
                      handleToggle()
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 14,
                    padding: '16px 20px',
                    border: consentChecked ? '2px solid var(--brand)' : '2px solid var(--line)',
                    background: consentChecked ? 'rgba(74, 163, 223, 0.08)' : 'var(--card-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    className="checkbox-tile"
                    aria-hidden="true"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      display: 'grid',
                      placeItems: 'center',
                      background: consentChecked ? 'var(--brand)' : '#fff',
                      border: consentChecked ? 'none' : '2px solid var(--line-strong)',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {consentChecked && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 16.5, color: 'var(--deep)' }}>
                    {t(state.language, 'consentCheckbox')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 26 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => goToIdentification()}>
                    <Icon name="back" size={18} /> {t(state.language, 'back')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1 }}
                    onClick={handleContinue}
                  >
                    {t(state.language, 'giveConsent')} <Icon name="chevron" size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterBar>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="status-dot" /> {t(state.language, 'privacyFooter')}
        </span>
      </FooterBar>
    </div>
  )
}
