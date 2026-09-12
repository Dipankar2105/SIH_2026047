export default function Keypad({ value, onDigit, onBackspace, onClear, onDemo }) {
  return (
    <div className="keypad-wrap">
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className="key" onClick={() => onDigit(d)}>
            {d}
          </button>
        ))}
        <button type="button" className="key key-wide demo" onClick={onDemo}>
          Demo Card
        </button>
        <button type="button" className="key" onClick={() => onDigit('0')}>
          0
        </button>
        <button type="button" className="key key-danger" onClick={onBackspace} aria-label="Backspace">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M10 10l4 4"/><path d="M10 14l-4 4"/></svg>
        </button>
      </div>
    </div>
  )
}