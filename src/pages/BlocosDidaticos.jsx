import { useState } from 'react'
import { Plus, X, Building2 } from 'lucide-react'
import AdminLayout from '../components/admin/AdminLayout'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { blocos as dadosIniciais, salas } from '../data/mockData'
import { useToast } from '../context/ToastContext'
import './blocos-didaticos.css'

function contarSalas(blocoId) {
  return salas.filter((s) => s.blocoId === blocoId).length
}

function textoSalasAssociadas(quantidade) {
  if (quantidade === 0) return 'Nenhuma sala associada a esse bloco'
  if (quantidade === 1) return '1 sala associada a esse bloco'
  return `${quantidade} salas associadas a esse bloco`
}

export default function BlocosDidaticos() {
  const [blocos, setBlocos] = useState(dadosIniciais)
  // null = modal fechado; { id: null } = criando; { id: 'x' } = editando
  const [blocoEmEdicao, setBlocoEmEdicao] = useState(null)
  const [nome, setNome] = useState('')
  const [blocoParaExcluir, setBlocoParaExcluir] = useState(null)
  const mostrarToast = useToast()

  const estaEditando = Boolean(blocoEmEdicao?.id)

  function abrirCriacao() {
    setBlocoEmEdicao({ id: null })
    setNome('')
  }

  function abrirEdicao(bloco) {
    setBlocoEmEdicao(bloco)
    setNome(bloco.nome)
  }

  function fecharModal() {
    setBlocoEmEdicao(null)
    setNome('')
  }

  function salvar(evento) {
    evento.preventDefault()
    const nomeLimpo = nome.trim()
    if (!nomeLimpo) return

    if (estaEditando) {
      setBlocos((prev) => prev.map((b) => (b.id === blocoEmEdicao.id ? { ...b, nome: nomeLimpo } : b)))
      mostrarToast('Bloco atualizado.', 'sucesso')
    } else {
      setBlocos((prev) => [...prev, { id: `bloco-${Date.now()}`, nome: nomeLimpo }])
      mostrarToast('Bloco criado.', 'sucesso')
    }
    fecharModal()
  }

  function confirmarExclusao() {
    setBlocos((prev) => prev.filter((b) => b.id !== blocoParaExcluir.id))
    mostrarToast(`${blocoParaExcluir.nome} excluído.`, 'info')
    setBlocoParaExcluir(null)
  }

  return (
    <AdminLayout secaoAtivaId="blocos">
      <div className="as-toolbar">
        <button className="btn btn-primary" onClick={abrirCriacao}>
          <Plus size={16} /> Novo bloco
        </button>
      </div>

      <div className="bd-lista">
        {blocos.map((bloco) => (
          <div key={bloco.id} className="card bd-item">
            <span className="bd-icon"><Building2 size={24} /></span>
            <div className="bd-info">
              <p className="bd-nome">{bloco.nome}</p>
              <p className="bd-detalhe">{textoSalasAssociadas(contarSalas(bloco.id))}</p>
            </div>
            <div className="bd-acoes">
              <button className="btn btn-secondary btn-sm" onClick={() => abrirEdicao(bloco)}>Editar</button>
              <button className="btn btn-danger-ghost-outline btn-sm" onClick={() => setBlocoParaExcluir(bloco)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {blocoEmEdicao && (
        <div className="reserva-modal-backdrop" onClick={fecharModal}>
          <form className="card reserva-modal" onClick={(e) => e.stopPropagation()} onSubmit={salvar}>
            <div className="reserva-modal-head">
              <h3>{estaEditando ? 'Editar bloco didático' : 'Novo bloco didático'}</h3>
              <button type="button" className="btn-ghost reserva-modal-close" onClick={fecharModal} aria-label="Fechar"><X size={16} /></button>
            </div>
            {estaEditando && (
              <p className="reserva-modal-resumo">{textoSalasAssociadas(contarSalas(blocoEmEdicao.id))}</p>
            )}
            <div className="field">
              <label htmlFor="nome-bloco">Nome do bloco</label>
              <input id="nome-bloco" autoFocus required placeholder="Ex: Bloco Didático III" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="reserva-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={fecharModal}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={!nome.trim()}>
                {estaEditando ? 'Salvar alterações' : 'Criar bloco'}
              </button>
            </div>
          </form>
        </div>
      )}

      {blocoParaExcluir && (
        <ConfirmDialog
          titulo="Excluir bloco didático"
          mensagem={
            contarSalas(blocoParaExcluir.id) > 0
              ? `O ${blocoParaExcluir.nome} possui ${textoSalasAssociadas(contarSalas(blocoParaExcluir.id)).toLowerCase()}. Tem certeza que deseja excluí-lo?`
              : `Tem certeza que deseja excluir o ${blocoParaExcluir.nome}?`
          }
          textoConfirmar="Excluir bloco"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setBlocoParaExcluir(null)}
        />
      )}
    </AdminLayout>
  )
}
