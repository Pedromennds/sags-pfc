import { useMemo, useState } from 'react'
import { MapPin, Clock3, Search } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { minhasReservas as dadosIniciais } from '../data/mockData'
import { useAudit } from '../context/AuditContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import './minhas-reservas.css'

const filtros = [
  { id: 'todas', label: 'Todas' },
  { id: 'confirmada', label: 'Confirmadas' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'concluida', label: 'Concluídas' },
  { id: 'cancelada', label: 'Canceladas' },
]

const statusLabel = { confirmada: 'Confirmada', pendente: 'Pendente', concluida: 'Concluída', cancelada: 'Cancelada' }

export default function MinhasReservas() {
  const [reservas, setReservas] = useState(dadosIniciais)
  const [filtro, setFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const [dataDe, setDataDe] = useState('')
  const [dataAte, setDataAte] = useState('')
  const { registrar } = useAudit()
  const mostrarToast = useToast()
  const { usuarioAtual } = useAuth()

  const listaFiltrada = useMemo(() => {
    return reservas.filter((r) => {
      const matchStatus = filtro === 'todas' || r.status === filtro
      const termo = busca.trim().toLowerCase()
      const matchBusca = !termo || r.sala.toLowerCase().includes(termo) || (r.tipo === 'fixa' ? r.nomeMateria : r.motivo)?.toLowerCase().includes(termo)
      const matchDe = !dataDe || r.data >= dataDe
      const matchAte = !dataAte || r.data <= dataAte
      return matchStatus && matchBusca && matchDe && matchAte
    })
  }, [reservas, filtro, busca, dataDe, dataAte])

  // Cancelar exige justificativa, que segue para a auditoria junto com a reserva
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null)

  function confirmarCancelamento(motivoCancelamento) {
    const r = reservaParaCancelar
    setReservas((prev) => prev.map((item) => item.id === r.id ? { ...item, status: 'cancelada' } : item))
    registrar({
      ator: usuarioAtual.nome,
      acao: 'cancelou',
      alvo: r.tipo === 'fixa' ? r.nomeMateria : r.motivo,
      detalhe: `${r.sala} · ${r.horario} · Motivo: ${motivoCancelamento}`,
    })
    mostrarToast('Reserva cancelada. A sala foi liberada automaticamente.', 'info')
    setReservaParaCancelar(null)
  }

  return (
    <>
      <Topbar title="Minhas solicitações" subtitle={`${reservas.length} reservas no total`} />
      <div className="page-body">
        <div className="mr-filtros">
          {filtros.map((f) => (
            <button key={f.id} className={`mr-filtro-chip ${filtro === f.id ? 'is-active' : ''}`} onClick={() => setFiltro(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="mr-busca-row">
          <div className="salas-busca mr-busca">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por sala, matéria ou motivo"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="mr-data-field">
            <label htmlFor="dataDe">De</label>
            <input id="dataDe" type="date" value={dataDe} onChange={(e) => setDataDe(e.target.value)} />
          </div>
          <div className="mr-data-field">
            <label htmlFor="dataAte">Até</label>
            <input id="dataAte" type="date" value={dataAte} onChange={(e) => setDataAte(e.target.value)} />
          </div>
        </div>

        <div className="mr-lista">
          {listaFiltrada.map((r) => (
            <div key={r.id} className="card mr-item">
              <div className="mr-item-main">
                <div className="mr-item-titulo">
                  <p className="mr-finalidade">{r.tipo === 'fixa' ? r.nomeMateria : r.motivo}</p>
                  <span className={`mr-tipo-tag ${r.tipo === 'fixa' ? 'is-fixa' : 'is-avulsa'}`}>
                    {r.tipo === 'fixa' ? 'Aula fixa' : 'Avulsa'}
                  </span>
                </div>
                {r.tipo === 'fixa' && (
                  <p className="mr-materia-info">{r.codigoMateria} · Prof. {r.professorResponsavel}</p>
                )}
                <div className="mr-meta">
                  <span><MapPin size={13} /> {r.sala}</span>
                  <span><Clock3 size={13} /> {new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} · {r.horario}</span>
                </div>
              </div>
              <div className="mr-item-actions">
                {(r.status === 'confirmada' || r.status === 'pendente') ? (
                  <button className="mr-btn-cancelar" onClick={() => setReservaParaCancelar(r)}>Cancelar</button>
                ) : (
                  <span className={`badge badge-${r.status}`}><span className="badge-dot" />{statusLabel[r.status]}</span>
                )}
              </div>
            </div>
          ))}
          {listaFiltrada.length === 0 && (
            <div className="card empty-state">
              <p>Nenhuma reserva encontrada com esse filtro.</p>
            </div>
          )}
        </div>
      </div>
      {reservaParaCancelar && (
        <ConfirmDialog
          titulo="Cancelar reserva"
          mensagem={`${reservaParaCancelar.tipo === 'fixa' ? reservaParaCancelar.nomeMateria : reservaParaCancelar.motivo} · ${reservaParaCancelar.sala}. A sala será liberada para outras solicitações.`}
          textoConfirmar="Cancelar reserva"
          exigirMotivo
          rotuloMotivo="Por que você está cancelando?"
          placeholderMotivo="Ex: A atividade foi remarcada."
          onConfirmar={confirmarCancelamento}
          onCancelar={() => setReservaParaCancelar(null)}
        />
      )}
    </>
  )
}
