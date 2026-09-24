import './topbar.css'

export default function Topbar({ title, subtitle, actions }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-texto">
          <h1>{title}</h1>
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="topbar-actions">{actions}</div>}
      </div>
    </header>
  )
}
