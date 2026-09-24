import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import AdminLayout from '../components/admin/AdminLayout'
import { excecoesCalendario as dadosIniciais, blocos } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import './calendario.css'

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const NOMES_MES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const vazio = { titulo: '', dataInicio: '', dataFim: '', escopo: 'Todos os blocos' }

function paraData(iso) {
  return new Date(`${iso}T00:00:00`)
}

function paraIsoLocal(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function formatarData(iso) {
  return paraData(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Monta as semanas do mês (grade de 7 colunas), incluindo dias do mês anterior/seguinte pra preencher a grade
function gerarSemanas(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)
  const inicioGrade = new Date(primeiroDia)
  inicioGrade.setDate(inicioGrade.getDate() - primeiroDia.getDay())

  const dias = []
  const cursor = new Date(inicioGrade)
  while (cursor <= ultimoDia || cursor.getDay() !== 0) {
    dias.push({ data: new Date(cursor), foraDoMes: cursor.getMonth() !== mes })
    cursor.setDate(cursor.getDate() + 1)
    if (dias.length > 42) break
  }

  const semanas = []
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7))
  return semanas
}

function excecaoNoDia(excecoes, data) {
  const iso = paraIsoLocal(data)
  return excecoes.find((ex) => iso >= ex.dataInicio && iso <= ex.dataFim)
}

export default function Calendario() {
  const [excecoes, setExcecoes] = useState(dadosIniciais)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(vazio)
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const { possuiPermissao } = useAuth()
  const podeEditar = possuiPermissao('gerenciar_calendario')

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const semanas = useMemo(() => gerarSemanas(ano, mes), [ano, mes])

  const excecoesForaDoMes = excecoes.filter((ex) => {
    const inicio = paraData(ex.dataInicio)
    return inicio.getFullYear() !== ano || inicio.getMonth() !== mes
  })

  function mudarMes(delta) {
    setMesAtual(new Date(ano, mes + delta, 1))
  }

  function salvar(e) {
    e.preventDefault()
    setExcecoes((prev) => [{ id: `ex-${Date.now()}`, ...form }, ...prev].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio)))
    setModalAberto(false)
    setForm(vazio)
  }

  function remover(id) {
    setExcecoes((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <AdminLayout secaoAtivaId="calendario">
      <div className="cal-nav-row">
        <div className="cal-nav">
          <button className="cal-nav-seta" onClick={() => mudarMes(-1)} aria-label="Mês anterior"><ChevronLeft size={18} /></button>
          <h2>{NOMES_MES[mes]} de {ano}</h2>
          <button className="cal-nav-seta" onClick={() => mudarMes(1)} aria-label="Próximo mês"><ChevronRight size={18} /></button>
        </div>
        {podeEditar && (
          <button className="btn btn-primary" onClick={() => setModalAberto(true)}>
            <Plus size={16} /> Nova exceção
          </button>
        )}
      </div>

      <div className="card cal-grid-card">
        <div className="cal-grid-header">
          {DIAS_SEMANA.map((d) => <span key={d}>{d}</span>)}
        </div>
        {semanas.map((semana, i) => (
          <div className="cal-grid-row" key={i}>
            {semana.map((dia) => {
              const excecao = excecaoNoDia(excecoes, dia.data)
              const ehHoje = dia.data.toDateString() === hoje.toDateString()
              return (
                <div
                  key={paraIsoLocal(dia.data)}
                  className={`cal-dia ${dia.foraDoMes ? 'is-fora-do-mes' : ''} ${excecao ? 'tem-excecao' : ''}`}
                >
                  <span className={`cal-dia-numero ${ehHoje ? 'is-hoje' : ''}`}>{dia.data.getDate()}</span>
                  {excecao && <span className="cal-dia-rotulo" title={excecao.titulo}>{excecao.titulo}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {excecoesForaDoMes.length > 0 && (
        <>
          <h3 className="cal-secao-titulo">Próximas exceções em outros meses</h3>
          <div className="cal-lista">
            {excecoesForaDoMes.map((ex) => {
              return (
                <div key={ex.id} className="card cal-item">
                  <div className="cal-info">
                    <p className="cal-titulo">{ex.titulo}</p>
                    <p className="cal-meta">
                      {ex.dataInicio === ex.dataFim ? formatarData(ex.dataInicio) : `${formatarData(ex.dataInicio)} – ${formatarData(ex.dataFim)}`}
                      {' · '}{ex.escopo}
                    </p>
                  </div>
                  {podeEditar && (
                    <button className="btn-danger-ghost as-icon-btn" onClick={() => remover(ex.id)} aria-label="Remover"><Trash2 size={15} /></button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {podeEditar && modalAberto && (
        <div className="reserva-modal-backdrop" onClick={() => setModalAberto(false)}>
          <div className="card reserva-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reserva-modal-head">
              <h3>Nova exceção de calendário</h3>
              <button className="btn-ghost reserva-modal-close" onClick={() => setModalAberto(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="field">
                <label htmlFor="titulo">Título</label>
                <input id="titulo" required placeholder="Ex: Feriado de Corpus Christi" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div className="cal-datas-row">
                <div className="field">
                  <label htmlFor="dataInicio">Data inicial</label>
                  <input id="dataInicio" type="date" required value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="dataFim">Data final</label>
                  <input id="dataFim" type="date" required value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="escopo">Escopo</label>
                <select id="escopo" value={form.escopo} onChange={(e) => setForm({ ...form, escopo: e.target.value })}>
                  <option value="Todos os blocos">Todos os blocos</option>
                  {blocos.map((b) => <option key={b.id} value={b.nome}>{b.nome}</option>)}
                </select>
              </div>
              <div className="reserva-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar exceção</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
