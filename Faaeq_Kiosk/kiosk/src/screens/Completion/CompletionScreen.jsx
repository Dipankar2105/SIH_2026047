import { useState, useEffect, useRef } from 'react'
import { t, KIOSK } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import TopBar from '../../components/kiosk/TopBar.jsx'
import FooterBar from '../../components/kiosk/FooterBar.jsx'
import StepIndicator from '../../components/kiosk/StepIndicator.jsx'
import Icon from '../../components/common/Icon.jsx'

export default function CompletionScreen() {
  const { state, finish, toast } = useKiosk()
  const token = state.token || {}
  const [countdown, setCountdown] = useState(60)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          finish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [finish])

  const handlePrint = () => {
    window.print()
  }

  const handleResendSms = () => {
    toast(t(state.language, 'smsResent'), 'success')
  }

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    finish()
  }

  const details = [
    { label: t(state.language, 'deptLabel'), value: token.department || KIOSK.department },
    { label: t(state.language, 'roomLabel'), value: token.opdRoom || KIOSK.opdRoom },
    { label: t(state.language, 'hospitalLabel'), value: token.hospitalName || KIOSK.hospitalName },
    { label: t(state.language, 'doctorLabel'), value: token.doctorName || KIOSK.doctorName },
    { label: t(state.language, 'slotLabel'), value: token.slot || KIOSK.scheduledSlot },
    { label: t(state.language, 'sessionLabel'), value: `${KIOSK.station} · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` },
  ]

  const tokenNum = token.number ?? '42'
  const completionVoiceText = `${t(state.language, 'voiceCompletion')} ${t(state.language, 'opdToken')}: ${tokenNum}.`

  return (
    <div className="kiosk">
      <TopBar voiceText={completionVoiceText} />

      <main className="kiosk-main">
        <div className="screen-scroll">
          <div className="screen-pad">
            <div style={{ marginBottom: 16 }}>
              <StepIndicator step={4} total={4} label={t(state.language, 'opdToken')} />
            </div>

            <div className="completion-grid">
              <section className="completion-left">
                <div className="completion-hero">
                  <div className="success-ring"><Icon name="check" size={52} strokeWidth={3} /></div>
                  <div>
                    <h2>{t(state.language, 'completionTitle')}</h2>
                    <p>{t(state.language, 'completionMsg')}</p>
                  </div>
                </div>

                <div className="card completion-details print-slip">
                  <h3 style={{ fontSize: 16, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--faint)' }}>
                    {t(state.language, 'opdToken')}
                  </h3>
                  <div className="info-grid">
                    {details.map((d) => (
                      <div className="info-item" key={d.label}>
                        <div className="info-label">{d.label}</div>
                        <div className="info-value">{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="completion-side">
                <div className="card token-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span className="sec-eyebrow">{t(state.language, 'opdToken')}</span>
                    <span className="pill pill-green" style={{ marginLeft: 'auto' }}>
                      <span className="status-dot" /> {t(state.language, 'liveReady')}
                    </span>
                  </div>
                  <div className="token-number mono">{tokenNum}</div>
                  <div className="token-meta">
                    <div className="token-stat">
                      <div className="ts-label">{t(state.language, 'estWait')}</div>
                      <div className="ts-value">{token.waitMin || '12–15 min'}</div>
                    </div>
                    <div className="token-stat">
                      <div className="ts-label">{t(state.language, 'patientsAhead')}</div>
                      <div className="ts-value">{token.patientsAhead ?? 3}</div>
                    </div>
                  </div>
                  <div className="token-route">
                    <Icon name="location" size={20} />
                    <span>{t(state.language, 'routeLabel')}: {token.route || `${KIOSK.opdRoom} · Ground Floor`}</span>
                  </div>
                </div>

                <div className="completion-actions">
                  <button type="button" className="btn btn-ghost" onClick={handlePrint}>
                    <Icon name="printer" size={19} /> {t(state.language, 'printSlip')}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={handleResendSms}>
                    <Icon name="message" size={19} /> {t(state.language, 'resendSms')}
                  </button>
                  <button type="button" className="btn btn-primary btn-lg" onClick={handleFinish}>
                    {t(state.language, 'done')}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={handleFinish}>
                    {t(state.language, 'clearNow')}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14.5, color: 'var(--muted)', marginTop: 6 }}>
                    <Icon name="clock" size={16} />
                    <span>{t(state.language, 'privacyCountdown', { sec: countdown })}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <FooterBar>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 12 }}>
          <span>{t(state.language, 'gatewayFooter', { kioskId: KIOSK.kioskId })}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13 }}>
            <span className="status-dot" />
            {t(state.language, 'privacyCountdown', { sec: countdown })}
          </span>
        </div>
      </FooterBar>
    </div>
  )
}