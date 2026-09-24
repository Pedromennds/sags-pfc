import { createContext, useContext, useState } from 'react'

const UiContext = createContext(null)

export function UiProvider({ children }) {
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false)

  const value = {
    mobileMenuAberto,
    abrirMenuMobile: () => setMobileMenuAberto(true),
    fecharMenuMobile: () => setMobileMenuAberto(false),
    alternarMenuMobile: () => setMobileMenuAberto((v) => !v),
  }

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi precisa estar dentro de um UiProvider')
  return ctx
}
