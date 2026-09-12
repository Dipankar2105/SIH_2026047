export default function BusyOverlay({ message = 'Loading...' }) {
  return (
    <div className="busy-overlay" role="dialog" aria-modal="true" aria-label={message}>
      <div className="busy-card">
        <div className="spinner" aria-hidden="true" />
        <div style={{ fontWeight: 600, color: 'var(--deep)' }}>{message}</div>
      </div>
    </div>
  )
}