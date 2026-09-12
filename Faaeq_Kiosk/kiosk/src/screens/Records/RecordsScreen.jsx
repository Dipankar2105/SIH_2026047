import { useState, useEffect } from 'react'
import { t, KIOSK } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import TopBar from '../../components/kiosk/TopBar.jsx'
import FooterBar from '../../components/kiosk/FooterBar.jsx'
import Icon from '../../components/common/Icon.jsx'
import BusyOverlay from '../../components/common/BusyOverlay.jsx'
import { apiGet } from '../../services/apiClient.js'

export default function RecordsScreen() {
  const { state, goToWelcome, toast } = useKiosk()
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [documents, setDocuments] = useState([])
  const [lookupAbha, setLookupAbha] = useState(state.patient?.abha_id || '')

  const fetchRecords = async (patientId) => {
    if (!patientId) return
    setLoading(true)
    try {
      const [sumRes, docRes] = await Promise.all([
        apiGet(`/summary/patient/${patientId}`).catch(() => []),
        apiGet(`/documents/patient/${patientId}`).catch(() => []),
      ])
      setRecords(Array.isArray(sumRes) ? sumRes : [])
      setDocuments(Array.isArray(docRes) ? docRes : [])
    } catch (_) {
      setRecords([])
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (state.patient?.id) {
      fetchRecords(state.patient.id)
    }
  }, [state.patient?.id])

  const handleDemoLookup = async () => {
    setLoading(true)
    try {
      // Look up existing seeded patient with summaries
      const res = await apiGet('/summary/patient/6412c306-91dd-4a4c-96d5-ed4a1e43be90').catch(() => [])
      if (Array.isArray(res) && res.length > 0) {
        setRecords(res)
        toast(t(state.language, 'recordsSampleLoaded'), 'success')
      } else {
        setRecords([])
        toast(t(state.language, 'noRecordsFound'), 'info')
      }
    } catch (_) {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="kiosk">
      <TopBar voiceText={t(state.language, 'voiceRecords')} />
      {loading && <BusyOverlay message={t(state.language, 'pleaseWait')} />}

      <main className="kiosk-main">
        <div className="screen-scroll">
          <div className="screen-pad">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => goToWelcome()}>
                  <Icon name="back" size={18} /> {t(state.language, 'back')}
                </button>
                <span className="pill pill-navy">{t(state.language, 'healthRecordsTitle')}</span>
              </div>
              <span className="pill pill-teal">
                <Icon name="shield" size={15} /> {t(state.language, 'abdmBadge')}
              </span>
            </div>

            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: '26px 30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h1 className="screen-title" style={{ fontSize: 24, margin: 0 }}>
                      {t(state.language, 'healthRecordsTitle')}
                    </h1>
                    <p className="screen-sub" style={{ fontSize: 15, margin: 0, marginTop: 4 }}>
                      {t(state.language, 'recordsSub')}
                    </p>
                  </div>
                  {!state.patient && (
                    <button type="button" className="btn btn-outline btn-sm" onClick={handleDemoLookup}>
                      <Icon name="search" size={16} /> {t(state.language, 'recordsSampleBtn')}
                    </button>
                  )}
                </div>

                <div className="divider" style={{ margin: '18px 0' }} />

                {records.length === 0 && documents.length === 0 && !loading && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
                    <h3 style={{ fontSize: 18, color: 'var(--deep)', marginBottom: 6 }}>
                      {t(state.language, 'noRecordsFound')}
                    </h3>
                    <p style={{ fontSize: 14, maxWidth: 460, margin: '0 auto' }}>
                      {t(state.language, 'recordsSub')}
                    </p>
                  </div>
                )}

                {records.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ fontSize: 17, color: 'var(--brand)' }}>{t(state.language, 'recordsSummariesTitle')}</h3>
                    {records.map((rec) => (
                      <div
                        key={rec.id}
                        style={{
                          borderRadius: 12,
                          border: '1px solid var(--line)',
                          padding: '16px 20px',
                          background: 'rgba(255, 255, 255, 0.65)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="pill pill-teal" style={{ textTransform: 'capitalize' }}>
                            {rec.summary_type || 'Clinical'}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                            {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--deep)', margin: 0 }}>
                          {rec.summary_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {documents.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
                    <h3 style={{ fontSize: 17, color: 'var(--brand)' }}>{t(state.language, 'recordsDocsTitle')}</h3>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          borderRadius: 12,
                          border: '1px solid var(--line)',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Icon name="printer" size={20} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{doc.filename || 'Document'}</div>
                            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{doc.document_type}</div>
                          </div>
                        </div>
                        <span className="pill pill-green">{doc.status || 'Verified'}</span>
                      </div>
                    ))}
                  </div>
                )}
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
