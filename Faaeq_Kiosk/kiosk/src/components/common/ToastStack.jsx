import { useKiosk } from '../../state/kioskReducer.js'
import Icon from '../common/Icon.jsx'

export default function ToastStack() {
  const { state } = useKiosk()

  if (!state.toast) return null

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      <div className={`toast toast-${state.toast.variant}`}>
        {state.toast.msg}
      </div>
    </div>
  )
}