import React, { useState, useEffect } from 'react'
import { identityService } from '../services/api/identity'
import { discoveryService } from '../services/api/discovery'
import { appointmentService } from '../services/api/hospital'
import { intakeService } from '../services/api/intake'
import { safetyService } from '../services/api/safety'
import { documentService } from '../services/api/documents'
import { prescriptionService } from '../services/api/prescription'
import { fhirService } from '../services/api/fhir'
import { IS_MOCK } from '../services/api/client'

/**
 * AarogyaFlow Patient Web App
 *
 * Root component. Manages patient session and renders the appropriate screen.
 *
 * Screens:
 *   - Login / ABHA verification
 *   - Home (dashboard)
 *   - Discovery (find doctors / hospitals)
 *   - Appointment booking
 *   - Consent
 *   - Intake (adaptive Q&A)
 *   - Safety result
 *   - Document upload
 *   - Prescriptions / Health records
 */

export default function App() {
  const [screen, setScreen] = useState(() => (identityService.getLocalSession() ? 'home' : 'login'))
  const [patient, setPatient] = useState(() => identityService.getLocalSession())
  const [appointment, setAppointment] = useState(null)
  const [intake, setIntake] = useState(null)
  const [safety, setSafety] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [healthSummary, setHealthSummary] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(credentials) {
    setLoading(true)
    setError(null)
    try {
      const session = await identityService.login(credentials)
      setPatient(session)
      setScreen('home')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await identityService.logout()
    setPatient(null)
    setAppointment(null)
    setIntake(null)
    setSafety(null)
    setScreen('login')
  }

  async function handleBookAppointment(req) {
    setLoading(true)
    setError(null)
    try {
      const appt = await appointmentService.bookAppointment(req)
      setAppointment(appt)
      setScreen('consent')
    } catch (err) {
      setError(err.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleStartIntake() {
    if (!patient) return
    setLoading(true)
    setError(null)
    try {
      const session = await intakeService.startSession({
        patientId: patient.patientId,
        appointmentId: appointment?.appointmentId,
      })
      setIntake(session)
      setScreen('intake')
    } catch (err) {
      setError(err.message || 'Failed to start intake')
    } finally {
      setLoading(false)
    }
  }

  async function handleIntakeComplete() {
    if (!intake) return
    setLoading(true)
    try {
      const result = await safetyService.getSafetyEvaluation(intake.sessionId)
      setSafety(result)
      setScreen('safety')
    } catch (err) {
      setError(err.message || 'Safety check failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadPrescriptions() {
    if (!patient) return
    setLoading(true)
    try {
      const rxList = await prescriptionService.listPrescriptions(patient.patientId)
      setPrescriptions(rxList)
      setScreen('prescriptions')
    } catch (err) {
      setError(err.message || 'Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadHealthRecords() {
    if (!patient) return
    setLoading(true)
    try {
      const summary = await fhirService.getHealthSummary(patient.patientId)
      setHealthSummary(summary)
      setScreen('health-records')
    } catch (err) {
      setError(err.message || 'Failed to load health records')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Dev API mode badge */}
      {!IS_MOCK && (
        <div style={{
          position: 'fixed', bottom: 8, right: 8, background: '#059669',
          color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 6,
          fontFamily: 'monospace', zIndex: 9999,
        }}>
          LIVE API
        </div>
      )}
      {IS_MOCK && (
        <div style={{
          position: 'fixed', bottom: 8, right: 8, background: '#d97706',
          color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 6,
          fontFamily: 'monospace', zIndex: 9999,
        }}>
          MOCK API
        </div>
      )}

      {error && (
        <div style={{
          background: '#fee2e2', color: '#dc2626', padding: '12px 16px',
          borderBottom: '1px solid #fca5a5', fontSize: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 3,
          background: '#0f766e', animation: 'none', zIndex: 9999,
        }} />
      )}

      {/* ── Screens ── */}

      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} loading={loading} />
      )}

      {screen === 'home' && patient && (
        <HomeScreen
          patient={patient}
          onFindDoctor={() => setScreen('discovery')}
          onViewPrescriptions={handleLoadPrescriptions}
          onViewHealthRecords={handleLoadHealthRecords}
          onLogout={handleLogout}
        />
      )}

      {screen === 'discovery' && (
        <DiscoveryScreen
          onBook={handleBookAppointment}
          onBack={() => setScreen('home')}
          loading={loading}
          patient={patient}
        />
      )}

      {screen === 'consent' && appointment && (
        <ConsentScreen
          appointment={appointment}
          onConsent={handleStartIntake}
          onBack={() => setScreen('discovery')}
          loading={loading}
        />
      )}

      {screen === 'intake' && intake && (
        <IntakeScreen
          session={intake}
          onComplete={handleIntakeComplete}
          patientId={patient?.patientId}
          loading={loading}
        />
      )}

      {screen === 'safety' && safety && (
        <SafetyScreen
          result={safety}
          onContinue={() => setScreen('documents')}
        />
      )}

      {screen === 'documents' && patient && (
        <DocumentsScreen
          patientId={patient.patientId}
          onContinue={() => setScreen('queue-registered')}
        />
      )}

      {screen === 'queue-registered' && (
        <QueueRegisteredScreen
          token={appointmentService.getLocalQueueToken()}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'prescriptions' && (
        <PrescriptionsScreen
          prescriptions={prescriptions}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'health-records' && healthSummary && (
        <HealthRecordsScreen
          summary={healthSummary}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}

// ── Screen Components ─────────────────────────────────────────────────────

function LoginScreen({ onLogin, loading }) {
  const [abhaId, setAbhaId] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onLogin({ abhaId, password })
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏥</div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#0f766e' }}>AarogyaFlow</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Patient Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>ABHA ID / Phone</label>
            <input
              type="text"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
              placeholder="91-XXXX-XXXX-XXXX"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password / OTP</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password or OTP"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9ca3af' }}>
          Secured by ABDM · ABHA Linked
        </p>
      </div>
    </div>
  )
}

function HomeScreen({ patient, onFindDoctor, onViewPrescriptions, onViewHealthRecords, onLogout }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f766e' }}>नमस्ते 👋</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>{patient.name}</p>
        </div>
        <button onClick={onLogout} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Sign Out</button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {[
          { label: '🔍 Find a Doctor', desc: 'Search specialists & book appointments', action: onFindDoctor },
          { label: '💊 My Prescriptions', desc: 'View prescriptions from your doctors', action: onViewPrescriptions },
          { label: '📋 Health Records', desc: 'ABHA-linked medical history', action: onViewHealthRecords },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'left', cursor: 'pointer', display: 'block', width: '100%', transition: 'box-shadow 0.15s' }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function DiscoveryScreen({ onBook, onBack, loading, patient }) {
  const [doctors, setDoctors] = useState([])
  const [fetching, setFetching] = useState(true)
  const [selected, setSelected] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [complaint, setComplaint] = useState('')

  useEffect(() => {
    import('../services/api/discovery').then(({ discoveryService }) => {
      discoveryService.searchDoctors().then((docs) => {
        setDoctors(docs)
        setFetching(false)
      })
    })
  }, [])

  async function handleSelectDoctor(doctor) {
    setSelected(doctor)
    const { discoveryService } = await import('../services/api/discovery')
    const available = await discoveryService.getAvailableSlots(doctor.doctorId)
    setSlots(available.filter((s) => s.available))
  }

  async function handleBook() {
    if (!selected || !selectedSlot || !patient) return
    await onBook({
      patientId: patient.patientId,
      doctorId: selected.doctorId,
      hospitalId: selected.hospitalId,
      slotId: selectedSlot.slotId,
      chiefComplaint: complaint || 'General consultation',
    })
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}>← Back</button>
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>Find a Doctor</h2>

      {fetching ? <div className="spinner" /> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {doctors.map((doc) => (
            <div
              key={doc.doctorId}
              onClick={() => handleSelectDoctor(doc)}
              style={{
                background: selected?.doctorId === doc.doctorId ? '#f0fdfa' : '#fff',
                border: `1.5px solid ${selected?.doctorId === doc.doctorId ? '#0f766e' : '#e5e7eb'}`,
                borderRadius: 12, padding: 16, cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{doc.name}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{doc.specialty} · {doc.hospitalName}</div>
              <div style={{ fontSize: 12, color: doc.availableToday ? '#059669' : '#94a3b8', marginTop: 4 }}>
                {doc.availableToday ? '✓ Available today' : 'Next: ' + new Date(doc.nextAvailable).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && slots.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Select a time slot</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {slots.map((slot) => (
              <button
                key={slot.slotId}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  background: selectedSlot?.slotId === slot.slotId ? '#0f766e' : '#f8fafc',
                  color: selectedSlot?.slotId === slot.slotId ? '#fff' : '#374151',
                  border: `1px solid ${selectedSlot?.slotId === slot.slotId ? '#0f766e' : '#e5e7eb'}`,
                  borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                }}
              >
                {new Date(slot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Chief Complaint</label>
            <input
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Briefly describe your symptoms"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
            />
          </div>

          <button
            onClick={handleBook}
            disabled={!selectedSlot || loading}
            style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: !selectedSlot || loading ? 0.6 : 1 }}
          >
            {loading ? 'Booking…' : 'Book Appointment'}
          </button>
        </div>
      )}
    </div>
  )
}

function ConsentScreen({ appointment, onConsent, onBack, loading }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}>← Back</button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Consent & Privacy</h2>

      <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>Your Appointment</h3>
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
          <div><strong>Doctor:</strong> {appointment.doctorName}</div>
          <div><strong>Hospital:</strong> {appointment.hospitalName}</div>
          <div><strong>Specialty:</strong> {appointment.specialty}</div>
          <div><strong>Time:</strong> {new Date(appointment.scheduledAt).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
        <strong>Data Consent:</strong> AarogyaFlow will collect your symptom information through an adaptive questionnaire. This data will be shared with your doctor and stored securely under your ABHA record. Your data will NOT be shared with third parties.
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 24 }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
        <span style={{ fontSize: 14, color: '#374151' }}>I consent to the collection and use of my health information as described above.</span>
      </label>

      <button
        onClick={onConsent}
        disabled={!agreed || loading}
        style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: !agreed || loading ? 0.6 : 1 }}
      >
        {loading ? 'Starting intake…' : 'Proceed to Intake'}
      </button>
    </div>
  )
}

function IntakeScreen({ session, onComplete, patientId, loading }) {
  const [currentQuestion, setCurrentQuestion] = useState(session.currentQuestion)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [safetyFlag, setSafetyFlag] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim()) return
    setSubmitting(true)
    try {
      const { intakeService } = await import('../services/api/intake')
      const result = await intakeService.submitAnswer({
        sessionId: session.sessionId,
        questionId: currentQuestion.questionId,
        answer,
      })
      if (result.safetyFlagRaised) setSafetyFlag(true)
      setAnswer('')
      if (result.completed) {
        setDone(true)
      } else {
        setCurrentQuestion(result.nextQuestion)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{safetyFlag ? '⚠️' : '✅'}</div>
        <h2 style={{ fontWeight: 700, color: safetyFlag ? '#dc2626' : '#059669' }}>
          {safetyFlag ? 'Urgent Attention Required' : 'Intake Complete'}
        </h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          {safetyFlag ? 'Our system has detected symptoms that require immediate clinical review.' : 'Your intake is complete. Thank you for your responses.'}
        </p>
        <button onClick={onComplete} disabled={loading} style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Checking…' : 'View Safety Assessment'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Health Intake</h2>
      {currentQuestion && (
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#1e293b', marginTop: 0 }}>{currentQuestion.text}</p>

            {currentQuestion.type === 'yes_no' ? (
              <div style={{ display: 'flex', gap: 12 }}>
                {['Yes', 'No'].map((opt) => (
                  <button key={opt} type="button" onClick={() => setAnswer(opt)}
                    style={{ flex: 1, padding: '10px', border: `1.5px solid ${answer === opt ? '#0f766e' : '#e5e7eb'}`, background: answer === opt ? '#0f766e' : '#fff', color: answer === opt ? '#fff' : '#374151', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : currentQuestion.type === 'single_choice' && currentQuestion.options ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentQuestion.options.map((opt) => (
                  <button key={opt} type="button" onClick={() => setAnswer(opt)}
                    style={{ padding: '10px 14px', border: `1.5px solid ${answer === opt ? '#0f766e' : '#e5e7eb'}`, background: answer === opt ? '#f0fdfa' : '#fff', color: '#374151', borderRadius: 8, fontSize: 14, textAlign: 'left', cursor: 'pointer' }}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here…"
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, resize: 'vertical' }}
              />
            )}
          </div>

          <button type="submit" disabled={!answer || submitting}
            style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: !answer || submitting ? 0.6 : 1 }}>
            {submitting ? 'Next…' : 'Next →'}
          </button>
        </form>
      )}
    </div>
  )
}

function SafetyScreen({ result, onContinue }) {
  const isUrgent = result.immediateAttentionRequired

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <div style={{
        background: isUrgent ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${isUrgent ? '#fca5a5' : '#86efac'}`,
        borderRadius: 12, padding: 24, marginBottom: 24,
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>{isUrgent ? '🚨' : '✅'}</div>
        <h2 style={{ margin: '0 0 8px', color: isUrgent ? '#dc2626' : '#059669', fontSize: 20, fontWeight: 700 }}>
          {isUrgent ? 'Immediate Attention Required' : 'No Urgent Flags Detected'}
        </h2>
        <p style={{ margin: 0, color: '#374151', fontSize: 14 }}>
          {isUrgent ? 'Please inform the reception desk immediately. A nurse will assist you.' : 'Your intake is complete. Please proceed to document upload and then register in the queue.'}
        </p>

        {result.flags.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {result.flags.map((flag) => (
              <div key={flag.flagId} style={{ background: '#fff', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginTop: 8, fontSize: 13 }}>
                <strong style={{ color: '#dc2626' }}>{flag.description}</strong>
                <div style={{ color: '#6b7280', marginTop: 4 }}>{flag.recommendedAction}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onContinue}
        style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
        Upload Documents →
      </button>
    </div>
  )
}

function DocumentsScreen({ patientId, onContinue }) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState([])
  const [error, setError] = useState(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { documentService } = await import('../services/api/documents')
      const result = await documentService.uploadDocument(file, patientId)
      setUploaded((prev) => [...prev, { ...result, filename: file.name }])
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Upload Documents</h2>
      <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>Upload any existing lab reports, prescriptions, or medical documents (optional).</p>

      <label style={{ display: 'block', background: '#f8fafc', border: '2px dashed #e5e7eb', borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Click to upload a document</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>PDF, JPG, PNG up to 10MB</div>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
      </label>

      {uploading && <div style={{ color: '#0f766e', fontSize: 14 }}>Uploading…</div>}
      {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}

      {uploaded.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {uploaded.map((doc) => (
            <div key={doc.documentId} style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginTop: 8, fontSize: 13, color: '#065f46' }}>
              ✓ {doc.filename}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onContinue} style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Register in Queue →
        </button>
        <button onClick={onContinue} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 24px', fontSize: 14, color: '#64748b', cursor: 'pointer' }}>
          Skip
        </button>
      </div>
    </div>
  )
}

function QueueRegisteredScreen({ token, onHome }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎟️</div>
      <h2 style={{ fontWeight: 700, fontSize: 24, color: '#0f766e' }}>You&apos;re in the Queue!</h2>
      {token && (
        <div style={{ background: '#f0fdfa', border: '2px solid #0f766e', borderRadius: 12, padding: '20px 32px', display: 'inline-block', margin: '16px auto 24px' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>YOUR TOKEN</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#0f766e', letterSpacing: 4 }}>{token}</div>
        </div>
      )}
      <p style={{ color: '#64748b', marginBottom: 24 }}>Please wait in the waiting area. Your doctor will be notified when it&apos;s your turn.</p>
      <button onClick={onHome} style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
        Back to Home
      </button>
    </div>
  )
}

function PrescriptionsScreen({ prescriptions, onBack }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}>← Back</button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>My Prescriptions</h2>

      {prescriptions.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No prescriptions found.</div>
      ) : (
        prescriptions.map((rx) => (
          <div key={rx.prescriptionId} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{rx.doctorName}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(rx.issuedAt).toLocaleDateString('en-IN')}</div>
            </div>
            {rx.diagnoses && <div style={{ fontSize: 13, color: '#0f766e', marginBottom: 8 }}>Diagnosis: {rx.diagnoses.join(', ')}</div>}
            {rx.medications.map((med, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 6, fontSize: 13 }}>
                <strong>{med.medicineName}</strong> — {med.dosage} · {med.frequency} · {med.duration}
                <div style={{ color: '#64748b', marginTop: 2 }}>{med.instructions}</div>
              </div>
            ))}
            {rx.notes && <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>Note: {rx.notes}</div>}
            {rx.followUpDate && <div style={{ marginTop: 4, fontSize: 12, color: '#059669' }}>Follow-up: {rx.followUpDate}</div>}
          </div>
        ))
      )}
    </div>
  )
}

function HealthRecordsScreen({ summary, onBack }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 20 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}>← Back</button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Health Records</h2>
      {!summary.abhaLinked && <div style={{ color: '#d97706', fontSize: 13, marginBottom: 16 }}>⚠ ABHA not linked. Connect your ABHA to see your complete health history.</div>}

      {[
        { label: 'Active Conditions', items: summary.conditions },
        { label: 'Current Medications', items: summary.medications },
        { label: 'Recent Observations', items: summary.observations },
        { label: 'Immunizations', items: summary.immunizations },
        { label: 'Allergies', items: summary.allergies },
      ].map(({ label, items }) => (
        <div key={label} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</h3>
          {items.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>None recorded</div>
          ) : (
            items.map((item) => (
              <div key={item.recordId} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', marginBottom: 6, fontSize: 13 }}>
                <span style={{ fontWeight: 500 }}>{item.title}</span>
                {item.value && <span style={{ color: '#64748b' }}> — {item.value}</span>}
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{new Date(item.date).toLocaleDateString('en-IN')} · {item.source}</div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  )
}
