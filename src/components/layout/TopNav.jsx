import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useUi } from '../../context/UiContext'
import { secoesPrincipaisVisiveis } from './navConfig'
import UserMenu from './UserMenu'
import logoUfcat from '../../assets/ufcat-logo.png'
import './topnav.css'

export default function TopNav() {
  const { possuiPermissao } = useAuth()
  const { alternarMenuMobile } = useUi()
  const itens = secoesPrincipaisVisiveis(possuiPermissao)

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <div className="topnav-left">
          <button className="topnav-menu-btn" onClick={alternarMenuMobile} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <NavLink to="/painel" className="topnav-brand" aria-label="UFCAT — ir para o painel">
            <img src={logoUfcat} alt="UFCAT" className="topnav-brand-logo" />
          </NavLink>
        </div>

        <nav className="topnav-tabs">
          {itens.map((secao) => (
            <NavLink
              key={secao.id}
              to={secao.to}
              end={secao.end}
              className={({ isActive }) => `topnav-tab ${isActive ? 'is-active' : ''}`}
            >
              {secao.label}
            </NavLink>
          ))}
        </nav>

        <div className="topnav-right">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
