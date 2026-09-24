import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { secaoAtiva, subitensVisiveis } from './navConfig'
import './context-sidebar.css'

export default function ContextSidebar() {
  const { pathname } = useLocation()
  const { possuiPermissao } = useAuth()

  const secao = secaoAtiva(pathname)
  if (!secao) return null

  const itens = subitensVisiveis(secao, possuiPermissao)
  if (itens.length <= 1) return null

  return (
    <aside className="context-sidebar">
      <p className="context-sidebar-titulo">{secao.label}</p>
      <ul>
        {itens.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={({ isActive }) => `context-sidebar-link ${isActive ? 'is-active' : ''}`}>
              <item.icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
