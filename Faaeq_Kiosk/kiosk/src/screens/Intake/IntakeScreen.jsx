import { useState, useRef, useEffect, useCallback } from 'react'
import { t, KIOSK, INTAKE_SYMPTOMS, PAIN_LOCATIONS } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import TopBar from '../../components/kiosk/TopBar.jsx'
import FooterBar from '../../components/kiosk/FooterBar.jsx'
import StepIndicator from '../../components/kiosk/StepIndicator.jsx'
import Chip from '../../components/common/Chip.jsx'
import Icon from '../../components/common/Icon.jsx'
import { speak } from '../../components/kiosk/AudioAssist.jsx'
import VoiceMic, { VOICE_STATES } from '../../components/voice/VoiceMic.jsx'
import BusyOverlay from '../../components/common/BusyOverlay.jsx'
import { submitIntakeMessage } from '../../services/intakeService.js'
import { transcribeVoice } from '../../services/voiceService.js'
import { issueToken } from '../../services/queueService.js'

const STAGE_LABEL = ['2', '3', '4', 'Final']

async function blobToBase64(blob) {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

export default function IntakeScreen() {
  const { state, updateIntake, triggerEmergency, complete, toast, setBusy, goToConsent } = useKiosk()
  const patientName = state.patient?.first_name || KIOSK.demoPatientName

  const [stage, setStage] = useState(0)
  const [selectedChip, setSelectedChip] = useState(null)
  const [painLocation, setPainLocation] = useState(null)
  const [answerText, setAnswerText] = useState('')
  const [scaleValue, setScaleValue] = useState(null)
  const [conditions, setConditions] = useState('')
  const [medications, setMedications] = useState('')
  const [backendTexts, setBackendTexts] = useState({})
  const [micState, setMicState] = useState(VOICE_STATES.IDLE)
  const [submitting, setSubmitting] = useState(false)
  const [recognized, setRecognized] = useState('')

  const recRef = useRef(null)
  const recDoneRef = useRef(null)
  const idleTimerRef = useRef(null)

  const stageLabel = STAGE_LABEL[stage] || 'Final'

  const getQuestionFallback = (st) => {
    if (st === 1) return t(state.language, 'intakeDurationPrompt')
    if (st === 2) return t(state.language, 'intakeSeverityPrompt')
    if (st === 3) return t(state.language, 'intakeOtherDetailsPrompt')
    return t(state.language, 'anythingElse')
  }

  const questionText =
    stage === 0
      ? t(state.language, 'mainQ')
      : backendTexts[stage] || getQuestionFallback(stage)

  useEffect(() => () => stopRecording(), [])

  const stopRecording = useCallback(() => {
    if (recRef.current && recRef.current.state !== 'inactive') {
      try {
        recRef.current.stop()
      } catch (e) {
        /* noop */
      }
    }
    recRef.current = null
  }, [])

  const enterMicError = useCallback((msg) => {
    setMicState(VOICE_STATES.ERROR)
    toast(msg, 'error')
    clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setMicState(VOICE_STATES.IDLE), 3200)
  }, [toast])

  const handleMic = async () => {
    if (micState === VOICE_STATES.IDLE) {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
          enterMicError(t(state.language, 'voiceErr'))
          return
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        const chunks = []
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data)
        }
        const done = new Promise((resolve) => {
          recorder.onstop = () => {
            stream.getTracks().forEach((tr) => tr.stop())
            const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
            blobToBase64(blob).then(resolve).catch(() => resolve(''))
          }
        })
        recRef.current = recorder
        recDoneRef.current = done
        recorder.start()
        setMicState(VOICE_STATES.LISTENING)
      } catch (err) {
        enterMicError(t(state.language, 'voiceErr'))
      }
      return
    }

    if (micState === VOICE_STATES.LISTENING) {
      setMicState(VOICE_STATES.PROCESSING)
      const recorder = recRef.current
      if (!recorder) {
        setMicState(VOICE_STATES.IDLE)
        return
      }
      try {
        const base64Promise = recDoneRef.current || Promise.resolve('')
        recorder.stop()
        const base64 = await base64Promise
        const res = await transcribeVoice(base64, state.language, stage)
        const text = (res && (res.original_text || res.text)) || ''
        const confidence = typeof res?.confidence === 'number' ? res.confidence : 0.96

        if (text) {
          setAnswerText(text)
          setRecognized(text)
        }

        if (confidence < 0.55 || !text) {
          setMicState(VOICE_STATES.LOW_CONFIDENCE)
          toast(t(state.language, 'lowConf'), 'error')
          clearTimeout(idleTimerRef.current)
          idleTimerRef.current = setTimeout(() => setMicState(VOICE_STATES.IDLE), 3000)
        } else {
          setMicState(VOICE_STATES.SUCCESS)
          clearTimeout(idleTimerRef.current)
          idleTimerRef.current = setTimeout(() => setMicState(VOICE_STATES.IDLE), 2400)
        }
      } catch (err) {
        enterMicError(t(state.language, 'voiceErr'))
      } finally {
        recRef.current = null
        recDoneRef.current = null
      }
    }
  }

  const buildTrigger = (msg, res) => {
    const m = (msg || '').toLowerCase()
    if (/chest|cardiac|heart|\u0938\u0940\u0928\u0947|\u091b\u093e\u0924\u0940/.test(m)) {
      return t(state.language, 'triggerText')
    }
    if (/breath|cannot breathe|choking|gasping|\u0938\u093e\u0902\u0938/.test(m)) {
      return t(state.language, 'triggerText')
    }
    return 'Patient reported: ' + msg.slice(0, 80)
  }

  const handleNext = async () => {
    if (submitting) return

    // Allow chip OR text in stage 0
    if (stage === 0 && !selectedChip && !answerText.trim()) {
      toast(t(state.language, 'selectMainSymptom'), 'error')
      return
    }
    if (stage === 1 && !answerText.trim()) {
      toast(t(state.language, 'tellDuration'), 'error')
      return
    }
    if (stage === 2 && !scaleValue && !answerText.trim()) {
      toast(t(state.language, 'tapScaleNumber'), 'error')
      return
    }

    setSubmitting(true)
    setBusy(true)
    try {
      let message = ''
      if (stage === 0) {
        const sym = INTAKE_SYMPTOMS.find((s) => s.id === selectedChip)
        const chipText = sym ? t(state.language, sym.textKey) : selectedChip
        if (answerText.trim() && chipText) {
          message = `${chipText} — ${answerText.trim()}`
        } else if (chipText) {
          message = sym?.mockMsg || chipText
        } else {
          message = answerText.trim()
        }

        const loc = PAIN_LOCATIONS.find((p) => p.id === painLocation)
        if (loc) message += ', ' + t(state.language, loc.textKey).toLowerCase()
      } else if (stage === 1) {
        message = answerText.trim() || 'A few days'
      } else if (stage === 2) {
        message = answerText.trim() || (scaleValue ? `The pain is ${scaleValue} out of 10` : 'Moderate')
      } else {
        message = answerText.trim() || 'No other details'
      }

      const stepIdx = stage <= 2 ? stage : 3
      const res = await submitIntakeMessage({
        message,
        language: state.language,
        step: stepIdx,
        sessionId: state.sessionId,
      })

      if (res && res.is_urgent) {
        triggerEmergency(
          buildTrigger(message, res),
          {
            is_emergency: true,
            severity: res.triage_priority || 'emergency',
            recommended_specialty: res.recommended_specialty,
            matched_category: 'intake_red_flag',
          },
          'intake',
        )
        return
      }

      if (stage === 0) {
        if (res && res.next_question) setBackendTexts((b) => ({ ...b, 1: res.next_question }))
        setStage(1)
        setAnswerText('')
        setRecognized('')
        updateIntake({ symptom: selectedChip || 'other', painLocation, step: 1 })
        return
      }

      if (stage === 1) {
        if (res && res.next_question) setBackendTexts((b) => ({ ...b, 2: res.next_question }))
        setStage(2)
        setAnswerText('')
        setRecognized('')
        updateIntake({ step: 2 })
        return
      }

      if (stage === 2) {
        setStage(3)
        setAnswerText('')
        setRecognized('')
        updateIntake({ severity: scaleValue, step: 3 })
        return
      }

      await finishIntake(conditions, medications)
    } catch (err) {
      toast(t(state.language, 'generalErrorPrompt'), 'error')
    } finally {
      setSubmitting(false)
      setBusy(false)
    }
  }

  const finishIntake = async (condText, medText) => {
    const cond = condText.trim() || 'No reported conditions'
    const meds = medText.trim() || 'No regular medications'
    const r1 = await submitIntakeMessage({ message: cond, language: state.language, step: 3, sessionId: state.sessionId })
    if (r1 && r1.is_urgent) {
      triggerEmergency(buildTrigger(cond, r1), { is_emergency: true, severity: r1.triage_priority || 'emergency', recommended_specialty: r1.recommended_specialty, matched_category: 'intake_red_flag' }, 'intake')
      return
    }
    const r2 = await submitIntakeMessage({ message: meds, language: state.language, step: 4, sessionId: state.sessionId })
    if (r2 && r2.is_urgent) {
      triggerEmergency(buildTrigger(meds, r2), { is_emergency: true, severity: r2.triage_priority || 'emergency', recommended_specialty: r2.recommended_specialty, matched_category: 'intake_red_flag' }, 'intake')
      return
    }
    const token = await issueToken({
      patientId: state.patient?.id || null,
      hospitalId: KIOSK.kioskHospitalId,
      doctorId: KIOSK.kioskDoctorId,
      hospitalName: KIOSK.hospitalName,
      doctorName: KIOSK.doctorName,
    })
    complete(token)
  }

  const handleBack = () => {
    if (stage === 0) {
      goToConsent(state.patient)
      return
    }
    setStage((s) => s - 1)
    setAnswerText('')
  }

  const handleListen = () => {
    const ok = speak(questionText, state.language)
    if (!ok) toast(t(state.language, 'audioUnavailable'), 'error')
  }

  return (
    <div className="kiosk">
      <TopBar voiceText={t(state.language, 'voiceIntake')} />
      {submitting && <BusyOverlay message={t(state.language, 'processing')} />}

      <main className="kiosk-main">
        <div className="screen-scroll">
          <div className="screen-pad intake-wrap">
            <div className="intake-head">
              <StepIndicator step={3} total={4} label={t(state.language, 'intakeTitle')} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="pill pill-teal">
                  {t(state.language, 'questionOf', { n: stageLabel, total: 4 })}
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleListen}>
                  <Icon name="speaker" size={16} /> {t(state.language, 'listen')}
                </button>
              </div>
            </div>

            <div className="progress-rail">
              <div className="fill" style={{ width: `${Math.min(100, ((stage + 1) / 4) * 100)}%` }} />
            </div>

            {stage === 0 && (
              <div className="card intake-question-card">
                <div className="intake-q-head">
                  <div>
                    <h2 className="intake-greeting" style={{ marginBottom: 6 }}>
                      {t(state.language, 'helloName', { name: patientName })}
                    </h2>
                    <p className="screen-sub" style={{ fontSize: 16, maxWidth: 900 }}>
                      {t(state.language, 'aryaI')}
                    </p>
                  </div>
                </div>

                <h3 className="intake-q">{questionText}</h3>
                <div className="intake-chips">
                  {INTAKE_SYMPTOMS.map((s) => (
                    <Chip
                      key={s.id}
                      selected={selectedChip === s.id}
                      onClick={() => setSelectedChip(s.id)}
                      emoji={s.emoji}
                    >
                      {t(state.language, s.textKey)}
                    </Chip>
                  ))}
                </div>

                <div className="divider" />

                <div className="intake-location">
                  <h4><Icon name="location" size={18} /> {t(state.language, 'painQ')}</h4>
                  <div className="location-options">
                    {PAIN_LOCATIONS.map((p) => (
                      <Chip key={p.id} option selected={painLocation === p.id} onClick={() => setPainLocation(p.id)}>
                        {t(state.language, p.textKey)}
                      </Chip>
                    ))}
                  </div>
                </div>

                {selectedChip && (
                  <div className="identified-bar">
                    <Icon name="checkcircle" size={19} />
                    {t(state.language, 'identified')} {t(state.language, INTAKE_SYMPTOMS.find((s) => s.id === selectedChip)?.textKey || 'chipOther')}
                    <span className="pill pill-green" style={{ marginLeft: 'auto' }}>{t(state.language, 'confirmed')}</span>
                  </div>
                )}
              </div>
            )}

            {stage === 1 && (
              <div className="card intake-question-card">
                <h3 className="intake-q" style={{ maxWidth: 'none' }}>{questionText}</h3>
                <div className="field-box">
                  <Icon name="clock" size={20} />
                  <input
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder={t(state.language, 'durationPlaceholder')}
                    aria-label="Duration answer"
                    style={{ letterSpacing: 0 }}
                  />
                </div>
                {recognized && <div className="voice-note">🎙️ {t(state.language, 'recognized')} "{recognized}"</div>}
              </div>
            )}

            {stage === 2 && (
              <div className="card intake-question-card">
                <h3 className="intake-q" style={{ maxWidth: 'none' }}>{questionText}</h3>
                <div className="scale-row">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`scale-key ${scaleValue === n ? 'selected' : ''}`}
                      onClick={() => setScaleValue(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="field-box">
                  <Icon name="message" size={20} />
                  <input
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder={t(state.language, 'severityPlaceholder')}
                    aria-label="Severity note"
                    style={{ letterSpacing: 0 }}
                  />
                </div>
                {recognized && <div className="voice-note">🎙️ {t(state.language, 'recognized')} "{recognized}"</div>}
              </div>
            )}

            {stage === 3 && (
              <div className="card intake-question-card">
                <h3 className="intake-q" style={{ maxWidth: 'none' }}>{questionText}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label style={{ fontWeight: 700, fontSize: 16, color: 'var(--deep)' }}>{t(state.language, 'anyConditions')}</label>
                  <div className="field-box">
                    <Icon name="shield" size={20} />
                    <input value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder={t(state.language, 'conditionsPlaceholder')} aria-label="Existing conditions" style={{ letterSpacing: 0 }} />
                  </div>
                  <label style={{ fontWeight: 700, fontSize: 16, color: 'var(--deep)' }}>{t(state.language, 'anyMedications')}</label>
                  <div className="field-box">
                    <Icon name="message" size={20} />
                    <input value={medications} onChange={(e) => setMedications(e.target.value)} placeholder={t(state.language, 'medicationsPlaceholder')} aria-label="Medications" style={{ letterSpacing: 0 }} />
                  </div>
                </div>
              </div>
            )}

            <div className="intake-footer-actions">
              <button type="button" className="btn btn-ghost" onClick={handleBack}>
                <Icon name="back" size={18} /> {t(state.language, 'back')}
              </button>
              <div className="field-box" style={{ flex: 1 }}>
                <textarea
                  rows={1}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder={stage === 0 ? t(state.language, 'intakeFreeTextPlaceholder') : t(state.language, 'intakeTypeOrSpeak')}
                  aria-label="Free text answer"
                />
              </div>
              <VoiceMic state={micState} step={stage} onStart={handleMic} onStop={handleMic} disabled={submitting} />
              <button type="button" className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                {stage >= 3 ? t(state.language, 'done') : t(state.language, 'nextQ')} <Icon name="chevron" size={18} />
              </button>
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