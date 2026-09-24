import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useUi } from '../../context/UiContext'
import { secoesPrincipaisVisiveis, secoesAdministrativasVisiveis } from './navConfig'
import logoUfcat from '../../assets/ufcat-logo.png'
import './mobile-nav.css'

export default function MobileNav() {
  const { usuarioAtual, possuiPermissao, sair } = useAuth()
  const navigate = useNavigate()
  const { mobileMenuAberto, fecharMenuMobile } = useUi()

  const itens = secoesPrincipaisVisiveis(possuiPermissao)
  const podeVerAdmin = itens.some((i) => i.id === 'administracao')
  const itensAdmin = podeVerAdmin ? secoesAdministrativasVisiveis(possuiPermissao) : []

  function sairDaConta() {
    fecharMenuMobile()
    sair()
    navigate('/login', { replace: true })
  }

  if (!mobileMenuAberto) return null

  return (
    <>
      <div className="mobile-nav-backdrop" onClick={fecharMenuMobile} />
      <div className="mobile-nav">
        <div className="mobile-nav-brand">
          <img src={logoUfcat} alt="UFCAT" className="mobile-nav-logo" />
          <strong>{usuarioAtual.nome}</strong>
        </div>

        <p className="mobile-nav-label">Navegação</p>
        <ul>
          {itens.map((s) => (
            <li key={s.id}>
              <NavLink to={s.to} end={s.end} onClick={fecharMenuMobile} className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}>
                {s.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {itensAdmin.length > 0 && (
          <>
            <p className="mobile-nav-label">Seções administrativas</p>
            <ul>
              {itensAdmin.map((s) => (
                <li key={s.id}>
                  <NavLink to={s.to} onClick={fecharMenuMobile} className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`}>
                    {s.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}

        <button type="button" className="mobile-nav-sair" onClick={sairDaConta}>
          <LogOut size={16} /> Sair da conta
        </button>
      </div>
    </>
  )
}
