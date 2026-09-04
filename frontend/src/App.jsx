import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('kiosk');
  const [patientInput, setPatientInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'bot', text: 'Namaste! Welcome to Medikiosk. What symptom or health issue brings you here today?' }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!patientInput.trim()) return;

    const userMsg = patientInput;
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setPatientInput('');

    setTimeout(() => {
      if (userMsg.toLowerCase().includes('chest pain') || userMsg.toLowerCase().includes('heart')) {
        setChatLog((prev) => [
          ...prev,
          { 
            sender: 'bot', 
            text: '🚨 CRITICAL TRIAGE ALERT: Chest pain detected. Red Flag Safety Protocol Activated. Please proceed immediately to Emergency Counter #1.',
            urgent: true
          }
        ]);
      } else {
        setChatLog((prev) => [
          ...prev,
          { sender: 'bot', text: 'Thank you for detailing that. How many days have you been experiencing this?' }
        ]);
      }
    }, 600);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #14b8a6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
          }}>🩺</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, background: 'linear-gradient(90deg, #38bdf8, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Medikiosk
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>AI Clinical Intake & ABDM Triage Portal</p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '10px', background: '#1e293b', padding: '6px', borderRadius: '12px' }}>
          {['kiosk', 'dashboard', 'fhir'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab ? '#0284c7' : 'transparent',
                color: activeTab === tab ? '#fff' : '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
            >
              {tab === 'kiosk' ? 'Self Intake Kiosk' : tab === 'dashboard' ? 'Doctor Dashboard' : 'FHIR R4 Export'}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'kiosk' && (
        <main style={{ background: '#1e293b', borderRadius: '20px', padding: '30px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Kiosk Session #KS-8902</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '18px' }}>Multilingual Voice & Text Intake</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ background: '#0369a1', color: '#e0f2fe', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>ABHA Linked</span>
              <span style={{ background: '#15803d', color: '#dcfce7', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>Triage: Normal</span>
            </div>
          </div>

          <div style={{ height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '10px', marginBottom: '20px' }}>
            {chatLog.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: msg.urgent ? '#7f1d1d' : msg.sender === 'user' ? '#0284c7' : '#334155',
                  color: msg.urgent ? '#fecaca' : '#f8fafc',
                  border: msg.urgent ? '1px solid #ef4444' : 'none',
                  lineHeight: '1.5'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Type your symptoms or talk in your preferred language..."
              value={patientInput}
              onChange={(e) => setPatientInput(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #475569',
                background: '#0f172a',
                color: '#fff',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7, #14b8a6)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Submit Answer
            </button>
          </form>
        </main>
      )}

      {activeTab === 'dashboard' && (
        <main style={{ background: '#1e293b', borderRadius: '20px', padding: '30px', border: '1px solid #334155' }}>
          <h2>Clinical Triage & Patient Queue</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '12px' }}>Token</th>
                <th style={{ padding: '12px' }}>Patient Name</th>
                <th style={{ padding: '12px' }}>ABHA ID</th>
                <th style={{ padding: '12px' }}>Chief Complaint</th>
                <th style={{ padding: '12px' }}>Triage Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '14px 12px', fontWeight: 'bold' }}>TK-102</td>
                <td style={{ padding: '14px 12px' }}>Ramesh Kumar</td>
                <td style={{ padding: '14px 12px' }}>91-8843-1102-9981</td>
                <td style={{ padding: '14px 12px' }}>High fever & sore throat for 3 days</td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ background: '#15803d', color: '#dcfce7', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>GREEN (Low)</span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '14px 12px', fontWeight: 'bold' }}>TK-103</td>
                <td style={{ padding: '14px 12px' }}>Sunita Sharma</td>
                <td style={{ padding: '14px 12px' }}>91-4491-0021-3312</td>
                <td style={{ padding: '14px 12px' }}>Acute dyspnea & chest heaviness</td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ background: '#b91c1c', color: '#fee2e2', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>RED (Emergency)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      )}

      {activeTab === 'fhir' && (
        <main style={{ background: '#1e293b', borderRadius: '20px', padding: '30px', border: '1px solid #334155' }}>
          <h2>FHIR R4 Resource Bundle Generator</h2>
          <pre style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', overflowX: 'auto', color: '#38bdf8', fontSize: '13px' }}>
{JSON.stringify({
  "resourceType": "Bundle",
  "id": "bundle-patient-102",
  "type": "document",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "p-102",
        "identifier": [{"system": "https://healthid.abdm.gov.in", "value": "91-8843-1102-9981"}],
        "name": [{"text": "Ramesh Kumar"}],
        "gender": "male"
      }
    }
  ]
}, null, 2)}
          </pre>
        </main>
      )}
    </div>
  );
}
