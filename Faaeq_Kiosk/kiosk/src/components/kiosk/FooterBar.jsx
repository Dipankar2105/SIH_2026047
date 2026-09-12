import Icon from '../common/Icon.jsx'
import { useKiosk } from '../../state/kioskReducer.js'
import { t } from '../../data/kiosk.js'

export default function FooterBar({ left, children }) {
  const { state, reset } = useKiosk()

  return (
    <footer className="footerbar">
      <div className="foot-status">
        {left}
        {children}
      </div>
      <div className="foot-actions">
        <button type="button" className="start-over-btn" onClick={() => reset()}>
          <Icon name="refresh" size={17} /> {t(state.language, 'startOver')}
        </button>
      </div>
    </footer>
  )
}