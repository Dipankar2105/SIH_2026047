import { t } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import TopBar from '../../components/kiosk/TopBar.jsx'
import FooterBar from '../../components/kiosk/FooterBar.jsx'
import StepIndicator from '../../components/kiosk/StepIndicator.jsx'
import Icon from '../../components/common/Icon.jsx'

export default function EmergencyScreen() {
  const { state, alertStaff, continueFromEmergency, toast } = useKiosk()
  const fromWelcome = state.emergencyFrom === 'welcome'

  const handleAlert = () => {
    alertStaff()
    toast(t(state.language, 'alerted'), 'success')
  }

  const handleContinue = () => {
    continueFromEmergency()
  }

  return (
    <div className="kiosk">
      <TopBar voiceText={t(state.language, 'voiceEmergency')} />

      <main className="kiosk-main">
        <div className="screen-scroll">
          <div className="screen-pad">
            <div style={{ marginBottom: 16 }}>
              <StepIndicator step={3} total={4} label={t(state.language, 'safetyReview')} />
            </div>

            <div className="emergency-wrap">
              <div className="emergency-hero">
                <span className="sec-eyebrow" style={{ color: 'var(--danger)' }}>
                  {t(state.language, 'brand')} · {t(state.language, 'safetyReview')}
                </span>
                <div className="warn-ring">
                  <Icon name="warning" />
                </div>
                <span className="pill pill-red">{t(state.language, 'pleaseWait')}</span>
                <h1 className="emergency-title">{t(state.language, 'emergencyTitleText')}</h1>
                <p className="emergency-msg">{t(state.language, 'emergencyMsg')}</p>
              </div>

              <div className="emergency-section">
                <h4>{t(state.language, 'triggerLabel')}</h4>
                <div className="trigger-quote">"{state.emergencyTrigger || t(state.language, 'triggerText')}"</div>
              </div>

              <div className="emergency-section" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="desk-card" style={{ border: 'none', borderRadius: 0, background: 'linear-gradient(120deg, #fff8ec, #fdf1dd)' }}>
                  <span className="desk-icon"><Icon name="ambulance" size={22} /></span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--deep)' }}>{t(state.language, 'deskTitle')}</div>
                    <div style={{ fontSize: 14, color: 'var(--muted)' }}>{t(state.language, 'deskSub')}</div>
                  </div>
                </div>
              </div>

              {state.alerted && (
                <div className="alerted-banner">
                  <Icon name="checkcircle" size={20} /> {t(state.language, 'alerted')}
                </div>
              )}

              <div className="emergency-actions">
                <button type="button" className="btn btn-danger" onClick={handleAlert} disabled={state.alerted}>
                  <Icon name="warning" size={20} /> {t(state.language, 'alertStaff')}
                </button>
                {state.alerted && (
                  <button type="button" className="btn btn-primary" onClick={handleContinue}>
                    {t(state.language, 'doneFinish')}
                  </button>
                )}
                {!state.alerted && (
                  <button type="button" className="btn btn-ghost" onClick={handleContinue}>
                    {t(state.language, 'notUrgent')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterBar>
        <div className="emergency-status">
          <span className="status-chip"><span className="status-dot" /> {t(state.language, 'kioskBeacon')}</span>
          <span className="status-chip"><span className="status-dot amber" /> {t(state.language, 'dispatchOnline')}</span>
        </div>
      </FooterBar>
    </div>
  )
}