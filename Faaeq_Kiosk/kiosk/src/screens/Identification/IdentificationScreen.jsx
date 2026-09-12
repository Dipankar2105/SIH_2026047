import { useState } from 'react'
import { t, KIOSK } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import TopBar from '../../components/kiosk/TopBar.jsx'
import FooterBar from '../../components/kiosk/FooterBar.jsx'
import StepIndicator from '../../components/kiosk/StepIndicator.jsx'
import Icon from '../../components/common/Icon.jsx'
import Keypad from '../../components/common/Keypad.jsx'
import BusyOverlay from '../../components/common/BusyOverlay.jsx'
import { registerPatient, requestMobileOtp, verifyMobileOtp } from '../../services/sessionService.js'

const DEMO_ABHA = '9312 3456 7890 12'.replace(/\s/g, '')
const DEMO_OTP = '123456'

export default function IdentificationScreen() {
  const { state, goToConsent, goToWelcome, toast, setBusy } = useKiosk()
  const [tab, setTab] = useState('abha')
  const [abha, setAbha] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [txnId, setTxnId] = useState('')
  const [guestName, setGuestName] = useState('')
  const [busyLocal, setBusyLocal] = useState(false)

  const counter = `${abha.replace(/\s/g, '').length}/14`

  const pushDigit = (d) => {
    setAbha((prev) => {
      const cur = prev.replace(/\s/g, '')
      if (cur.length >= 14) return prev
      const next = cur + d
      if (next.length > 14) return prev
      return next.replace(/(\d{4})(?=\d)/g, '$1 ')
    })
  }

  const backspace = () => {
    setAbha((prev) => {
      const cur = prev.replace(/\s/g, '')
      return cur.slice(0, -1).replace(/(\d{4})(?=\d)/g, '$1 ')
    })
  }

  const clearAbha = () => setAbha('')

  const useDemoCard = () => {
    setAbha(DEMO_ABHA.replace(/(\d{4})(?=\d)/g, '$1 '))
    toast(t(state.language, 'demoCardLoaded'), 'success')
  }

  const pushPhoneDigit = (d) => {
    setMobile((prev) => (prev.length >= 10 ? prev : prev + d))
  }

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      toast(t(state.language, 'validMobilePrompt'), 'error')
      return
    }
    setBusyLocal(true)
    try {
      const res = await requestMobileOtp(mobile)
      setTxnId(res?.txnId || 'demo-txn')
      setOtpSent(true)
      setOtp('')
      toast(t(state.language, 'otpSentTo', { mobile }), 'success')
    } catch {
      setTxnId('demo-txn')
      setOtpSent(true)
      setOtp('')
      toast(t(state.language, 'otpSentTo', { mobile }), 'success')
    } finally {
      setBusyLocal(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast(t(state.language, 'incorrectOtpPrompt'), 'error')
      return
    }
    setBusyLocal(true)
    try {
      const res = await verifyMobileOtp(txnId, otp)
      if (res?.verified !== false) {
        await doIdentify({ name: KIOSK.demoPatientName, phone: mobile, abhaId: null })
      } else {
        toast(t(state.language, 'incorrectOtpPrompt'), 'error')
      }
    } catch {
      if (otp === DEMO_OTP) {
        await doIdentify({ name: KIOSK.demoPatientName, phone: mobile, abhaId: null })
      } else {
        toast(t(state.language, 'incorrectOtpPrompt'), 'error')
      }
    } finally {
      setBusyLocal(false)
    }
  }

  const handleCreateNow = () => {
    setTab('mobile')
    toast(t(state.language, 'createAbhaPrompt'), 'info')
  }

  const doIdentify = async ({ name, abhaId = null, phone = null }) => {
    setBusyLocal(true)
    setBusy(true)
    try {
      const patient = await registerPatient({
        first_name: abhaId ? KIOSK.demoPatientName : name,
        last_name: abhaId ? 'Demo' : undefined,
        phone,
        abha_id: abhaId,
        abha_address: abhaId ? `${abhaId}@abdm` : null,
        preferred_language: state.language || 'en',
      })
      goToConsent(patient)
    } catch (e) {
      console.warn('Patient registration fallback:', e)
      const fallbackPatient = {
        id: 'patient-fallback-' + Date.now(),
        first_name: abhaId ? KIOSK.demoPatientName : name,
        abha_id: abhaId,
        phone,
      }
      goToConsent(fallbackPatient)
    } finally {
      setBusyLocal(false)
      setBusy(false)
    }
  }

  const handleAbhaContinue = async () => {
    const digits = abha.replace(/\s/g, '')
    if (digits.length !== 14) {
      toast(t(state.language, 'enterAbhaPrompt'), 'error')
      return
    }
    await doIdentify({ name: KIOSK.demoPatientName, abhaId: digits })
  }

  const handleGuestContinue = async () => {
    await doIdentify({ name: guestName.trim() || 'Guest', abhaId: null })
  }

  return (
    <div className="kiosk">
      <TopBar voiceText={t(state.language, 'voiceIdentification')} />
      {(busyLocal || state.busy) && <BusyOverlay message={t(state.language, 'pleaseWait')} />}

      <main className="kiosk-main">
        <div className="screen-scroll">
          <div className="screen-pad">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
              <StepIndicator step={1} total={4} label={t(state.language, 'identificationTitle')} />
              <span className="pill pill-teal"><Icon name="shield" size={15} /> {t(state.language, 'abdmBadge')}</span>
            </div>

            <h1 className="screen-title" style={{ marginBottom: 6 }}>{t(state.language, 'enterAbha')}</h1>
            <p className="screen-sub" style={{ marginBottom: 16 }}>
              {t(state.language, 'enterAbhaSub')}
            </p>

            <div className="id-grid">
              <section className="id-left">
                <div className="tabbar" role="tablist">
                  {[
                    { id: 'abha', key: 'abha', icon: 'scan' },
                    { id: 'mobile', key: 'mobileOtp', icon: 'message' },
                    { id: 'guest', key: 'guest', icon: 'user' },
                  ].map((tb) => (
                    <button
                      key={tb.id}
                      type="button"
                      role="tab"
                      className={`tab ${tab === tb.id ? 'active' : ''}`}
                      onClick={() => setTab(tb.id)}
                    >
                      <Icon name={tb.icon} size={16} /> {t(state.language, tb.key)}
                    </button>
                  ))}
                </div>

                {tab === 'abha' && (
                  <div className="card id-card">
                    <div className="abha-input-row">
                      <div className="field-box" style={{ flex: 1 }}>
                        <Icon name="shield" size={20} />
                        <input
                          inputMode="numeric"
                          value={abha}
                          readOnly
                          placeholder="9 1 2 3 – 4 5 6 7 – ..."
                          aria-label="ABHA ID"
                        />
                        <span className="abha-counter">{counter}</span>
                      </div>
                      <button type="button" className="abha-clear" onClick={clearAbha}>
                        {t(state.language, 'clearText')}
                      </button>
                    </div>
                    <Keypad onDigit={pushDigit} onBackspace={backspace} onClear={clearAbha} onDemo={useDemoCard} />
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      style={{ marginTop: 8 }}
                      onClick={handleAbhaContinue}
                    >
                      {t(state.language, 'giveConsent')} <Icon name="chevron" size={19} />
                    </button>
                  </div>
                )}

                {tab === 'mobile' && (
                  <div className="card id-card">
                    <h3 style={{ fontSize: 19 }}>{t(state.language, 'verifyMobile')}</h3>
                    <div className="field-box">
                      <Icon name="message" size={20} />
                      <input
                        inputMode="numeric"
                        value={mobile}
                        readOnly
                        placeholder="10-digit mobile number"
                        aria-label="Mobile number"
                      />
                    </div>
                    <Keypad
                      onDigit={pushPhoneDigit}
                      onBackspace={() => setMobile((p) => p.slice(0, -1))}
                      onClear={() => setMobile('')}
                      onDemo={() => setMobile('9876543210')}
                    />

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSendOtp}
                      disabled={otpSent}
                    >
                      {otpSent ? 'OTP Sent' : t(state.language, 'sendOtp')}
                    </button>

                    {otpSent && (
                      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="field-box">
                          <Icon name="check" size={20} />
                          <input
                            inputMode="numeric"
                            value={otp}
                            readOnly
                            placeholder="Enter 6-digit OTP"
                            aria-label="OTP"
                          />
                        </div>
                        <Keypad
                          onDigit={(d) => setOtp((p) => (p.length >= 6 ? p : p + d))}
                          onBackspace={() => setOtp((p) => p.slice(0, -1))}
                          onClear={() => setOtp('')}
                          onDemo={() => setOtp(DEMO_OTP)}
                        />
                        <div className="otp-hint">{t(state.language, 'demoOtp')}</div>
                        <button type="button" className="btn btn-primary btn-lg" onClick={handleVerifyOtp}>
                          {t(state.language, 'verifyOtp')} <Icon name="chevron" size={19} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'guest' && (
                  <div className="card id-card">
                    <h3 style={{ fontSize: 19 }}>{t(state.language, 'guestWalkin')}</h3>
                    <p className="text-muted" style={{ fontSize: 15 }}>
                      {t(state.language, 'guestSub')}
                    </p>
                    <div className="guest-inputs">
                      <div className="field-box">
                        <Icon name="user" size={20} />
                        <input
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder={t(state.language, 'guestOptionalPlaceholder')}
                          aria-label="First name"
                          style={{ letterSpacing: 0 }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleGuestContinue}
                    >
                      {t(state.language, 'guestContinue')} <Icon name="chevron" size={19} />
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={goToWelcome}>
                    <Icon name="back" size={18} /> {t(state.language, 'back')}
                  </button>
                </div>
              </section>

              <aside className="id-right">
                <div className="card id-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                  <h3 style={{ fontSize: 19 }}>{t(state.language, 'scanQr')}</h3>
                  <div className="qr-frame">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-700)" strokeWidth="1.1" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" style={{ strokeDasharray: '2 2' }} />
                      <path d="M7 7h3v3H7zM14 7h3v3h-3zM7 14h3v3H7zM14 14h1.5v1.5H14zM17 14h3v3h-3zM14 17v3M15.5 17h1.5v1.5h-1.5zM17 17v1.5h1.5V17zM19 17v3" />
                    </svg>
                  </div>
                  <button type="button" className="btn btn-outline" onClick={handleCreateNow}>
                    {t(state.language, 'createNow')} <Icon name="chevron" size={16} />
                  </button>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
                    {t(state.language, 'scanCardSub')}
                  </p>
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