import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import RequirePermissao from './components/layout/RequirePermissao'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Salas from './pages/Salas'
import SalaDetalhe from './pages/SalaDetalhe'
import MinhasReservas from './pages/MinhasReservas'
import Aprovacoes from './pages/Aprovacoes'
import AdminSalas from './pages/AdminSalas'
import BlocosDidaticos from './pages/BlocosDidaticos'
import GestaoUsuarios from './pages/GestaoUsuarios'
import Calendario from './pages/Calendario'
import GradeFixa from './pages/GradeFixa'
import Auditoria from './pages/Auditoria'
import Perfil from './pages/Perfil'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/painel" replace />} />

        <Route path="/painel" element={<Dashboard />} />
        <Route path="/salas" element={<Salas />} />
        <Route path="/salas/:id" element={<SalaDetalhe />} />
        <Route path="/minhas-reservas" element={<MinhasReservas />} />
        <Route path="/perfil" element={<Perfil />} />

        <Route path="/solicitacoes" element={<RequirePermissao permissao="aprovar"><Aprovacoes /></RequirePermissao>} />

        <Route path="/administracao" element={<Navigate to="/administracao/salas" replace />} />
        <Route path="/administracao/salas" element={<RequirePermissao permissao="gerenciar_salas"><AdminSalas /></RequirePermissao>} />
        <Route path="/administracao/blocos" element={<RequirePermissao permissao="gerenciar_salas"><BlocosDidaticos /></RequirePermissao>} />
        <Route path="/administracao/grade-fixa" element={<RequirePermissao permissao="gerenciar_grade_fixa"><GradeFixa /></RequirePermissao>} />
        <Route path="/administracao/usuarios" element={<RequirePermissao permissao="gerenciar_usuarios"><GestaoUsuarios /></RequirePermissao>} />
        <Route path="/administracao/calendario" element={<RequirePermissao permissao="gerenciar_calendario"><Calendario /></RequirePermissao>} />
        <Route path="/administracao/auditoria" element={<RequirePermissao permissao="ver_auditoria"><Auditoria /></RequirePermissao>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
