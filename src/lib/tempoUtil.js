// Cálculo de horas úteis (dias de semana) decorridas — usado para o SLA de
// resposta de 24h definido com a PROGRAD (fins de semana não contam).
export function horasUteisDesde(dataISO) {
  const inicio = new Date(dataISO)
  const fim = new Date()
  if (Number.isNaN(inicio.getTime()) || inicio >= fim) return 0

  let horas = 0
  const cursor = new Date(inicio)
  while (cursor < fim) {
    const diaSemana = cursor.getDay() // 0 = domingo, 6 = sábado
    if (diaSemana !== 0 && diaSemana !== 6) horas += 1
    cursor.setHours(cursor.getHours() + 1)
  }
  return horas
}

export function formatarEspera(horas) {
  if (horas < 1) return 'menos de 1h'
  if (horas < 24) return `${horas}h úteis`
  const dias = Math.floor(horas / 24)
  const resto = horas % 24
  return resto === 0 ? `${dias}d úteis` : `${dias}d ${resto}h úteis`
}

const diaSemanaIndice = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 }

// Próxima ocorrência de um dia da semana (ex: 'seg') a partir de amanhã, no formato YYYY-MM-DD.
export function proximaDataParaDia(diaId) {
  const alvo = diaSemanaIndice[diaId]
  const data = new Date()
  data.setHours(0, 0, 0, 0)
  data.setDate(data.getDate() + 1)
  while (data.getDay() !== alvo) {
    data.setDate(data.getDate() + 1)
  }
  return data.toISOString().slice(0, 10)
}

// Horas corridas entre agora e uma data+hora específica (pode ser negativo se já passou).
export function horasAteDataHora(dataISO, horaHHMM) {
  const [h, m] = horaHHMM.split(':').map(Number)
  const alvo = new Date(`${dataISO}T00:00:00`)
  alvo.setHours(h, m, 0, 0)
  return Math.round((alvo.getTime() - Date.now()) / (60 * 60 * 1000))
}

// "Quinta-feira, 24 de setembro" — data atual por extenso, com inicial maiúscula
export function dataDeHojePorExtenso() {
  const texto = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
