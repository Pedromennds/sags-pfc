import { useState } from 'react'
import { Plus, Trash2, UploadCloud, Send } from 'lucide-react'
import AdminLayout from '../components/admin/AdminLayout'
import { salas, blocos, horarios, diasSemana } from '../data/mockData'
import { useToast } from '../context/ToastContext'
import './grade-fixa.css'

function linhaVazia() {
  return {
    id: `linha-${Math.random().toString(36).slice(2, 9)}`,
    salaId: '', diaId: '', horarioId: '', codigoMateria: '', nomeMateria: '', professorResponsavel: '',
  }
}

export default function GradeFixa() {
  const [linhas, setLinhas] = useState([linhaVazia()])
  const [csvTexto, setCsvTexto] = useState('')
  const mostrarToast = useToast()

  function atualizarLinha(id, campo, valor) {
    setLinhas((prev) => prev.map((l) => l.id === id ? { ...l, [campo]: valor } : l))
  }

  function adicionarLinha() {
    setLinhas((prev) => [...prev, linhaVazia()])
  }

  function removerLinha(id) {
    setLinhas((prev) => prev.length > 1 ? prev.filter((l) => l.id !== id) : prev)
  }

  function importarCsv() {
    const linhasTexto = csvTexto.trim().split('\n').filter(Boolean)
    if (linhasTexto.length === 0) {
      mostrarToast('Cole ao menos uma linha no formato indicado antes de importar.', 'aviso')
      return
    }
    const novasLinhas = linhasTexto.map((linhaTexto) => {
      const [numeroSala, diaId, horarioId, codigoMateria, nomeMateria, professorResponsavel] = linhaTexto.split(',').map((v) => v?.trim())
      const sala = salas.find((s) => s.numero === numeroSala)
      return {
        id: `linha-${Math.random().toString(36).slice(2, 9)}`,
        salaId: sala?.id ?? '',
        diaId: diasSemana.some((d) => d.id === diaId) ? diaId : '',
        horarioId: horarios.some((h) => h.id === horarioId) ? horarioId : '',
        codigoMateria: codigoMateria ?? '',
        nomeMateria: nomeMateria ?? '',
        professorResponsavel: professorResponsavel ?? '',
      }
    })
    setLinhas(novasLinhas)
    setCsvTexto('')
    mostrarToast(`${novasLinhas.length} linhas importadas — revise antes de publicar.`, 'info')
  }

  const linhasValidas = linhas.filter((l) => l.salaId && l.diaId && l.horarioId && l.codigoMateria && l.nomeMateria && l.professorResponsavel)
  const linhasInvalidas = linhas.length - linhasValidas.length

  function publicarGrade() {
    mostrarToast(`Grade fixa publicada: ${linhasValidas.length} aulas cadastradas para o semestre.`, 'sucesso')
    setLinhas([linhaVazia()])
  }

  return (
    <AdminLayout secaoAtivaId="grade-fixa">
      <div className="grade-fixa-page">
        <div className="card gf-import-card">
          <div className="section-heading">
            <div>
              <h2><UploadCloud size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />Importar em massa</h2>
              <p>Uma aula por linha: sala, dia, horário, código, nome da matéria, professor — separados por vírgula.</p>
            </div>
          </div>
          <textarea
            className="gf-csv-textarea"
            rows={3}
            placeholder={'205,seg,h2,ESW202,Engenharia de Software II,Luanna Lobato\n109,ter,h8,EDA101,Estrutura de Dados,Thiago Bittar'}
            value={csvTexto}
            onChange={(e) => setCsvTexto(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={importarCsv}>Importar linhas</button>
        </div>

        <div className="card gf-table-card">
          <div className="section-heading">
            <div>
              <h2>Aulas a cadastrar</h2>
              <p>{linhasValidas.length} completas {linhasInvalidas > 0 && `· ${linhasInvalidas} incompletas`}</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={adicionarLinha}><Plus size={14} /> Adicionar linha</button>
          </div>

          <div className="gf-table-scroll">
            <p className="scroll-hint">Arraste para o lado para ver todas as colunas →</p>
            <table className="gf-table">
              <thead>
                <tr>
                  <th>Sala</th>
                  <th>Dia</th>
                  <th>Horário</th>
                  <th>Código</th>
                  <th>Matéria</th>
                  <th>Professor</th>
                  <th aria-label="Remover"></th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha) => (
                  <tr key={linha.id}>
                    <td>
                      <select value={linha.salaId} onChange={(e) => atualizarLinha(linha.id, 'salaId', e.target.value)}>
                        <option value="">Selecione</option>
                        {blocos.map((bloco) => (
                          <optgroup key={bloco.id} label={bloco.nome}>
                            {salas.filter((s) => s.blocoId === bloco.id).map((s) => (
                              <option key={s.id} value={s.id}>{s.numero}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={linha.diaId} onChange={(e) => atualizarLinha(linha.id, 'diaId', e.target.value)}>
                        <option value="">Selecione</option>
                        {diasSemana.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={linha.horarioId} onChange={(e) => atualizarLinha(linha.id, 'horarioId', e.target.value)}>
                        <option value="">Selecione</option>
                        {horarios.map((h) => <option key={h.id} value={h.id}>{h.inicio}–{h.fim}</option>)}
                      </select>
                    </td>
                    <td><input value={linha.codigoMateria} placeholder="ESW202" onChange={(e) => atualizarLinha(linha.id, 'codigoMateria', e.target.value)} /></td>
                    <td><input value={linha.nomeMateria} placeholder="Nome da matéria" onChange={(e) => atualizarLinha(linha.id, 'nomeMateria', e.target.value)} /></td>
                    <td><input value={linha.professorResponsavel} placeholder="Professor" onChange={(e) => atualizarLinha(linha.id, 'professorResponsavel', e.target.value)} /></td>
                    <td>
                      <button className="btn-danger-ghost as-icon-btn" onClick={() => removerLinha(linha.id)} aria-label="Remover linha"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="gf-publicar-row">
            <p>A publicação substitui a grade de aulas fixas cadastrada para o semestre atual.</p>
            <button className="btn btn-primary" onClick={publicarGrade} disabled={linhasValidas.length === 0}>
              <Send size={15} /> Publicar grade do semestre
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
