import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TopNav from './TopNav'
import MobileNav from './MobileNav'
import './app-shell.css'

export default function AppShell() {
  const { estaAutenticado } = useAuth()

  // Qualquer rota interna sem sessão ativa volta para o login
  if (!estaAutenticado) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <TopNav />
      <MobileNav />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
