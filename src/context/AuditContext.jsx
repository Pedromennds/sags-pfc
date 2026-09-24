import { createContext, useCallback, useContext, useState } from 'react'

const AuditContext = createContext(null)

const registrosIniciais = [
  { id: 'log1', quando: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), ator: 'Pedro Alves', acao: 'aprovou', alvo: 'Aula de reposição de Estrutura de Dados', detalhe: 'Sala 109 · Bloco Didático I' },
  { id: 'log2', quando: new Date(Date.now() - 50 * 3600 * 1000).toISOString(), ator: 'Setor de Aprovações PROGRAD', acao: 'recusou', alvo: 'Reserva de sala para evento externo', detalhe: 'Motivo: sala já reservada para manutenção programada' },
  { id: 'log3', quando: new Date(Date.now() - 90 * 3600 * 1000).toISOString(), ator: 'Profa. Luanna Lobato', acao: 'cancelou', alvo: 'Aula de reposição', detalhe: 'Sala 108 · Bloco Didático I' },
]

export function AuditProvider({ children }) {
  const [registros, setRegistros] = useState(registrosIniciais)

  const registrar = useCallback((entrada) => {
    setRegistros((prev) => [{ id: `log-${Date.now()}`, quando: new Date().toISOString(), ...entrada }, ...prev])
  }, [])

  return (
    <AuditContext.Provider value={{ registros, registrar }}>
      {children}
    </AuditContext.Provider>
  )
}

export function useAudit() {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit precisa estar dentro de um AuditProvider')
  return ctx
}
