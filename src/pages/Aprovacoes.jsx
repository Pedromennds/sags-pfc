import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, X, MapPin, AlertTriangle, Search } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import { reservas as dadosIniciais, salas, blocos, horarios, diasSemana } from '../data/mockData'
import { horasUteisDesde, formatarEspera } from '../lib/tempoUtil'
import { useAudit } from '../context/AuditContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import './aprovacoes.css'

function formatarDataCurta(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Aprovacoes() {
  const [reservas, setReservas] = useState(dadosIniciais)
  const [searchParams] = useSearchParams()
  const destacarId = searchParams.get('id')
  const refsItens = useRef({})
  const { registrar } = useAudit()
  const mostrarToast = useToast()
  const { usuarioAtual } = useAuth()

  const [busca, setBusca] = useState('')
  const [recusandoId, setRecusandoId] = useState(null)
  const [motivoRecusa, setMotivoRecusa] = useState('')

  const pendentes = [...reservas]
    .filter((r) => r.status === 'pendente')
    .filter((r) => {
      const termo = busca.trim().toLowerCase()
      if (!termo) return true
      const sala = salas.find((s) => s.id === r.salaId)
      const titulo = r.tipo === 'fixa' ? r.nomeMateria : r.motivo
      return (
        sala?.numero.includes(termo) ||
        r.usuario.toLowerCase().includes(termo) ||
        titulo?.toLowerCase().includes(termo)
      )
    })
    .sort((a, b) => horasUteisDesde(b.solicitadoEm ?? 0) - horasUteisDesde(a.solicitadoEm ?? 0))

  useEffect(() => {
    if (destacarId && refsItens.current[destacarId]) {
      refsItens.current[destacarId].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [destacarId])

  function aprovar(r, sala) {
    const alvo = r.tipo === 'fixa' ? r.nomeMateria : r.motivo
    setReservas((prev) => prev.map((item) => item.id === r.id ? { ...item, status: 'confirmada' } : item))
    registrar({ ator: usuarioAtual.nome, acao: 'aprovou', alvo, detalhe: `Sala ${sala?.numero} · solicitado por ${r.usuario}` })
    mostrarToast('Solicitação aprovada e o solicitante será avisado por e-mail.', 'sucesso')
  }

  function abrirRecusa(id) {
    setRecusandoId(id)
    setMotivoRecusa('')
  }

  function confirmarRecusa() {
    const r = pendentes.find((item) => item.id === recusandoId)
    if (!r || !motivoRecusa.trim()) return
    const sala = salas.find((s) => s.id === r.salaId)
    const alvo = r.tipo === 'fixa' ? r.nomeMateria : r.motivo
    setReservas((prev) => prev.map((item) => item.id === r.id ? { ...item, status: 'cancelada' } : item))
    registrar({ ator: usuarioAtual.nome, acao: 'recusou', alvo, detalhe: `Sala ${sala?.numero} · motivo: ${motivoRecusa.trim()}` })
    mostrarToast('Solicitação recusada. O solicitante será avisado por e-mail.', 'info')
    setRecusandoId(null)
    setMotivoRecusa('')
  }

  const recusando = pendentes.find((item) => item.id === recusandoId)

  return (
    <>
      <Topbar title="Solicitações de aprovação" subtitle={`${pendentes.length} solicitações aguardando decisão`} />
      <div className="page-body">
        <div className="salas-busca ap-busca card">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por sala, solicitante ou motivo"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {pendentes.length === 0 ? (
          <div className="card empty-state">
            <p>Nenhuma solicitação pendente encontrada.</p>
          </div>
        ) : (
          <div className="ap-lista">
            {pendentes.map((r) => {
              const sala = salas.find((s) => s.id === r.salaId)
              const bloco = blocos.find((b) => b.id === sala?.blocoId)
              const dia = diasSemana.find((d) => d.id === r.diaId)
              const horario = horarios.find((h) => h.id === r.horarioId)
              const horasEspera = r.solicitadoEm ? horasUteisDesde(r.solicitadoEm) : 0
              const atrasada = horasEspera >= 24
              const ehFixa = r.tipo === 'fixa'
              const titulo = ehFixa ? `${r.codigoMateria} · ${r.nomeMateria}` : r.motivo

              return (
                <div
                  key={r.id}
                  ref={(el) => { refsItens.current[r.id] = el }}
                  className={`card ap-item ${destacarId === r.id ? 'is-destacado' : ''}`}
                >
                  <div className="ap-linha">
                    <div className="ap-info">
                      <div className="ap-titulo-row">
                        <p className="ap-motivo">{titulo}</p>
                        <span className={`ap-tipo-tag ${ehFixa ? 'is-fixa' : 'is-avulsa'}`}>{ehFixa ? 'Aula fixa' : 'Avulsa'}</span>
                      </div>
                      <p className="ap-solicitante">{ehFixa ? `Professor responsável: ${r.professorResponsavel}` : `Solicitado por ${r.usuario}`}</p>
                      <div className="ap-meta">
                        <span><MapPin size={13} /> Sala {sala?.numero} · {bloco?.nome}</span>
                        <span>
                          {ehFixa ? dia?.label : `${formatarDataCurta(r.data)} (${dia?.label})`} · {horario?.inicio}–{horario?.fim}
                        </span>
                      </div>
                    </div>
                    {r.solicitadoEm && (
                      <span className={`ap-espera ${atrasada ? 'is-atrasada' : ''}`}>
                        {atrasada && <AlertTriangle size={13} />}
                        Aguardando há {formatarEspera(horasEspera)}
                      </span>
                    )}
                    <div className="ap-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => abrirRecusa(r.id)}>
                        <X size={14} /> Recusar
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => aprovar(r, sala)}>
                        <Check size={14} /> Aprovar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {recusando && (
        <div className="reserva-modal-backdrop" onClick={() => setRecusandoId(null)}>
          <div className="card reserva-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reserva-modal-head">
              <h3>Recusar solicitação</h3>
              <button className="btn-ghost reserva-modal-close" onClick={() => setRecusandoId(null)}><X size={16} /></button>
            </div>
            <p className="reserva-modal-resumo">
              {recusando.tipo === 'fixa' ? recusando.nomeMateria : recusando.motivo} · {recusando.usuario}
            </p>
            <div className="field">
              <label htmlFor="motivoRecusa">Motivo da recusa (enviado por e-mail ao solicitante)</label>
              <textarea
                id="motivoRecusa"
                rows={3}
                placeholder="Ex: Sala já reservada para manutenção nesse período."
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
              />
            </div>
            <div className="reserva-modal-actions">
              <button className="btn btn-secondary" onClick={() => setRecusandoId(null)}>Cancelar</button>
              <button className="btn mr-btn-cancelar" onClick={confirmarRecusa} disabled={!motivoRecusa.trim()}>Confirmar recusa</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
