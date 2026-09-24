# SAGS — Sistema Acadêmico de Gestão de Salas (React)

PWA em React para reserva de salas dos Blocos Didáticos I e II (UFCAT — Catalão).

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5173

Para gerar a build de produção (com service worker do PWA):

```bash
npm run build
npm run preview
```

## O que está implementado (com dados fictícios, sem backend)

- **Login** — tela de entrada, sem autenticação real ainda.
- **Painel** — resumo de reservas e blocos didáticos.
- **Salas** — listagem com busca por número, filtro por bloco e capacidade.
- **Detalhe da sala** — grade de horários fixa (os mesmos slots da tabela oficial de horários), com seleção de horário livre e modal para confirmar a reserva.
- **Minhas reservas** — lista com filtro por status e cancelamento.
- **Aprovações** — fila de solicitações pendentes (aprovar/recusar).
- **Gerenciar salas** — CRUD simples de salas (admin).

Tudo funciona com estado local em memória (`src/data/mockData.js`) — ao recarregar a página, os dados voltam ao estado inicial. Isso deve ser substituído pela integração com a API quando o backend estiver pronto.

## Stack

- React 19 + Vite
- React Router
- vite-plugin-pwa (manifest + service worker)
- CSS puro com variáveis de tema (`src/styles/tokens.css`) — sem framework de UI
- lucide-react para ícones

## Estrutura

```
src/
  components/layout/   → Sidebar, Topbar, AppShell
  data/mockData.js     → blocos, salas, horários fixos, reservas de exemplo
  pages/                → uma pasta por tela, cada uma com seu .css
  styles/               → tokens.css (paleta, tipografia, espaçamento) e global.css
```

## Paleta e tipografia

- Primária: verde `#1F6D4C` (fundo escuro da sidebar em `#0D3222`)
- Tipografia: Poppins (Google Fonts, carregada no `index.html`)
