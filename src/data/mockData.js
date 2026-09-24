// Dados de exemplo — serão substituídos por chamadas de API no futuro.

export const blocos = [
  { id: 'bloco-1', nome: 'Bloco Didático I', andares: 3 },
  { id: 'bloco-2', nome: 'Bloco Didático II', andares: 3 },
]

// Levantamento com a PROGRAD definiu os únicos campos de sala que importam:
// capacidade máxima, projetor e ar-condicionado. Recursos livres foram removidos.
function gerarSalas(blocoId) {
  const salas = []
  let contadorManutencao = 0
  for (let andar = 1; andar <= 3; andar++) {
    for (let n = 1; n <= 10; n++) {
      const numero = `${andar}${String(n).padStart(2, '0')}`
      if (Number(numero) > 310) continue
      contadorManutencao++
      salas.push({
        id: `${blocoId}-${numero}`,
        numero,
        blocoId,
        andar,
        capacidade: [30, 40, 50, 60][Math.floor(Math.random() * 4)],
        projetor: Math.random() > 0.35,
        arCondicionado: Math.random() > 0.5,
        // status da sala: 'disponivel' | 'manutencao' — definido manualmente pela PROGRAD
        status: contadorManutencao % 11 === 0 ? 'manutencao' : 'disponivel',
      })
    }
  }
  return salas
}

export const salas = [
  ...gerarSalas('bloco-1'),
  ...gerarSalas('bloco-2'),
]

// Horários fixos extraídos da tabela oficial de horários de aula.
export const horarios = [
  { id: 'h1', inicio: '07:10', fim: '08:00', turno: 'manha' },
  { id: 'h2', inicio: '08:00', fim: '08:50', turno: 'manha' },
  { id: 'h3', inicio: '08:50', fim: '09:40', turno: 'manha' },
  { id: 'h4', inicio: '10:00', fim: '10:50', turno: 'manha' },
  { id: 'h5', inicio: '10:50', fim: '11:40', turno: 'manha' },
  { id: 'h6', inicio: '11:40', fim: '12:30', turno: 'manha' },
  { id: 'h7', inicio: '13:00', fim: '13:50', turno: 'tarde' },
  { id: 'h8', inicio: '13:50', fim: '14:40', turno: 'tarde' },
  { id: 'h9', inicio: '14:40', fim: '15:30', turno: 'tarde' },
  { id: 'h10', inicio: '15:50', fim: '16:40', turno: 'tarde' },
  { id: 'h11', inicio: '16:40', fim: '17:30', turno: 'tarde' },
  { id: 'h12', inicio: '17:30', fim: '18:20', turno: 'tarde' },
  { id: 'h13', inicio: '18:20', fim: '19:05', turno: 'noite' },
  { id: 'h14', inicio: '19:15', fim: '20:00', turno: 'noite' },
  { id: 'h15', inicio: '20:00', fim: '20:45', turno: 'noite' },
  { id: 'h16', inicio: '21:00', fim: '21:45', turno: 'noite' },
  { id: 'h17', inicio: '21:45', fim: '22:30', turno: 'noite' },
]

export const diasSemana = [
  { id: 'seg', label: 'Segunda' },
  { id: 'ter', label: 'Terça' },
  { id: 'qua', label: 'Quarta' },
  { id: 'qui', label: 'Quinta' },
  { id: 'sex', label: 'Sexta' },
  { id: 'sab', label: 'Sábado' },
]

