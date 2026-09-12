export default function Chip({
  children,
  selected = false,
  onClick,
  disabled = false,
  className = '',
  option = false,
  emoji = '',
  'aria-label': ariaLabel,
}) {
  const cls = ['chip']
  if (option) cls.push('chip-option')
  if (selected) cls.push('selected')
  if (className) cls.push(className)

  return (
    <button
      type="button"
      className={cls.join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={ariaLabel}
    >
      {emoji && <span className="chip-emoji">{emoji}</span>}
      <span>{children}</span>
    </button>
  )
}