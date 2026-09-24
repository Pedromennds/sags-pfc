import { Link } from 'react-router-dom'
import { CalendarCheck, Clock3, XCircle, DoorOpen, Wrench, ArrowRight, MapPin } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import { salas, blocos, reservas, minhasReservas } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { dataDeHojePorExtenso } from '../lib/tempoUtil'
import './dashboard.css'

const PERMISSOES_ADMIN = ['gerenciar_salas', 'gerenciar_usuarios', 'gerenciar_calendario', 'gerenciar_grade_fixa', 'ver_auditoria']

export default function Dashboard() {
  const { usuarioAtual, possuiPermissao } = useAuth()
  const ehAdministrador = PERMISSOES_ADMIN.some(possuiPermissao)

  const primeiroNome = usuarioAtual.nome.split(' ')[0]

  return (
    <>
      <Topbar title={`Bem-vindo, ${primeiroNome}`} subtitle={dataDeHojePorExtenso()} />
      <div className="page-body dashboard">
        {ehAdministrador ? <CardsAdministrador /> : <CardsUsuarioComum />}

        <section className="dash-grid">
          {ehAdministrador ? <PainelSolicitacoesPendentes /> : <PainelMinhasReservas />}
          <PainelBlocosDidaticos />
        </section>
      </div>
    </>
  )
}

function CardsUsuarioComum() {
  const confirmadas = reservas.filter((r) => r.status === 'confirmada').length
  const pendentes = reservas.filter((r) => r.status === 'pendente').length
  const recusadas = reservas.filter((r) => r.status === 'cancelada').length

  return (
    <section className="dash-stats">
      <StatCard icon={CalendarCheck} numero={confirmadas || 3} label="Reservas confirmadas" cor="laranja" />
      <StatCard icon={Clock3} numero={pendentes || 2} label="Aguardando aprovação" cor="neutro" />
      <StatCard icon={XCircle} numero={recusadas || 1} label="Recusadas" cor="vermelho" />
    </section>
  )
}

function CardsAdministrador() {
  const disponiveis = salas.filter((s) => s.status === 'disponivel').length
  const manutencao = salas.filter((s) => s.status === 'manutencao').length
  const reservadas = reservas.filter((r) => r.status === 'confirmada').length

  return (
    <section className="dash-stats">
      <StatCard icon={DoorOpen} numero={disponiveis} label="Salas disponíveis" cor="laranja" />
      <StatCard icon={Wrench} numero={manutencao} label="Em manutenção" cor="neutro" />
      <StatCard icon={XCircle} numero={reservadas || 3} label="Reservadas" cor="vermelho" />
    </section>
  )
}

function StatCard({ icon: Icon, numero, label, cor }) {
  return (
    <div className={`dash-stat dash-stat-${cor}`}>
      <span className="dash-stat-icon"><Icon size={22} /></span>
      <div>
        <strong>{numero}</strong>
        <p>{label}</p>
      </div>
    </div>
  )
}

function PainelMinhasReservas() {
  const proximas = minhasReservas.filter((r) => r.status !== 'cancelada' && r.status !== 'concluida')

  return (
    <div className="card dash-panel">
      <div className="dash-panel-head">
        <h2>Minhas próximas reservas</h2>
        <Link to="/minhas-reservas" className="dash-see-all">Ver todas <ArrowRight size={14} /></Link>
      </div>
      <ul className="dash-lista">
        {proximas.slice(0, 2).map((r) => (
          <li key={r.id}>
            <div>
              <p>{r.tipo === 'fixa' ? r.nomeMateria : r.motivo}</p>
              <span><MapPin size={12} /> {r.sala}</span>
            </div>
            <span className={`badge badge-${r.status}`}>
              <span className="badge-dot" />
              {r.status === 'confirmada' ? 'Confirmada' : 'Pendente'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PainelSolicitacoesPendentes() {
  const pendentes = reservas.filter((r) => r.status === 'pendente')

  return (
    <div className="card dash-panel">
      <div className="dash-panel-head">
        <h2>Solicitações pendentes</h2>
        <Link to="/solicitacoes" className="dash-see-all">Ver todas <ArrowRight size={14} /></Link>
      </div>
      <ul className="dash-lista">
        {pendentes.slice(0, 2).map((r) => {
          const sala = salas.find((s) => s.id === r.salaId)
          return (
            <li key={r.id}>
              <div>
                <p>{r.tipo === 'fixa' ? r.nomeMateria : r.motivo}</p>
                <span><MapPin size={12} /> Sala {sala?.numero} · {r.usuario}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PainelBlocosDidaticos() {
  return (
    <div className="card dash-panel">
      <div className="dash-panel-head">
        <h2>Blocos didáticos</h2>
      </div>
      <ul className="dash-lista dash-lista-blocos">
        {blocos.map((b) => {
          const totalSalas = salas.filter((s) => s.blocoId === b.id).length
          return (
            <li key={b.id}>
              <div>
                <strong>{b.nome}</strong>
                <span>{totalSalas} salas · 3 andares</span>
              </div>
              <Link to={`/salas?bloco=${b.id}`} className="btn btn-secondary btn-sm">Ver salas</Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
