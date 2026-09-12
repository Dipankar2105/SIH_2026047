import Icon from '../common/Icon.jsx'
import { t } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'

export default function StaffAssist() {
  const { toast, state } = useKiosk()
  const text = t(state.language, 'staffNotified')
  const label = t(state.language, 'staffAssist')

  return (
    <button
      type="button"
      className="icon-btn wrap-label"
      onClick={() => toast(text, 'success')}
      aria-label={label}
      title={label}
    >
      <Icon name="help" />
      <span className="mini-label">{label}</span>
    </button>
  )
}