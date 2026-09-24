import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { usuarios } from '../data/mockData'

const AuthContext = createContext(null)
const CHAVE_STORAGE = 'sags:usuarioAtualId'

function lerSessaoSalva() {
  try {
    return localStorage.getItem(CHAVE_STORAGE)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // Sessão começa vazia: sem usuário salvo, o sistema exige login antes de qualquer tela interna
  const [usuarioAtualId, setUsuarioAtualId] = useState(lerSessaoSalva)

  const usuarioAtual = usuarios.find((u) => u.id === usuarioAtualId) ?? null
  const estaAutenticado = usuarioAtual !== null

  const entrarComo = useCallback((id) => {
    setUsuarioAtualId(id)
    try {
      localStorage.setItem(CHAVE_STORAGE, id)
    } catch {
      // localStorage indisponível — sessão continua funcionando só em memória
    }
  }, [])

  const sair = useCallback(() => {
    setUsuarioAtualId(null)
    try {
      localStorage.removeItem(CHAVE_STORAGE)
    } catch {
      // nada a limpar
    }
  }, [])

  const possuiPermissao = useCallback(
    (permissaoId) => Boolean(usuarioAtual?.permissoes.includes(permissaoId)),
    [usuarioAtual],
  )

  const value = useMemo(
    () => ({ usuarioAtual, estaAutenticado, entrarComo, sair, possuiPermissao, personasDisponiveis: usuarios }),
    [usuarioAtual, estaAutenticado, entrarComo, sair, possuiPermissao],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider')
  return ctx
}
