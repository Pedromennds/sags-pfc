import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, DoorOpen, CalendarCheck, ClipboardList,
  Settings2, Users, CalendarClock, CalendarPlus, History, BarChart3,
  UserCircle, ChevronsLeft, LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useUi } from '../../context/UiContext'
import marcaUfcat from '../../assets/ufcat-mark-green.png'
import './sidebar.css'

const itensPrincipais = [
  { to: '/', label: 'Painel', icon: LayoutGrid, end: true },
  { to: '/salas', label: 'Salas', icon: DoorOpen },
  { to: '/minhas-reservas', label: 'Minhas reservas', icon: CalendarCheck },
]

const itensGestao = [
  { to: '/aprovacoes', label: 'Aprovações', icon: ClipboardList, permissao: 'aprovar' },
  { to: '/admin/grade-fixa', label: 'Grade fixa do semestre', icon: CalendarPlus, permissao: 'gerenciar_grade_fixa' },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3, permissao: 'ver_relatorios' },
  { to: '/admin/salas', label: 'Gerenciar salas', icon: Settings2, permissao: 'gerenciar_salas' },
  { to: '/admin/usuarios', label: 'Usuários e papéis', icon: Users, permissao: 'gerenciar_usuarios' },
  { to: '/admin/calendario', label: 'Calendário', icon: CalendarClock, permissao: 'gerenciar_calendario' },
  { to: '/admin/auditoria', label: 'Auditoria', icon: History, permissao: 'ver_auditoria' },
]

const itensConta = [
  { to: '/perfil', label: 'Perfil', icon: UserCircle },
]

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const { usuarioAtual, possuiPermissao } = useAuth()
  const { mobileMenuAberto, fecharMenuMobile } = useUi()

  const itensGestaoVisiveis = itensGestao.filter((item) => possuiPermissao(item.permissao))

  function irEFechar() {
    fecharMenuMobile()
  }

  return (
    <>
      {mobileMenuAberto && <div className="sidebar-backdrop" onClick={fecharMenuMobile} />}
      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileMenuAberto ? 'is-open-mobile' : ''}`}>
        <div className="sidebar-head">
          <div className="sidebar-brand">
            <span className="sidebar-brand-mark"><img src={marcaUfcat} alt="" /></span>
            <span className="sidebar-brand-text">
              <strong>SAGS</strong>
              <small>UFCAT · Catalão</small>
            </span>
          </div>
          <button className="sidebar-toggle" onClick={onToggle} aria-label="Recolher menu">
            <ChevronsLeft size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Principal</p>
          <ul>
            {itensPrincipais.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} onClick={irEFechar} className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
                  <item.icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {itensGestaoVisiveis.length > 0 && (
            <>
              <p className="sidebar-section-label">Gestão</p>
              <ul>
                {itensGestaoVisiveis.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} onClick={irEFechar} className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
                      <item.icon size={18} strokeWidth={2} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="sidebar-section-label">Conta</p>
          <ul>
            {itensConta.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} onClick={irEFechar} className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
                  <item.icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/perfil" onClick={irEFechar} className="sidebar-user">
            <span className="sidebar-user-avatar">{usuarioAtual.nome.split(' ').map(n => n[0]).slice(0,2).join('')}</span>
            <span className="sidebar-user-info">
              <strong>{usuarioAtual.nome}</strong>
              <small>{usuarioAtual.papel}</small>
            </span>
          </NavLink>
          <button className="sidebar-logout" onClick={() => navigate('/login')} aria-label="Sair da conta" title="Sair da conta">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  )
}
