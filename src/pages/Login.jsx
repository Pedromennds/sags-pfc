import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoUfcat from '../assets/ufcat-logo.png'
import './login.css'

export default function Login() {
  const navigate = useNavigate()
  const { entrarComo, personasDisponiveis } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  // Protótipo: sem backend, o perfil de teste define com qual usuário a sessão é aberta
  const [personaId, setPersonaId] = useState(personasDisponiveis[0].id)

  function entrar(evento) {
    evento.preventDefault()
    entrarComo(personaId)
    navigate('/painel', { replace: true })
  }

  return (
    <div className="login-page">
      <section className="login-painel">
        <div className="login-conteudo">
          <div className="login-marca">
            <img src={logoUfcat} alt="UFCAT" className="login-marca-logo" />
            <p className="login-marca-nome">SAGS - Sistema de Alocação e Gerenciamento de Salas</p>
          </div>

          <h1>Entre na sua conta</h1>

          <form onSubmit={entrar} className="login-form">
            <div className="field">
              <label htmlFor="email">E-mail institucional</label>
              <input id="email" type="email" placeholder="seunome@ufcat.edu.br" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="senha">Senha</label>
              <input id="senha" type="password" placeholder="••••••••••" required value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary login-entrar">Entrar</button>
          </form>

          <a href="#" className="login-recuperar">Esqueci minha senha</a>
          <p className="login-aviso">Seu acesso é criado por um representante da PROGRAD. Não há cadastro aberto neste sistema.</p>

          <div className="login-persona">
            <label htmlFor="persona">Perfil de teste (protótipo)</label>
            <select id="persona" value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
              {personasDisponiveis.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} · {p.papel}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="login-destaque" aria-hidden="true">
        <p>
          <strong>Reserve uma sala em poucos cliques.</strong>
          Encontre o espaço ideal, consulte a disponibilidade e faça sua reserva de forma simples e rápida.
        </p>
      </section>
    </div>
  )
}
