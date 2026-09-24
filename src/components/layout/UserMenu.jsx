import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, UserCircle, Repeat, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './user-menu.css'

function iniciaisDe(nome) {
  return nome.split(' ').map((parte) => parte[0]).slice(0, 2).join('')
}

export default function UserMenu() {
  const { usuarioAtual, sair } = useAuth()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function aoClicarFora(evento) {
      if (menuRef.current && !menuRef.current.contains(evento.target)) setAberto(false)
    }
    if (aberto) document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  function trocarDeUsuario() {
    setAberto(false)
    sair()
    navigate('/login')
  }

  function sairDaConta() {
    setAberto(false)
    sair()
    navigate('/login', { replace: true })
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setAberto((valor) => !valor)}
        aria-haspopup="menu"
        aria-expanded={aberto}
      >
        <span className="user-menu-nome">{usuarioAtual.nome.split(' ')[0]}</span>
        <span className="user-menu-avatar">{iniciaisDe(usuarioAtual.nome)}</span>
        <ChevronDown size={16} className="user-menu-seta" />
      </button>

      {aberto && (
        <div className="user-menu-painel" role="menu">
          <div className="user-menu-cabecalho">
            <strong>{usuarioAtual.nome}</strong>
            <span>{usuarioAtual.email}</span>
            <span className="user-menu-papel">{usuarioAtual.papel}</span>
          </div>
          <Link to="/perfil" className="user-menu-item" role="menuitem" onClick={() => setAberto(false)}>
            <UserCircle size={16} /> Meu perfil
          </Link>
          <button type="button" className="user-menu-item" role="menuitem" onClick={trocarDeUsuario}>
            <Repeat size={16} /> Entrar com outra conta
          </button>
          <button type="button" className="user-menu-item is-perigo" role="menuitem" onClick={sairDaConta}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </div>
  )
}
