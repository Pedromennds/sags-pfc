import { useState } from 'react'
import { CheckCircle2, XCircle, Ban, UserX, History as HistoryIcon } from 'lucide-react'
import AdminLayout from '../components/admin/AdminLayout'
import { useAudit } from '../context/AuditContext'
import './auditoria.css'

const acaoConfig = {
  aprovou: { label: 'Aprovou', icon: CheckCircle2, className: 'acao-aprovou' },
  recusou: { label: 'Recusou', icon: XCircle, className: 'acao-recusou' },
  cancelou: { label: 'Cancelou', icon: Ban, className: 'acao-cancelou' },
  excluiu: { label: 'Excluiu', icon: UserX, className: 'acao-recusou' },
}

const filtros = [
  { id: 'todas', label: 'Todas as ações' },
  { id: 'aprovou', label: 'Aprovações' },
  { id: 'recusou', label: 'Recusas' },
  { id: 'cancelou', label: 'Cancelamentos' },
]

export default function Auditoria() {
  const { registros } = useAudit()
  const [filtro, setFiltro] = useState('todas')

  const registrosFiltrados = filtro === 'todas' ? registros : registros.filter((r) => r.acao === filtro)

  return (
    <AdminLayout secaoAtivaId="auditoria">
      <div className="mr-filtros">
        {filtros.map((f) => (
          <button key={f.id} className={`mr-filtro-chip ${filtro === f.id ? 'is-active' : ''}`} onClick={() => setFiltro(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {registrosFiltrados.length === 0 ? (
        <div className="card empty-state">
          <HistoryIcon size={20} style={{ marginBottom: 8, opacity: .5 }} />
          <p>Nenhum registro encontrado com esse filtro.</p>
        </div>
      ) : (
        <div className="aud-lista">
          {registrosFiltrados.map((log) => {
            const config = acaoConfig[log.acao] ?? { label: log.acao, icon: HistoryIcon, className: '' }
            const Icone = config.icon
            return (
              <div key={log.id} className="card aud-item">
                <span className={`aud-icone ${config.className}`}><Icone size={16} /></span>
                <div className="aud-info">
                  <p><strong>{log.ator}</strong> {config.label.toLowerCase()} <strong>{log.alvo}</strong></p>
                  {log.detalhe && <span className="aud-detalhe">{log.detalhe}</span>}
                </div>
                <span className="aud-quando">
                  {new Date(log.quando).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
