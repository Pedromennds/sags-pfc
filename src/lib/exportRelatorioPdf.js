import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CORES_PDF, FONTE_PDF, registrarFontes, desenharCabecalho, desenharRodape, dataDeHojeFormatada } from './pdfTema'

export async function exportarRelatorioPdf({ dadosPorBloco, totalSalas, totalDisponivel, totalOcupada, totalManutencao }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const fonte = await registrarFontes(doc)
  const estiloForte = fonte === FONTE_PDF ? 'semibold' : 'bold'

  const inicioConteudo = await desenharCabecalho(doc, fonte, {
    titulo: 'Relatório de ocupação',
    subtitulo: 'Salas dos blocos didáticos',
  })

  const estiloTabela = {
    theme: 'grid',
    margin: { left: 40, right: 40, bottom: 48 },
    styles: { font: fonte, fontSize: 10, cellPadding: 7, textColor: CORES_PDF.tinta, lineColor: CORES_PDF.borda, lineWidth: 0.5 },
    headStyles: { font: fonte, fontStyle: estiloForte, fillColor: CORES_PDF.primaria, textColor: CORES_PDF.branco },
    alternateRowStyles: { fillColor: CORES_PDF.superficie },
  }

  autoTable(doc, {
    ...estiloTabela,
    startY: inicioConteudo,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total de salas cadastradas', String(totalSalas)],
      ['Salas sem reserva ativa', String(totalDisponivel)],
      ['Salas com reserva confirmada', String(totalOcupada)],
      ['Salas em manutenção', String(totalManutencao)],
    ],
  })

  const yTituloBlocos = doc.lastAutoTable.finalY + 32
  doc.setFont(fonte, estiloForte)
  doc.setFontSize(12)
  doc.setTextColor(...CORES_PDF.primariaEscura)
  doc.text('Ocupação por bloco didático', 40, yTituloBlocos)

  autoTable(doc, {
    ...estiloTabela,
    startY: yTituloBlocos + 12,
    head: [['Bloco', 'Sem reserva', 'Com reserva', 'Manutenção', 'Total']],
    body: dadosPorBloco.map((b) => [b.nome, String(b.disponivel), String(b.ocupada), String(b.manutencao), String(b.total)]),
  })

  desenharRodape(doc, fonte, `Gerado em ${dataDeHojeFormatada()}`)
  doc.save('relatorio-ocupacao-sags.pdf')
}
