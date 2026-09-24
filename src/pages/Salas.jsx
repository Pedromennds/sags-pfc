import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Users, Projector, Snowflake, Wrench } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import { salas, blocos } from '../data/mockData'
import './salas.css'

const SALAS_POR_PAGINA = 15

export default function Salas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [capacidadeMin, setCapacidadeMin] = useState('todas')
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false)
  const [visiveisPorBloco, setVisiveisPorBloco] = useState({})

  const blocoFiltro = searchParams.get('bloco') ?? 'todos'

  // Qualquer mudança de filtro reinicia a paginação de "mostrar mais" por bloco
  function mudarBusca(valor) {
    setBusca(valor)
    setVisiveisPorBloco({})
  }
  function selecionarBloco(valor) {
    setSearchParams(valor === 'todos' ? {} : { bloco: valor })
    setVisiveisPorBloco({})
  }
  function mudarCapacidade(valor) {
    setCapacidadeMin(valor)
    setVisiveisPorBloco({})
  }
  function mudarDisponibilidade(valor) {
    setApenasDisponiveis(valor)
    setVisiveisPorBloco({})
  }

  const salasFiltradas = useMemo(() => {
    return salas.filter((sala) => {
      const matchBusca = sala.numero.includes(busca.trim())
      const matchBloco = blocoFiltro === 'todos' || sala.blocoId === blocoFiltro
      const matchCapacidade = capacidadeMin === 'todas' || sala.capacidade >= Number(capacidadeMin)
      const matchDisponibilidade = !apenasDisponiveis || sala.status === 'disponivel'
      return matchBusca && matchBloco && matchCapacidade && matchDisponibilidade
    })
  }, [busca, blocoFiltro, capacidadeMin, apenasDisponiveis])

  function mostrarMais(blocoId) {
    setVisiveisPorBloco((prev) => ({ ...prev, [blocoId]: (prev[blocoId] ?? SALAS_POR_PAGINA) + SALAS_POR_PAGINA }))
  }

  const gruposPorBloco = blocos
    .map((bloco) => ({ bloco, salas: salasFiltradas.filter((s) => s.blocoId === bloco.id) }))
    .filter((grupo) => grupo.salas.length > 0)

  return (
    <>
      <Topbar title="Salas" subtitle={`${salasFiltradas.length} salas encontradas`} />
      <div className="page-body">
        <div className="salas-filtros card">
          <div className="salas-busca">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por número da sala (ex: 205)"
              value={busca}
              onChange={(e) => mudarBusca(e.target.value)}
            />
          </div>
          <select value={blocoFiltro} onChange={(e) => selecionarBloco(e.target.value)}>
            <option value="todos">Todos os blocos</option>
            {blocos.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
          <select value={capacidadeMin} onChange={(e) => mudarCapacidade(e.target.value)}>
            <option value="todas">Qualquer capacidade</option>
            <option value="30">30+ pessoas</option>
            <option value="40">40+ pessoas</option>
            <option value="50">50+ pessoas</option>
            <option value="60">60+ pessoas</option>
          </select>
          <label className="salas-toggle">
            <input type="checkbox" checked={apenasDisponiveis} onChange={(e) => mudarDisponibilidade(e.target.checked)} />
            <span>Só disponíveis</span>
          </label>
        </div>

        {gruposPorBloco.length === 0 && (
          <div className="card empty-state">
            <p>Nenhuma sala encontrada com esses filtros.</p>
          </div>
        )}

        {gruposPorBloco.map(({ bloco, salas: salasDoBloco }) => {
          const limite = visiveisPorBloco[bloco.id] ?? SALAS_POR_PAGINA
          const salasVisiveis = salasDoBloco.slice(0, limite)
          const restantes = salasDoBloco.length - salasVisiveis.length
          return (
            <section key={bloco.id} className="salas-bloco-secao">
              <h2 className="salas-bloco-titulo">{bloco.nome.toUpperCase()}</h2>
              <div className="salas-grid">
                {salasVisiveis.map((sala) => {
                  const emManutencao = sala.status === 'manutencao'
                  return (
                    <Link
                      to={`/salas/${sala.id}`}
                      key={sala.id}
                      className={`card sala-card ${emManutencao ? 'is-manutencao' : ''}`}
                    >
                      <div className="sala-card-head">
                        <span className="sala-numero">{sala.numero}</span>
                        <span className="sala-bloco">{sala.andar}º andar</span>
                      </div>
                      <p className="sala-capacidade"><Users size={14} /> Até {sala.capacidade} pessoas</p>
                      <div className="sala-card-footer">
                        <div className="sala-recursos">
                          {sala.projetor && <span className="sala-recurso-tag" title="Projetor"><Projector size={13} /></span>}
                          {sala.arCondicionado && <span className="sala-recurso-tag" title="Ar-condicionado"><Snowflake size={13} /></span>}
                          {!sala.projetor && !sala.arCondicionado && <span className="sala-sem-recurso">Sem recursos</span>}
                        </div>
                        {emManutencao && (
                          <span className="badge badge-manutencao"><Wrench size={11} /> Manutenção</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
              {restantes > 0 && (
                <button className="btn btn-secondary salas-mostrar-mais" onClick={() => mostrarMais(bloco.id)}>
                  Mostrar mais {Math.min(restantes, SALAS_POR_PAGINA)} salas ({restantes} restantes)
                </button>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
