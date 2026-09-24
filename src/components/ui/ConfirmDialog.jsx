import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import './confirm-dialog.css'

/**
 * Caixa de confirmação para ações destrutivas.
 * Com `exigirMotivo`, o botão de confirmar só habilita depois que a justificativa é preenchida,
 * e o texto digitado é repassado para `onConfirmar(motivo)`.
 */
export default function ConfirmDialog({
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  exigirMotivo = false,
  rotuloMotivo = 'Motivo',
  placeholderMotivo = '',
  onConfirmar,
  onCancelar,
}) {
  const [motivo, setMotivo] = useState('')
  const podeConfirmar = !exigirMotivo || motivo.trim().length > 0

  function confirmar(evento) {
    evento.preventDefault()
    if (podeConfirmar) onConfirmar(motivo.trim())
  }

  return (
    <div className="reserva-modal-backdrop" onClick={onCancelar}>
      <form className="card reserva-modal confirm-dialog" onClick={(e) => e.stopPropagation()} onSubmit={confirmar} role="alertdialog" aria-modal="true">
        <div className="reserva-modal-head">
          <h3>{titulo}</h3>
          <button type="button" className="btn-ghost reserva-modal-close" onClick={onCancelar} aria-label="Fechar"><X size={16} /></button>
        </div>

        <div className="confirm-dialog-alerta">
          <AlertTriangle size={18} />
          <p>{mensagem}</p>
        </div>

        {exigirMotivo && (
          <div className="field">
            <label htmlFor="confirm-motivo">{rotuloMotivo}</label>
            <textarea
              id="confirm-motivo"
              rows={3}
              autoFocus
              placeholder={placeholderMotivo}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        )}

        <div className="reserva-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancelar}>Voltar</button>
          <button type="submit" className="btn btn-perigo" disabled={!podeConfirmar}>{textoConfirmar}</button>
        </div>
      </form>
    </div>
  )
}
