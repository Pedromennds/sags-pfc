import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { UiProvider } from './context/UiContext.jsx'
import { AuditProvider } from './context/AuditContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuditProvider>
          <ToastProvider>
            <UiProvider>
              <App />
            </UiProvider>
          </ToastProvider>
        </AuditProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