function horasAtras(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

// Ocupações fixas de exemplo (sala + dia + horário) — grade do semestre, prioridade máxima.
// tipo 'fixa' = aula (código/nome da matéria + professor responsável).
// tipo 'avulsa' = solicitação pontual (motivo + solicitante, sem precisar repetir nome/data — isso já fica no log).
export const reservas = [
  { id: 'r1', salaId: salas[2]?.id, diaId: 'seg', horarioId: 'h2', tipo: 'fixa', usuario: 'Profa. Luanna Lobato', codigoMateria: 'ESW202', nomeMateria: 'Engenharia de Software II', professorResponsavel: 'Luanna Lobato', status: 'confirmada' },
  { id: 'r2', salaId: salas[2]?.id, diaId: 'qua', horarioId: 'h2', tipo: 'fixa', usuario: 'Profa. Luanna Lobato', codigoMateria: 'ESW202', nomeMateria: 'Engenharia de Software II', professorResponsavel: 'Luanna Lobato', status: 'confirmada' },
  { id: 'r3', salaId: salas[5]?.id, diaId: 'ter', horarioId: 'h8', tipo: 'fixa', usuario: 'Prof. Thiago Bittar', codigoMateria: 'EDA101', nomeMateria: 'Estrutura de Dados', professorResponsavel: 'Thiago Bittar', status: 'confirmada' },
  { id: 'r4', salaId: salas[0]?.id, diaId: 'sex', horarioId: 'h1', tipo: 'avulsa', usuario: 'Secretaria de Computação', motivo: 'Reunião de colegiado do curso', data: '2026-09-19', status: 'pendente', solicitadoEm: horasAtras(58) },
  { id: 'r5', salaId: salas[8]?.id, diaId: 'qui', horarioId: 'h9', tipo: 'avulsa', usuario: 'Prof. Thiago Bittar', motivo: 'Aula de reposição de Estrutura de Dados', data: '2026-09-18', status: 'pendente', solicitadoEm: horasAtras(34) },
  { id: 'r6', salaId: salas[12]?.id, diaId: 'ter', horarioId: 'h14', tipo: 'avulsa', usuario: 'Secretaria de Matemática', motivo: 'Monitoria de Cálculo I', data: '2026-09-23', status: 'pendente', solicitadoEm: horasAtras(29) },
  { id: 'r7', salaId: salas[3]?.id, diaId: 'qua', horarioId: 'h7', tipo: 'avulsa', usuario: 'PROGRAD — Pró-reitoria de Graduação', motivo: 'Reunião de planejamento do próximo semestre', data: '2026-09-16', status: 'pendente', solicitadoEm: horasAtras(9) },
  { id: 'r8', salaId: salas[15]?.id, diaId: 'sex', horarioId: 'h3', tipo: 'avulsa', usuario: 'Profa. Luanna Lobato', motivo: 'Apresentação de projeto final de TCC', data: '2026-09-25', status: 'pendente', solicitadoEm: horasAtras(3) },
]

export const minhasReservas = [
  { id: 'mr1', sala: '205 · Bloco Didático I', data: '2026-09-03', horario: '13:00 – 13:50', tipo: 'avulsa', motivo: 'Apresentação de projeto final', status: 'confirmada' },
  { id: 'mr2', sala: '112 · Bloco Didático II', data: '2026-09-05', horario: '19:15 – 20:00', tipo: 'avulsa', motivo: 'Monitoria de Estruturas de Dados', status: 'pendente' },
  { id: 'mr3', sala: '301 · Bloco Didático I', data: '2026-08-22', horario: '10:00 – 10:50', tipo: 'fixa', codigoMateria: 'ESW202', nomeMateria: 'Engenharia de Software II', professorResponsavel: 'Luanna Lobato', status: 'concluida' },
  { id: 'mr4', sala: '108 · Bloco Didático I', data: '2026-08-18', horario: '16:40 – 17:30', tipo: 'avulsa', motivo: 'Aula de reposição', status: 'cancelada' },
]

// Papéis e permissões — painel de administração definido no levantamento de requisitos
// (a validação de reservas é feita por pessoas selecionadas com essa permissão específica)
export const permissoesDisponiveis = [
  { id: 'solicitar', label: 'Solicitar reservas avulsas' },
  { id: 'aprovar', label: 'Aprovar ou recusar solicitações' },
  { id: 'gerenciar_salas', label: 'Gerenciar cadastro de salas' },
  { id: 'gerenciar_calendario', label: 'Gerenciar calendário e exceções' },
  { id: 'gerenciar_usuarios', label: 'Gerenciar usuários e papéis' },
  { id: 'gerenciar_grade_fixa', label: 'Cadastrar grade fixa do semestre' },
  { id: 'ver_auditoria', label: 'Ver histórico e auditoria' },
]

export const usuarios = [
  { id: 'usr1', nome: 'Pedro Alves', email: 'pedro.alves@ufcat.edu.br', papel: 'Responsável PROGRAD', permissoes: ['solicitar', 'aprovar', 'gerenciar_salas', 'gerenciar_calendario', 'gerenciar_usuarios', 'gerenciar_grade_fixa', 'ver_auditoria'] },
  { id: 'usr2', nome: 'Luanna Lobato', email: 'luanna.lobato@ufcat.edu.br', papel: 'Docente', permissoes: ['solicitar'] },
  { id: 'usr3', nome: 'Thiago Bittar', email: 'thiago.bittar@ufcat.edu.br', papel: 'Docente', permissoes: ['solicitar'] },
  { id: 'usr4', nome: 'Secretaria de Computação', email: 'secretaria.computacao@ufcat.edu.br', papel: 'Secretaria de curso', permissoes: ['solicitar'] },
  { id: 'usr5', nome: 'Setor de Aprovações PROGRAD', email: 'aprovacoes.prograd@ufcat.edu.br', papel: 'Setor PROGRAD', permissoes: ['aprovar', 'ver_auditoria'] },
]

// Exceções de calendário — feriados, eventos e bloqueios inseridos manualmente pela PROGRAD
export const excecoesCalendario = [
  { id: 'ex1', titulo: 'Feriado de Tiradentes', tipo: 'feriado', dataInicio: '2026-04-21', dataFim: '2026-04-21', escopo: 'Todos os blocos' },
  { id: 'ex2', titulo: 'Semana Nacional de Ciência e Tecnologia', tipo: 'evento', dataInicio: '2026-10-19', dataFim: '2026-10-23', escopo: 'Bloco Didático I' },
  { id: 'ex3', titulo: 'Dedetização programada', tipo: 'bloqueio', dataInicio: '2026-09-20', dataFim: '2026-09-21', escopo: 'Bloco Didático II' },
]
