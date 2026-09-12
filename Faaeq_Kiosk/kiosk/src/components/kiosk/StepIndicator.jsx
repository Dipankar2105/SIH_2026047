import { t } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'

export default function StepIndicator({ step, total, label, progress = 0 }) {
  const { state } = useKiosk()
  const text = t(state.language, 'stepOf', { n: step, total, label })
  const doneCount = step - 1

  return (
    <div className="steps" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total} aria-label={text}>
      {[...Array(total)].map((_, i) => {
        const idx = i + 1
        return (
          <span key={idx} className={`step-dot ${idx === step ? 'active' : idx < step ? 'done' : ''}`}>
            {idx}
          </span>
        )
      })}
      <span className="step-label">{label}</span>
      <span className="step-count">{step} / {total}</span>
    </div>
  )
}