import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './perfil.css'

export default function Perfil() {
  const { usuarioAtual } = useAuth()
  const mostrarToast = useToast()
  const [telefone, setTelefone] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')

  const iniciais = usuarioAtual.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')

  function salvarDados(e) {
    e.preventDefault()
    mostrarToast('Dados pessoais atualizados.', 'sucesso')
  }

  function trocarSenha(e) {
    e.preventDefault()
    if (novaSenha.length < 8) {
      setErroSenha('A nova senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha('As senhas não coincidem.')
      return
    }
    setErroSenha('')
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarSenha('')
    mostrarToast('Senha atualizada com sucesso.', 'sucesso')
  }

  return (
    <>
      <Topbar title="Perfil" subtitle="Suas informações de acesso ao SAGS" />
      <div className="page-body perfil-page">
        <div className="card perfil-cabecalho">
          <span className="perfil-avatar">{iniciais}</span>
          <div>
            <p className="perfil-nome">{usuarioAtual.nome}</p>
            <p className="perfil-papel">{usuarioAtual.papel}</p>
          </div>
        </div>

        <div className="perfil-grid">
          <form className="card perfil-card" onSubmit={salvarDados}>
            <h2>Dados pessoais</h2>
            <div className="field">
              <label htmlFor="nome">Nome</label>
              <input id="nome" value={usuarioAtual.nome} disabled />
            </div>
            <div className="field">
              <label htmlFor="email">E-mail institucional</label>
              <input id="email" value={usuarioAtual.email} disabled />
            </div>
            <div className="field">
              <label htmlFor="telefone">Telefone para contato (opcional)</label>
              <input id="telefone" placeholder="(64) 90000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Salvar alterações</button>
          </form>

          <form className="card perfil-card" onSubmit={trocarSenha}>
            <h2><KeyRound size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />Alterar senha</h2>
            <div className="field">
              <label htmlFor="senhaAtual">Senha atual</label>
              <input id="senhaAtual" type="password" required value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="novaSenha">Nova senha</label>
              <input id="novaSenha" type="password" required value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="confirmarSenha">Confirmar nova senha</label>
              <input id="confirmarSenha" type="password" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
            </div>
            {erroSenha && <p className="perfil-erro">{erroSenha}</p>}
            <button type="submit" className="btn btn-secondary">Atualizar senha</button>
          </form>
        </div>
      </div>
    </>
  )
}
