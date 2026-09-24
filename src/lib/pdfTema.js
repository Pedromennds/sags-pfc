// Tema visual compartilhado dos PDFs exportados pelo SAGS.
// Espelha os tokens de src/styles/tokens.css (laranja + Poppins) para que o
// documento impresso tenha a mesma identidade visual da interface.
import logoUfcat from '../assets/ufcat-logo.png'

export const CORES_PDF = {
  primaria: [255, 111, 14],        // --color-primary
  primariaEscura: [218, 89, 4],    // --color-primary-dark
  primariaSuave: [252, 236, 230],  // --color-primary-soft
  tinta: [22, 33, 27],             // --color-ink
  tintaSuave: [107, 102, 94],      // --color-ink-soft
  tintaApagada: [155, 155, 155],   // --color-ink-faint
  superficie: [248, 248, 248],     // --color-surface-sunken
  borda: [220, 230, 225],          // --color-border
  branco: [255, 255, 255],
}

export const FONTE_PDF = 'Poppins'

const ARQUIVOS_FONTE = [
  { arquivo: 'Poppins-Regular.ttf', estilo: 'normal' },
  { arquivo: 'Poppins-SemiBold.ttf', estilo: 'semibold' },
  { arquivo: 'Poppins-Bold.ttf', estilo: 'bold' },
]

// Converte o binário da fonte em base64 em blocos, evitando estouro de pilha em arquivos grandes
function arrayBufferParaBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const TAMANHO_BLOCO = 0x8000
  let binario = ''
  for (let i = 0; i < bytes.length; i += TAMANHO_BLOCO) {
    binario += String.fromCharCode(...bytes.subarray(i, i + TAMANHO_BLOCO))
  }
  return btoa(binario)
}

async function carregarImagemComoDataUrl(url) {
  const resposta = await fetch(url)
  const blob = await resposta.blob()
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(leitor.result)
    leitor.onerror = reject
    leitor.readAsDataURL(blob)
  })
}

// Registra a Poppins no jsPDF. Se o download falhar, o PDF é gerado com Helvetica
// (retorna a fonte efetivamente disponível para o chamador usar).
export async function registrarFontes(doc) {
  try {
    const base = import.meta.env.BASE_URL
    for (const { arquivo, estilo } of ARQUIVOS_FONTE) {
      const resposta = await fetch(`${base}fonts/${arquivo}`)
      if (!resposta.ok) throw new Error(`Fonte ${arquivo} indisponível`)
      doc.addFileToVFS(arquivo, arrayBufferParaBase64(await resposta.arrayBuffer()))
      doc.addFont(arquivo, FONTE_PDF, estilo)
    }
    return FONTE_PDF
  } catch {
    return 'helvetica'
  }
}

// Cabeçalho padrão: marca UFCAT + nome do sistema à esquerda, título e subtítulo,
// fechado por uma linha laranja. Retorna o Y onde o conteúdo pode começar.
export async function desenharCabecalho(doc, fonte, { titulo, subtitulo }) {
  const margem = 40
  const larguraPagina = doc.internal.pageSize.getWidth()
  const estiloForte = fonte === FONTE_PDF ? 'semibold' : 'bold'

  try {
    // Logotipo oficial (proporção 374x240)
    const logo = await carregarImagemComoDataUrl(logoUfcat)
    doc.addImage(logo, 'PNG', margem, 24, 53, 34)
  } catch {
    // sem logo, o cabeçalho segue só com texto
  }

  doc.setFont(fonte, estiloForte)
  doc.setFontSize(10)
  doc.setTextColor(...CORES_PDF.primaria)
  doc.text('SAGS', margem + 64, 38)

  doc.setFont(fonte, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...CORES_PDF.tintaSuave)
  doc.text('Sistema de Alocação e Gerenciamento de Salas', margem + 64, 50)

  doc.setFont(fonte, estiloForte)
  doc.setFontSize(16)
  doc.setTextColor(...CORES_PDF.tinta)
  doc.text(titulo, larguraPagina - margem, 42, { align: 'right' })

  if (subtitulo) {
    doc.setFont(fonte, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...CORES_PDF.tintaSuave)
    doc.text(subtitulo, larguraPagina - margem, 56, { align: 'right' })
  }

  doc.setDrawColor(...CORES_PDF.primaria)
  doc.setLineWidth(2)
  doc.line(margem, 70, larguraPagina - margem, 70)

  return 88
}

export function desenharRodape(doc, fonte, texto) {
  const margem = 40
  const larguraPagina = doc.internal.pageSize.getWidth()
  const alturaPagina = doc.internal.pageSize.getHeight()
  const totalPaginas = doc.getNumberOfPages()

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina)
    doc.setDrawColor(...CORES_PDF.borda)
    doc.setLineWidth(0.5)
    doc.line(margem, alturaPagina - 36, larguraPagina - margem, alturaPagina - 36)

    doc.setFont(fonte, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...CORES_PDF.tintaApagada)
    doc.text(texto, margem, alturaPagina - 22)
    doc.text(`Página ${pagina} de ${totalPaginas}`, larguraPagina - margem, alturaPagina - 22, { align: 'right' })
  }
}

export function dataDeHojeFormatada() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}
