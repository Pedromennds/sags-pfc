import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CORES_PDF, FONTE_PDF, registrarFontes, desenharCabecalho, desenharRodape, dataDeHojeFormatada } from './pdfTema'

const ROTULO_TURNO = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }
const ORDEM_TURNOS = ['manha', 'tarde', 'noite']

// Monta as linhas da tabela: uma faixa por turno seguida dos horários daquele turno.
// Só entram reservas FIXAS — é a folha que fica afixada na porta da sala.
function montarLinhas({ horarios, diasSemana, ocupacoesSala }) {
  const linhas = []

  for (const turno of ORDEM_TURNOS) {
    const horariosDoTurno = horarios.filter((h) => h.turno === turno)
    if (horariosDoTurno.length === 0) continue

    linhas.push([{ content: ROTULO_TURNO[turno], colSpan: diasSemana.length + 1, styles: { tipoLinha: 'turno' } }])

    for (const horario of horariosDoTurno) {
      const celulas = [{ content: `${horario.inicio} – ${horario.fim}`, styles: { tipoLinha: 'horario' } }]
      for (const dia of diasSemana) {
        const aula = ocupacoesSala.find((r) => r.diaId === dia.id && r.horarioId === horario.id && r.tipo === 'fixa')
        celulas.push(aula
          ? { content: `${aula.codigoMateria} · ${aula.nomeMateria}\n${aula.professorResponsavel}`, styles: { tipoLinha: 'ocupada' } }
          : '')
      }
      linhas.push(celulas)
    }
  }
  return linhas
}

export async function exportarGradeFixaPdf({ sala, bloco, ocupacoesSala, horarios, diasSemana }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const fonte = await registrarFontes(doc)
  const estiloForte = fonte === FONTE_PDF ? 'semibold' : 'bold'

  // Largura útil dividida igualmente entre os dias, pra grade não ficar com colunas desiguais
  const MARGEM = 40
  const LARGURA_COLUNA_HORARIO = 78
  const larguraUtil = doc.internal.pageSize.getWidth() - MARGEM * 2
  const larguraDia = (larguraUtil - LARGURA_COLUNA_HORARIO) / diasSemana.length
  const colunas = { 0: { cellWidth: LARGURA_COLUNA_HORARIO } }
  diasSemana.forEach((_, indice) => { colunas[indice + 1] = { cellWidth: larguraDia } })

  const inicioConteudo = await desenharCabecalho(doc, fonte, {
    titulo: `Sala ${sala.numero} · ${bloco?.nome ?? ''}`,
    subtitulo: 'Grade fixa do semestre',
  })

  autoTable(doc, {
    startY: inicioConteudo,
    margin: { left: MARGEM, right: MARGEM, bottom: 44 },
    rowPageBreak: 'avoid',
    head: [['Horário', ...diasSemana.map((d) => d.label)]],
    body: montarLinhas({ horarios, diasSemana, ocupacoesSala }),
    theme: 'grid',
    styles: {
      font: fonte,
      fontSize: 7,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      minCellHeight: 17,
      valign: 'middle',
      halign: 'center',
      textColor: CORES_PDF.tinta,
      lineColor: CORES_PDF.borda,
      lineWidth: 0.5,
    },
    headStyles: {
      font: fonte,
      fontStyle: estiloForte,
      fillColor: CORES_PDF.primaria,
      textColor: CORES_PDF.branco,
      fontSize: 8.5,
    },
    columnStyles: colunas,
    // Aplica o visual de cada tipo de linha (faixa de turno, coluna de horário, aula ocupada)
    didParseCell(data) {
      const tipo = data.cell.raw?.styles?.tipoLinha
      if (tipo === 'turno') {
        data.cell.styles.fillColor = CORES_PDF.primariaSuave
        data.cell.styles.textColor = CORES_PDF.primariaEscura
        data.cell.styles.fontStyle = estiloForte
        data.cell.styles.halign = 'left'
      } else if (tipo === 'horario') {
        data.cell.styles.fontStyle = estiloForte
        data.cell.styles.fillColor = CORES_PDF.superficie
      } else if (tipo === 'ocupada') {
        data.cell.styles.fillColor = CORES_PDF.primariaSuave
        data.cell.styles.textColor = CORES_PDF.tinta
      }
    },
  })

  desenharRodape(doc, fonte, `Gerado em ${dataDeHojeFormatada()} · Válido apenas para aulas fixas cadastradas`)
  doc.save(`grade-sala-${sala.numero}.pdf`)
}
