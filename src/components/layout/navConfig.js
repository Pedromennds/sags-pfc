// Navegação principal: abas simples no topo. "Solicitações" e "Administração"
// só aparecem pra quem tem alguma permissão administrativa correspondente.
export const secoesPrincipais = [
  { id: 'painel', label: 'Painel', to: '/painel', end: true },
  { id: 'salas', label: 'Salas', to: '/salas' },
  { id: 'minhas-reservas', label: 'Minhas reservas', to: '/minhas-reservas' },
  { id: 'usuario', label: 'Usuário', to: '/perfil' },
  { id: 'solicitacoes', label: 'Solicitações', to: '/solicitacoes', permissoes: ['aprovar'] },
  {
    id: 'administracao',
    label: 'Administração',
    to: '/administracao',
    permissoes: ['gerenciar_salas', 'gerenciar_usuarios', 'gerenciar_calendario', 'gerenciar_grade_fixa', 'ver_auditoria'],
  },
]

export function secoesPrincipaisVisiveis(possuiPermissao) {
  return secoesPrincipais.filter((s) => !s.permissoes || s.permissoes.some(possuiPermissao))
}

// Seções administrativas: mostradas como um seletor único (dropdown), não como
// abas soltas, pra não poluir a barra superior.
export const secoesAdministrativas = [
  { id: 'salas', label: 'Gerenciar salas', to: '/administracao/salas', permissao: 'gerenciar_salas' },
  { id: 'blocos', label: 'Blocos didáticos', to: '/administracao/blocos', permissao: 'gerenciar_salas' },
  { id: 'grade-fixa', label: 'Grade fixa do semestre', to: '/administracao/grade-fixa', permissao: 'gerenciar_grade_fixa' },
  { id: 'usuarios', label: 'Usuários e papéis', to: '/administracao/usuarios', permissao: 'gerenciar_usuarios' },
  { id: 'calendario', label: 'Calendário', to: '/administracao/calendario', permissao: 'gerenciar_calendario' },
  { id: 'auditoria', label: 'Auditoria', to: '/administracao/auditoria', permissao: 'ver_auditoria' },
]

export function secoesAdministrativasVisiveis(possuiPermissao) {
  return secoesAdministrativas.filter((s) => !s.permissao || possuiPermissao(s.permissao))
}
