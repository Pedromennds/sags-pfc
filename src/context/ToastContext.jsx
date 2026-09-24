import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import './toast.css'

const ToastContext = createContext(null)

const iconePorTipo = { sucesso: CheckCircle2, info: Info, aviso: AlertTriangle }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const proximoId = useRef(0)

  const remover = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const mostrarToast = useCallback((mensagem, tipo = 'sucesso', duracaoMs = 4500) => {
    const id = proximoId.current++
    setToasts((prev) => [...prev, { id, mensagem, tipo }])
    if (duracaoMs) {
      setTimeout(() => remover(id), duracaoMs)
    }
    return id
  }, [remover])

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icone = iconePorTipo[t.tipo] ?? Info
          return (
            <div key={t.id} className={`toast toast-${t.tipo}`}>
              <Icone size={16} />
              <p>{t.mensagem}</p>
              <button className="toast-close" onClick={() => remover(t.id)} aria-label="Fechar aviso">
                <X size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de um ToastProvider')
  return ctx.mostrarToast
}
