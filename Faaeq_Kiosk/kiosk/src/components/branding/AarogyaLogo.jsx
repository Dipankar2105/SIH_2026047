import logoImg from '../../assets/aarogyaflow-logo.png'

export default function AarogyaLogo({ size = 44, withText = false, sub = '' }) {
  return (
    <div className="brand-lockup">
      <img
        src={logoImg}
        alt="AarogyaFlow"
        className="brand-logo-img"
        style={{
          height: size,
          width: 'auto',
          maxHeight: size,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
        }}
      />
      {withText && (
        <div>
          <div className="logo-text">
            Aarogya<span>Flow</span>
          </div>
          {sub && <div className="brand-sub">{sub}</div>}
        </div>
      )}
    </div>
  )
}