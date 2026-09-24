import Topbar from '../layout/Topbar'
import AdminSectionSelect from './AdminSectionSelect'

export default function AdminLayout({ secaoAtivaId, children }) {
  return (
    <>
      <Topbar
        title="Painel administrativo"
        subtitle="Gerencie salas, calendário, usuários e a grade fixa do semestre"
      />
      <div className="page-body">
        <AdminSectionSelect secaoAtivaId={secaoAtivaId} />
        {children}
      </div>
    </>
  )
}
