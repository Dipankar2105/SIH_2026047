import { useState } from 'react'
import { t, KIOSK } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import TopBar from '../../components/kiosk/TopBar.jsx'
import FooterBar from '../../components/kiosk/FooterBar.jsx'
import Icon from '../../components/common/Icon.jsx'
import BusyOverlay from '../../components/common/BusyOverlay.jsx'
import { startSession as svcStartSession } from '../../services/sessionService.js'

export default function WelcomeScreen() {
  const { state, startConsult, setBusy, toast, triggerEmergency, goToRecords } = useKiosk()
  const [busyLocal, setBusyLocal] = useState(false)

  const handleStart = async () => {
    setBusyLocal(true)
    setBusy(true)
    try {
      const s = await svcStartSession(KIOSK.kioskId, null)
      const sid = s?.id || `local-${crypto.randomUUID?.() || Date.now()}`
      const sidCore = s?.session_id || null
      toast(t(state.language, 'consultationStartedMsg'), 'success')
      startConsult(sid, sidCore)
    } catch (e) {
      toast(t(state.language, 'offlineModeMsg'), 'info')
      startConsult(`local-${Date.now()}`, null)
    } finally {
      setBusyLocal(false)
      setBusy(false)
    }
  }

  const handleEmergency = () => {
    triggerEmergency(
      t(state.language, 'triggerText'),
      { is_emergency: true, severity: 'emergency', recommended_specialty: 'Emergency Medicine', matched_category: 'help_requested' },
      'welcome',
    )
    toast(t(state.language, 'staffRequestedMsg'), 'info')
  }

  const handleDirectToken = () => {
    toast(t(state.language, 'directTokenMsg'), 'info')
  }

  const handleRecords = () => {
    goToRecords()
  }

  return (
    <div className="kiosk">
      <TopBar voiceText={t(state.language, 'voiceDashboard')} />
      {(busyLocal || state.busy) && <BusyOverlay message={t(state.language, 'preparingCheckin')} />}

      <main className="kiosk-main">
        <div className="screen-scroll">
          <div className="screen-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
              <span className="pill pill-navy">{t(state.language, 'hospitalKiosk')}</span>
              <span className="pill pill-outline"><Icon name="location" size={15} /> {KIOSK.station}</span>
              <span className="pill pill-outline">{t(state.language, 'stepLabel', { n: '1', label: t(state.language, 'welcomeLabel') })}</span>
            </div>

            <div className="welcome-grid">
              <section className="welcome-hero">
                <div className="card" style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <span className="sec-eyebrow">{t(state.language, 'trustedCare')}</span>
                  <h1 className="welcome-title">
                    {t(state.language, 'quickOpd')}
                  </h1>
                  <p className="screen-sub">
                    {t(state.language, 'welcomeSub')}
                  </p>

                  <div className="welcome-feature-chips">
                    <span className="pill pill-teal"><Icon name="clock" size={15} /> {t(state.language, 'badgeInstant')}</span>
                    <span className="pill pill-amber"><Icon name="shield" size={15} /> {t(state.language, 'badgeVoice')}</span>
                    <span className="pill pill-green"><Icon name="shield" size={15} /> {t(state.language, 'badgeConfidential')}</span>
                  </div>

                  <div className="welcome-start">
                    <button type="button" className="btn btn-primary btn-lg" onClick={handleStart}>
                      {t(state.language, 'startConsult')} <Icon name="chevron" size={20} />
                    </button>
                  </div>
                </div>

                <div className="welcome-quick">
                  <button type="button" className="quick-card" onClick={handleDirectToken}>
                    <span className="qc-icon">🎫</span>
                    <span className="qc-label">{t(state.language, 'directToken')}</span>
                    <span className="qc-sub">{t(state.language, 'skipAiIntake')}</span>
                  </button>
                  <button type="button" className="quick-card" onClick={handleRecords}>
                    <span className="qc-icon">📋</span>
                    <span className="qc-label">{t(state.language, 'healthRecords')}</span>
                    <span className="qc-sub">{t(state.language, 'viewPastVisits')}</span>
                  </button>
                </div>
              </section>

              <aside className="welcome-side">
                <div className="card abha-card">
                  <span className="sec-eyebrow">{t(state.language, 'abhaFirst')}</span>
                  <h3 style={{ fontSize: 20 }}>{t(state.language, 'haveAbhaCard')}</h3>
                  <span className="pill pill-teal" style={{ width: 'fit-content' }}>{t(state.language, 'fastScan')}</span>
                  <button type="button" className="abha-scan-btn" onClick={handleStart}>
                    <Icon name="scan" /> {t(state.language, 'scanTitle')}
                  </button>
                  <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                    {t(state.language, 'abhaCardSub')}
                  </p>
                </div>

                <button type="button" className="emergency-card" onClick={handleEmergency}>
                  <span className="ec-main">
                    <span className="warn-ring" style={{ width: 54, height: 54, boxShadow: '0 8px 22px rgba(217,64,51,.22)' }}>
                      <Icon name="warning" size={22} />
                    </span>
                    <span>
                      <span style={{ display: 'block', fontWeight: 800, color: 'var(--danger-strong)', fontSize: 15, letterSpacing: '0.06em' }}>
                        {t(state.language, 'emergencyTitle')}
                      </span>
                      <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                        {t(state.language, 'emergencySub')}
                      </span>
                    </span>
                  </span>
                  <Icon name="chevron" size={18} />
                </button>
                <div className="mic-note">
                  <Icon name="mic" size={17} /> {t(state.language, 'micNote')}
                </div>
              </aside>
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