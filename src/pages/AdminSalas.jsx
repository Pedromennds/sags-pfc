import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Wrench } from 'lucide-react'
import AdminLayout from '../components/admin/AdminLayout'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import { salas as dadosIniciais, blocos } from '../data/mockData'
import './admin-salas.css'

const vazio = { numero: '', blocoId: blocos[0].id, capacidade: 40, projetor: false, arCondicionado: false, status: 'disponivel' }

export default function AdminSalas() {
  const [salas, setSalas] = useState(dadosIniciais.slice(0, 24))
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(vazio)

  function abrirNovo() {
    setEditando(null)
    setForm(vazio)
    setModalAberto(true)
  }

  function abrirEdicao(sala) {
    setEditando(sala.id)
    setForm({ numero: sala.numero, blocoId: sala.blocoId, capacidade: sala.capacidade, projetor: sala.projetor, arCondicionado: sala.arCondicionado, status: sala.status })
    setModalAberto(true)
  }

  function salvar(e) {
    e.preventDefault()
    if (editando) {
      setSalas((prev) => prev.map((s) => s.id === editando
        ? { ...s, numero: form.numero, blocoId: form.blocoId, capacidade: Number(form.capacidade), projetor: form.projetor, arCondicionado: form.arCondicionado, status: form.status }
        : s))
    } else {
      setSalas((prev) => [{
        id: `nova-${Date.now()}`,
        numero: form.numero,
        blocoId: form.blocoId,
        andar: Number(form.numero[0] || 1),
        capacidade: Number(form.capacidade),
        projetor: form.projetor,
        arCondicionado: form.arCondicionado,
        status: form.status,
      }, ...prev])
    }
    setModalAberto(false)
  }

  // Exclusão passa por confirmação: a sala só sai da lista depois que o admin confirma
  const [salaParaExcluir, setSalaParaExcluir] = useState(null)
  const mostrarToast = useToast()

  function confirmarExclusao() {
    setSalas((prev) => prev.filter((s) => s.id !== salaParaExcluir.id))
    mostrarToast(`Sala ${salaParaExcluir.numero} excluída.`, 'info')
    setSalaParaExcluir(null)
  }

  return (
    <AdminLayout secaoAtivaId="salas">
      <div className="as-toolbar">
          <button className="btn btn-primary" onClick={abrirNovo}>
            <Plus size={16} /> Nova sala
          </button>
        </div>

        <div className="card as-table-card">
          <p className="scroll-hint">Arraste para o lado para ver todas as colunas →</p>
          <table className="as-table">
            <thead>
              <tr>
                <th>Sala</th>
                <th>Bloco</th>
                <th>Capacidade</th>
                <th>Recursos</th>
                <th>Status</th>
                <th aria-label="Ações"></th>
              </tr>
            </thead>
            <tbody>
              {salas.map((sala) => {
                const bloco = blocos.find((b) => b.id === sala.blocoId)
                const emManutencao = sala.status === 'manutencao'
                return (
                  <tr key={sala.id}>
                    <td className="as-numero">{sala.numero}</td>
                    <td>{bloco?.nome}</td>
                    <td>{sala.capacidade} pessoas</td>
                    <td className="as-recursos-col">
                      {[sala.projetor && 'Projetor', sala.arCondicionado && 'Ar-condicionado'].filter(Boolean).join(', ') || <span className="sala-sem-recurso">—</span>}
                    </td>
                    <td>
                      <span className={`badge badge-${emManutencao ? 'manutencao' : 'disponivel'}`}>
                        <span className="badge-dot" />
                        {emManutencao ? 'Manutenção' : 'Disponível'}
                      </span>
                    </td>
                    <td className="as-acoes">
                      <button className="btn-ghost as-icon-btn" onClick={() => abrirEdicao(sala)} aria-label="Editar"><Pencil size={15} /></button>
                      <button className="btn-danger-ghost as-icon-btn" onClick={() => setSalaParaExcluir(sala)} aria-label="Remover"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      {modalAberto && (
        <div className="reserva-modal-backdrop" onClick={() => setModalAberto(false)}>
          <div className="card reserva-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reserva-modal-head">
              <h3>{editando ? 'Editar sala' : 'Nova sala'}</h3>
              <button className="btn-ghost reserva-modal-close" onClick={() => setModalAberto(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="field">
                <label htmlFor="numero">Número da sala</label>
                <input id="numero" required placeholder="Ex: 205" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="bloco">Bloco didático</label>
                <select id="bloco" value={form.blocoId} onChange={(e) => setForm({ ...form, blocoId: e.target.value })}>
                  {blocos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="capacidade">Capacidade máxima</label>
                <input id="capacidade" type="number" min="1" required value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: e.target.value })} />
              </div>
              <div className="field">
                <label>Recursos</label>
                <div className="checkbox-group">
                  <label className="checkbox-row">
                    <input type="checkbox" checked={form.projetor} onChange={(e) => setForm({ ...form, projetor: e.target.checked })} />
                    <span>Projetor</span>
                  </label>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={form.arCondicionado} onChange={(e) => setForm({ ...form, arCondicionado: e.target.checked })} />
                    <span>Ar-condicionado</span>
                  </label>
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="disponivel">Disponível</option>
                  <option value="manutencao">Em manutenção</option>
                </select>
                {form.status === 'manutencao' && (
                  <p className="as-aviso-manutencao"><Wrench size={12} /> A sala ficará bloqueada para reservas enquanto estiver em manutenção.</p>
                )}
              </div>
              <div className="reserva-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar sala</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {salaParaExcluir && (
        <ConfirmDialog
          titulo="Excluir sala"
          mensagem={`Tem certeza que deseja excluir a sala ${salaParaExcluir.numero}? Essa ação não pode ser desfeita.`}
          textoConfirmar="Excluir sala"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setSalaParaExcluir(null)}
        />
      )}
    </AdminLayout>
  )
}
