import { Link } from 'react-router-dom'
import './not-found.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <span className="notfound-code">404</span>
      <h1>Essa sala não existe no mapa do campus.</h1>
      <p>Confira o endereço ou volte para o painel principal.</p>
      <Link to="/painel" className="btn btn-primary">Voltar ao painel</Link>
    </div>
  )
}
