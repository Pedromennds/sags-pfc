import { useMemo, useState, Fragment } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Users, X, Projector, Snowflake, Wrench, FileDown, AlertTriangle } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import { salas, blocos, horarios, diasSemana, reservas } from '../data/mockData'
import { proximaDataParaDia, horasAteDataHora } from '../lib/tempoUtil'
import { useToast } from '../context/ToastContext'
import './sala-detalhe.css'

const turnoLabel = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }
const ANTECEDENCIA_MINIMA_HORAS = 48

const formVazio = { tipo: 'avulsa', motivo: '', codigoMateria: '', nomeMateria: '', professorResponsavel: '', data: '' }

export default function SalaDetalhe() {
  const { id } = useParams()
  const sala = salas.find((s) => s.id === id)
  const bloco = blocos.find((b) => b.id === sala?.blocoId)
  const [selecionado, setSelecionado] = useState(null)
  const [form, setForm] = useState(formVazio)
  const [exportando, setExportando] = useState(false)
  const mostrarToast = useToast()

  const ocupacoesSala = useMemo(() => reservas.filter(r => r.salaId === id), [id])

  const ocupacoes = useMemo(() => {
    const mapa = {}
    ocupacoesSala.forEach((r) => { mapa[`${r.diaId}-${r.horarioId}`] = r })
    return mapa
  }, [ocupacoesSala])

  const turnos = ['manha', 'tarde', 'noite']
  const emManutencao = sala?.status === 'manutencao'

  const horarioSelecionado = selecionado ? horarios.find((h) => h.id === selecionado.horarioId) : null

  const horasAntecedencia = (form.tipo === 'avulsa' && form.data && horarioSelecionado)
    ? horasAteDataHora(form.data, horarioSelecionado.inicio)
    : null
  const antecedenciaInsuficiente = horasAntecedencia !== null && horasAntecedencia < ANTECEDENCIA_MINIMA_HORAS

  if (!sala) {
    return (
      <>
        <Topbar title="Sala não encontrada" />
        <div className="page-body">
          <Link to="/salas" className="btn btn-secondary">Voltar para salas</Link>
        </div>
      </>
    )
  }

  function handleConfirmar() {
    const mensagem = form.tipo === 'fixa'
      ? 'Aula fixa cadastrada na grade do semestre.'
      : 'Solicitação enviada. Você será avisado por e-mail assim que houver uma decisão.'
    mostrarToast(mensagem, 'sucesso')
    setSelecionado(null)
    setForm(formVazio)
  }

  function fechar() {
    setSelecionado(null)
    setForm(formVazio)
  }

  function clicarSlot(d, h, ocupacao) {
    if (emManutencao) return
    if (ocupacao) {
      const quem = ocupacao.tipo === 'fixa' ? `${ocupacao.nomeMateria} — Prof. ${ocupacao.professorResponsavel}` : `${ocupacao.motivo} — ${ocupacao.usuario}`
      mostrarToast(`Horário já ocupado: ${quem} (${d.label}, ${h.inicio}–${h.fim}).`, 'aviso')
      return
    }
    setSelecionado({ diaId: d.id, horarioId: h.id })
    setForm((f) => ({ ...formVazio, tipo: f.tipo, data: proximaDataParaDia(d.id) }))
  }

  const formValido = form.tipo === 'fixa'
    ? form.codigoMateria.trim() && form.nomeMateria.trim() && form.professorResponsavel.trim()
    : form.motivo.trim() && form.data && !antecedenciaInsuficiente

  function handleExportar() {
    setExportando(true)
    import('../lib/exportGradePdf')
      .then(({ exportarGradeFixaPdf }) => exportarGradeFixaPdf({ sala, bloco, ocupacoesSala, horarios, diasSemana }))
      .finally(() => setExportando(false))
  }

  return (
    <>
      <Topbar title={`Sala ${sala.numero}`} subtitle={bloco?.nome} />
      <div className="page-body sala-detalhe">
        <div className="sala-detalhe-topo">
          <Link to="/salas" className="voltar-link"><ChevronLeft size={16} /> Todas as salas</Link>
          <button className="btn btn-secondary btn-sm" onClick={handleExportar} disabled={exportando}>
            <FileDown size={14} /> {exportando ? 'Gerando PDF…' : 'Exportar grade fixa em PDF'}
          </button>
        </div>

        {emManutencao && (
          <div className="aviso-manutencao">
            <Wrench size={16} />
            <p>Esta sala está marcada como <strong>em manutenção</strong> pela PROGRAD e não pode ser reservada no momento.</p>
          </div>
        )}

        <div className="sala-detalhe-grid">
          <div className="card sala-info-card">
            <div className="sala-info-row">
              <span>Status</span>
              <span className={`badge badge-${emManutencao ? 'manutencao' : 'disponivel'} sala-status-badge`}>
                <span className="badge-dot" />
                {emManutencao ? 'Em manutenção' : 'Disponível'}
              </span>
            </div>
            <div className="sala-info-row">
              <span>Capacidade</span>
              <strong><Users size={14} /> {sala.capacidade} pessoas</strong>
            </div>
            <div className="sala-info-row">
              <span>Andar</span>
              <strong>{sala.andar}º andar</strong>
            </div>
            <div className="sala-info-row">
              <span>Recursos</span>
              <div className="sala-info-tags">
                {sala.projetor && <span className="sala-info-tag"><Projector size={12} /> Projetor</span>}
                {sala.arCondicionado && <span className="sala-info-tag"><Snowflake size={12} /> Ar-condicionado</span>}
                {!sala.projetor && !sala.arCondicionado && <span className="sala-sem-recurso">Sem recursos</span>}
              </div>
            </div>
            <div className="sala-info-legenda">
              <p><span className="legenda-dot legenda-livre" /> Livre</p>
              <p><span className="legenda-dot legenda-ocupado" /> Ocupada</p>
              <p><span className="legenda-dot legenda-selecionado" /> Selecionado</p>
            </div>
          </div>

          <div className={`card horario-grid-card ${emManutencao ? 'is-disabled' : ''}`}>
            <p className="horario-grid-dica">Arraste para o lado para ver todos os dias →</p>
            <div className="horario-grid-scroll">
              <div className="horario-grid" style={{ gridTemplateColumns: `84px repeat(${diasSemana.length}, 1fr)` }}>
                <div className="hg-cell hg-corner">Horário</div>
                {diasSemana.map((d) => (
                  <div key={d.id} className="hg-cell hg-dia-header">{d.label}</div>
                ))}

                {turnos.map((turno) => (
                  <Fragment key={`turno-${turno}`}>
                    <div className="hg-turno-label" style={{ gridColumn: `1 / span ${diasSemana.length + 1}` }}>
                      {turnoLabel[turno]}
                    </div>
                    {horarios.filter(h => h.turno === turno).map((h) => (
                      <Fragment key={h.id}>
                        <div className="hg-cell hg-hora">
                          <strong>{h.inicio}</strong>
                          <span>{h.fim}</span>
                        </div>
                        {diasSemana.map((d) => {
                          const chave = `${d.id}-${h.id}`
                          const ocupacao = ocupacoes[chave]
                          const isSelecionado = selecionado?.diaId === d.id && selecionado?.horarioId === h.id
                          return (
                            <button
                              key={chave}
                              className={`hg-slot ${ocupacao ? 'is-ocupado' : 'is-livre'} ${isSelecionado ? 'is-selecionado' : ''}`}
                              disabled={emManutencao}
                              onClick={() => clicarSlot(d, h, ocupacao)}
                              title={ocupacao ? `${ocupacao.tipo === 'fixa' ? ocupacao.nomeMateria : ocupacao.motivo} — ${ocupacao.usuario}` : emManutencao ? 'Sala em manutenção' : `Reservar ${d.label}, ${h.inicio}–${h.fim}`}
                            />
                          )
                        })}
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selecionado && (
        <div className="reserva-modal-backdrop" onClick={fechar}>
          <div className="card reserva-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reserva-modal-head">
              <h3>Reservar horário</h3>
              <button className="btn-ghost reserva-modal-close" onClick={fechar}><X size={16} /></button>
            </div>
            <p className="reserva-modal-resumo">
              Sala {sala.numero} · {diasSemana.find(d => d.id === selecionado.diaId)?.label} · {horarioSelecionado?.inicio}–{horarioSelecionado?.fim}
            </p>

            <div className="reserva-tipo-toggle">
              <button
                type="button"
                className={form.tipo === 'avulsa' ? 'is-ativo' : ''}
                onClick={() => setForm((f) => ({ ...formVazio, tipo: 'avulsa', data: f.data }))}
              >
                Solicitação avulsa
              </button>
              <button
                type="button"
                className={form.tipo === 'fixa' ? 'is-ativo' : ''}
                onClick={() => setForm((f) => ({ ...formVazio, tipo: 'fixa', data: f.data }))}
              >
                Aula fixa (semestral)
              </button>
            </div>

            {form.tipo === 'avulsa' ? (
              <>
                <div className="field">
                  <label htmlFor="data">Data da reserva</label>
                  <input
                    id="data"
                    type="date"
                    value={form.data}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                  />
                </div>
                {antecedenciaInsuficiente ? (
                  <p className="reserva-modal-aviso is-erro"><AlertTriangle size={13} /> Essa data não atende à antecedência mínima de 48h — escolha uma data mais distante ou peça apoio direto à PROGRAD.</p>
                ) : (
                  <p className="reserva-modal-aviso">Solicitações avulsas precisam ser feitas com no mínimo 48h de antecedência e passam por aprovação da PROGRAD.</p>
                )}
                <div className="field">
                  <label htmlFor="motivo">Motivo da solicitação</label>
                  <textarea
                    id="motivo"
                    rows={3}
                    placeholder="Ex: Apresentação de projeto final, monitoria, reunião de colegiado…"
                    value={form.motivo}
                    onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="reserva-modal-aviso">A grade fixa vale para todo o semestre e tem prioridade máxima sobre solicitações avulsas.</p>
                <div className="field">
                  <label htmlFor="codigoMateria">Código da matéria</label>
                  <input
                    id="codigoMateria"
                    placeholder="Ex: ESW202"
                    value={form.codigoMateria}
                    onChange={(e) => setForm({ ...form, codigoMateria: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="nomeMateria">Nome da matéria</label>
                  <input
                    id="nomeMateria"
                    placeholder="Ex: Engenharia de Software II"
                    value={form.nomeMateria}
                    onChange={(e) => setForm({ ...form, nomeMateria: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="professorResponsavel">Professor responsável</label>
                  <input
                    id="professorResponsavel"
                    placeholder="Nome do professor"
                    value={form.professorResponsavel}
                    onChange={(e) => setForm({ ...form, professorResponsavel: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="reserva-modal-actions">
              <button className="btn btn-secondary" onClick={fechar}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleConfirmar} disabled={!formValido}>
                {form.tipo === 'fixa' ? 'Cadastrar aula fixa' : 'Enviar solicitação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
