import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RequirePermissao({ permissao, children }) {
  const { possuiPermissao } = useAuth()
  if (!possuiPermissao(permissao)) {
    return <Navigate to="/painel" replace />
  }
  return children
}
