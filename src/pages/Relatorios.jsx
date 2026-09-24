import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { FileDown } from 'lucide-react'
import AdminLayout from '../components/admin/AdminLayout'
import { salas, blocos, reservas } from '../data/mockData'
import './relatorios.css'

const CORES_STATUS = { disponivel: '#FF6F0E', ocupada: '#2C5F8A', manutencao: '#B4762A' }

export default function Relatorios() {
  const [exportando, setExportando] = useState(false)

  const categorias = useMemo(() => {
    const ocupadasIds = new Set(reservas.filter((r) => r.status === 'confirmada').map((r) => r.salaId))
    return salas.map((sala) => {
      const categoria = sala.status === 'manutencao' ? 'manutencao' : ocupadasIds.has(sala.id) ? 'ocupada' : 'disponivel'
      return { ...sala, categoria }
    })
  }, [])

  const dadosPorBloco = useMemo(() => {
    return blocos.map((bloco) => {
      const salasDoBloco = categorias.filter((s) => s.blocoId === bloco.id)
      const disponivel = salasDoBloco.filter((s) => s.categoria === 'disponivel').length
      const ocupada = salasDoBloco.filter((s) => s.categoria === 'ocupada').length
      const manutencao = salasDoBloco.filter((s) => s.categoria === 'manutencao').length
      return { nome: bloco.nome.replace('Bloco Didático ', 'BD '), disponivel, ocupada, manutencao, total: salasDoBloco.length }
    })
  }, [categorias])

  const totalSalas = salas.length
  const totalDisponivel = categorias.filter((s) => s.categoria === 'disponivel').length
  const totalManutencao = categorias.filter((s) => s.categoria === 'manutencao').length
  const totalOcupada = categorias.filter((s) => s.categoria === 'ocupada').length

  const statusPizza = [
    { nome: 'Sem reserva ativa', valor: totalDisponivel, cor: CORES_STATUS.disponivel },
    { nome: 'Com reserva confirmada', valor: totalOcupada, cor: CORES_STATUS.ocupada },
    { nome: 'Em manutenção', valor: totalManutencao, cor: CORES_STATUS.manutencao },
  ]

  const statusReservas = ['confirmada', 'pendente', 'cancelada', 'concluida'].map((status) => ({
    status,
    total: reservas.filter((r) => r.status === status).length,
  }))

  function handleExportar() {
    setExportando(true)
    import('../lib/exportRelatorioPdf')
      .then(({ exportarRelatorioPdf }) => exportarRelatorioPdf({ dadosPorBloco, totalSalas, totalDisponivel, totalOcupada, totalManutencao }))
      .finally(() => setExportando(false))
  }

  return (
    <AdminLayout secaoAtivaId="relatorios">
      <div className="relatorios-page">
        <div className="rel-toolbar">
          <button className="btn btn-secondary" onClick={handleExportar} disabled={exportando}>
            <FileDown size={15} /> {exportando ? 'Gerando PDF…' : 'Exportar relatório em PDF'}
          </button>
        </div>

        <section className="rel-stats">
          <div className="card rel-stat">
            <strong>{totalSalas}</strong>
            <p>Salas cadastradas</p>
          </div>
          <div className="card rel-stat" style={{ color: CORES_STATUS.disponivel }}>
            <strong>{totalDisponivel}</strong>
            <p>Sem reserva ativa</p>
          </div>
          <div className="card rel-stat" style={{ color: CORES_STATUS.ocupada }}>
            <strong>{totalOcupada}</strong>
            <p>Com reserva confirmada</p>
          </div>
          <div className="card rel-stat" style={{ color: CORES_STATUS.manutencao }}>
            <strong>{totalManutencao}</strong>
            <p>Em manutenção</p>
          </div>
        </section>

        <div className="card rel-chart-card">
          <h2>Ocupação por bloco didático</h2>
          <div className="rel-chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosPorBloco} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: 12, fill: 'var(--color-ink-soft)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }} />
                <Bar dataKey="disponivel" stackId="a" fill={CORES_STATUS.disponivel} name="Sem reserva ativa" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ocupada" stackId="a" fill={CORES_STATUS.ocupada} name="Com reserva" />
                <Bar dataKey="manutencao" stackId="a" fill={CORES_STATUS.manutencao} name="Manutenção" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rel-legenda">
            {statusPizza.map((s) => (
              <span key={s.nome}><i style={{ background: s.cor }} />{s.nome}</span>
            ))}
          </div>
        </div>

        <div className="card rel-chart-card">
          <h2>Reservas por status</h2>
          <div className="rel-chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusReservas} layout="vertical" barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="status" width={90} tick={{ fontSize: 12, fill: 'var(--color-ink-soft)', textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {statusReservas.map((entry) => (
                    <Cell key={entry.status} fill={
                      entry.status === 'confirmada' ? 'var(--color-primary)' :
                      entry.status === 'pendente' ? 'var(--color-blue)' :
                      entry.status === 'cancelada' ? 'var(--color-red)' : 'var(--color-ink-faint)'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
