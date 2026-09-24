import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { secoesAdministrativasVisiveis } from '../layout/navConfig'
import './admin-section-select.css'

export default function AdminSectionSelect({ secaoAtivaId }) {
  const { possuiPermissao } = useAuth()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  const secoes = secoesAdministrativasVisiveis(possuiPermissao)
  const atual = secoes.find((s) => s.id === secaoAtivaId) ?? secoes[0]

  useEffect(() => {
    function aoClicarFora(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    if (aberto) document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  return (
    <div className="admin-select-wrap">
      <label className="admin-select-label" htmlFor="secao-administrativa">Seção administrativa</label>
      <div className="admin-select" ref={ref}>
        <button
          id="secao-administrativa"
          type="button"
          className="admin-select-trigger"
          onClick={() => setAberto((v) => !v)}
        >
          <span>{atual?.label}</span>
          <ChevronDown size={16} />
        </button>
        {aberto && (
          <ul className="admin-select-menu">
            {secoes.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`admin-select-item ${s.id === secaoAtivaId ? 'is-active' : ''}`}
                  onClick={() => { setAberto(false); navigate(s.to) }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
