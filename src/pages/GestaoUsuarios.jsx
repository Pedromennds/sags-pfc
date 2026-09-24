import { useState } from 'react'
import { Plus, Pencil, Trash2, X, ShieldCheck } from 'lucide-react'
import AdminLayout from '../components/admin/AdminLayout'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useAudit } from '../context/AuditContext'
import { useToast } from '../context/ToastContext'
import { usuarios as dadosIniciais, permissoesDisponiveis } from '../data/mockData'
import './gestao-usuarios.css'

const vazio = { nome: '', email: '', papel: '', permissoes: [] }

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState(dadosIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(vazio)

  function abrirNovo() {
    setEditando(null)
    setForm(vazio)
    setModalAberto(true)
  }

  function abrirEdicao(usuario) {
    setEditando(usuario.id)
    setForm({ nome: usuario.nome, email: usuario.email, papel: usuario.papel, permissoes: usuario.permissoes })
    setModalAberto(true)
  }

  function alternarPermissao(id) {
    setForm((prev) => ({
      ...prev,
      permissoes: prev.permissoes.includes(id) ? prev.permissoes.filter((p) => p !== id) : [...prev.permissoes, id],
    }))
  }

  // Exclusão: somente administradores (permissão gerenciar_usuarios), exige justificativa
  // e fica registrada na auditoria. Ninguém pode excluir a própria conta.
  const { usuarioAtual, possuiPermissao } = useAuth()
  const { registrar } = useAudit()
  const mostrarToast = useToast()
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null)
  const podeExcluir = possuiPermissao('gerenciar_usuarios')

  function confirmarExclusao(motivo) {
    setUsuarios((prev) => prev.filter((u) => u.id !== usuarioParaExcluir.id))
    registrar({ ator: usuarioAtual.nome, acao: 'excluiu', alvo: `usuário ${usuarioParaExcluir.nome}`, detalhe: `Motivo: ${motivo}` })
    mostrarToast(`Usuário ${usuarioParaExcluir.nome} excluído.`, 'info')
    setUsuarioParaExcluir(null)
  }

  function salvar(e) {
    e.preventDefault()
    if (editando) {
      setUsuarios((prev) => prev.map((u) => u.id === editando ? { ...u, ...form } : u))
    } else {
      setUsuarios((prev) => [{ id: `usr-${Date.now()}`, ...form }, ...prev])
    }
    setModalAberto(false)
  }

  return (
    <AdminLayout secaoAtivaId="usuarios">
      <div className="as-toolbar">
        <button className="btn btn-primary" onClick={abrirNovo}>
          <Plus size={16} /> Novo usuário
        </button>
      </div>

        <div className="gu-lista">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="card gu-item">
              <div className="gu-avatar">{usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
              <div className="gu-info">
                <p className="gu-nome">{usuario.nome}</p>
                <p className="gu-email">{usuario.email}</p>
              </div>
              <span className="gu-papel">{usuario.papel}</span>
              <div className="gu-permissoes">
                {usuario.permissoes.length > 0 ? (
                  usuario.permissoes.map((pid) => {
                    const perm = permissoesDisponiveis.find((p) => p.id === pid)
                    return <span key={pid} className="gu-permissao-tag">{perm?.label ?? pid}</span>
                  })
                ) : (
                  <span className="sala-sem-recurso">Sem permissões atribuídas</span>
                )}
              </div>
              <div className="gu-acoes">
                <button className="btn-ghost as-icon-btn" onClick={() => abrirEdicao(usuario)} aria-label="Editar usuário"><Pencil size={15} /></button>
                {podeExcluir && usuario.id !== usuarioAtual.id && (
                  <button className="btn-danger-ghost as-icon-btn" onClick={() => setUsuarioParaExcluir(usuario)} aria-label="Excluir usuário"><Trash2 size={15} /></button>
                )}
              </div>
            </div>
          ))}
        </div>

      {modalAberto && (
        <div className="reserva-modal-backdrop" onClick={() => setModalAberto(false)}>
          <div className="card reserva-modal gu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reserva-modal-head">
              <h3>{editando ? 'Editar usuário' : 'Novo usuário'}</h3>
              <button className="btn-ghost reserva-modal-close" onClick={() => setModalAberto(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="field">
                <label htmlFor="nome">Nome</label>
                <input id="nome" required placeholder="Nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="email">E-mail institucional</label>
                <input id="email" type="email" required placeholder="nome@ufcat.edu.br" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="papel">Papel</label>
                <input id="papel" required placeholder="Ex: Docente, Secretaria de curso, Setor PROGRAD" value={form.papel} onChange={(e) => setForm({ ...form, papel: e.target.value })} />
              </div>
              <div className="field">
                <label><ShieldCheck size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />Permissões</label>
                <div className="checkbox-group">
                  {permissoesDisponiveis.map((perm) => (
                    <label key={perm.id} className="checkbox-row">
                      <input type="checkbox" checked={form.permissoes.includes(perm.id)} onChange={() => alternarPermissao(perm.id)} />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="reserva-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {usuarioParaExcluir && (
        <ConfirmDialog
          titulo="Excluir usuário"
          mensagem={`${usuarioParaExcluir.nome} perderá o acesso ao SAGS. Essa ação fica registrada na auditoria.`}
          textoConfirmar="Excluir usuário"
          exigirMotivo
          rotuloMotivo="Justificativa da exclusão"
          placeholderMotivo="Ex: Servidor desligado da instituição."
          onConfirmar={confirmarExclusao}
          onCancelar={() => setUsuarioParaExcluir(null)}
        />
      )}
    </AdminLayout>
  )
}
