import { t } from '../../data/kiosk.js'
import { useKiosk } from '../../state/kioskReducer.js'
import AarogyaLogo from '../branding/AarogyaLogo.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import AudioAssist from './AudioAssist.jsx'
import StaffAssist from './StaffAssist.jsx'

export default function TopBar({ screenTitle, voiceText }) {
  const { state } = useKiosk()

  return (
    <header className="topbar">
      <AarogyaLogo withText sub={t(state.language, 'hospitalKiosk')} />
      {screenTitle && <div className="topbar-title">{screenTitle}</div>}
      <div className="topbar-controls">
        <LanguageSelector />
        <AudioAssist text={voiceText || screenTitle} />
        <StaffAssist />
      </div>
    </header>
  )
}