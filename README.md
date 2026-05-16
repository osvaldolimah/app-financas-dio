
# Monet.ai

Aplicação SPA (Single Page Application) mobile-first para gestão financeira pessoal, desenvolvida como trabalho do curso "Vibe Coding" na Digital Innovation One (DIO). É um MVP pensado para aprendizado: chat guiado por parser heurístico, metas, controle de receitas/despesas/investimentos e persistência local via LocalStorage.

Status: Pronto para teste e deploy estático (GitHub Pages / Vercel / Netlify).

---

## Tecnologias

- React 18 + Vite
- Tailwind CSS
- Recharts (gráficos)
- Lucide Icons
- Persistência: LocalStorage (sem backend)

## Recursos principais

- Autenticação simples (email) — sem senha, para fins de demonstração.
- Dashboard com saldo, últimas transações e gráficos (Receitas vs Despesas vs Investimentos; histórico de saldo; investimentos cumulativos).
- Chat conversacional com parser heurístico que classifica mensagens em intenções: depósito, saque, despesa, investimento, depósito para meta, explicações (modo "Warren Buffett"), e fluxos de confirmação para ambiguidades.
- Metas (criar, depositar, sacar, deletar) com visualização de progresso.
- Salvamento automático dos dados do usuário em LocalStorage.

---

## Estrutura do projeto (resumo)

- `index.html` – ponto de entrada
- `vite.config.js` – configuração Vite (inclui `base` para GitHub Pages)
- `package.json` – scripts e dependências
- `src/` – código fonte React
	- `src/components/` – `Auth`, `Dashboard`, `Chat`, `Goals`, `Navbar`
	- `src/utils/aiParser.js` – parser de intenções simples
	- `src/utils/storage.js` – helpers de LocalStorage
	- `src/App.jsx` – roteamento interno entre abas

---

## Instalação e execução (local)

1. Clone ou copie o repositório para sua máquina.
2. Instale dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

### Scripts úteis

- `npm run dev` — inicia servidor de desenvolvimento
- `npm run build` — gera a build para produção em `dist`
- `npm run preview` — pré-visualiza a build localmente
- `npm run deploy` — (opcional) faz deploy para GitHub Pages (usa `gh-pages`)

---

## Deploy (GitHub Pages)

1. No `vite.config.js` o `base` já está configurado para `/app-financas-dio/`. Se você usar outro nome de repositório, ajuste o `base` para `/<nome-do-repo>/`.
2. Instale `gh-pages` como devDependency:

```bash
npm install --save-dev gh-pages
```

3. Execute:

```bash
npm run deploy
```

Isso cria/atualiza a branch `gh-pages` com os arquivos estáticos.

Observação sobre roteamento: esta é uma SPA; para evitar 404 em rotas internas, prefira usar `HashRouter` ou adicionar um `404.html` que redirecione para `index.html`.

---

## Como usar (fluxos principais)

- Login/registro: informe um email para criar sessão local.
- Editor de saldo: edite o saldo inicial na aba Dashboard.
- Chat: envie mensagens como "depositei 50", "gastei 40 no mercado", "investi 200 em tesouro". O parser tenta identificar a intenção e pedirá confirmação se houver ambiguidade (sempre confirme antes de operações financeiras).
- Metas: crie metas com nome e valor; no chat você pode depositar em metas (ex.: "depositei 50 na reserva") e o sistema perguntará se é para a meta ou para o saldo quando estiver ambíguo.
- Mais detalhes: respostas de IA podem oferecer botão "Mais detalhes" com explicação adicional.

---

## Estrutura de dados (LocalStorage)

Chaves principais usadas no LocalStorage:

- `financas_user` — dados do usuário (email, createdAt)
- `financas_data` — objeto principal com campos:
	- `balance` (número)
	- `transactions` (array de objetos { type: 'income'|'expense'|'deposit_goal'|'withdraw_goal', amount, date, category?, note?, goal? })
	- `investments` (array de investimentos)
	- `goals` (array de metas { name, target, saved })
	- `chatMessages` (últimas mensagens persistidas)
	- `chatPending` (estado pendente quando há confirmação necessária)

Recomenda-se não editar manualmente estes valores sem conhecimento prévio.

---

## Notas de desenvolvimento

- Parser de linguagem (`src/utils/aiParser.js`) é heurístico (regex e regras) — adequado para demo, mas não substitui um NLU robusto.
- O app foi projetado para rodar 100% no cliente; não há autenticação segura nem armazenamento remoto.
- Para produção real, remova credenciais embutidas, adicione backend com autenticação e persistência segura.

---

## Testes manuais realizados

- Fluxos: criar meta, depositar em meta via chat, registrar despesa com categoria, registrar investimento, limpar mensagens.
- Build: `npm run build` executado com sucesso.

---

## Créditos

- Desenvolvido como trabalho do curso "Vibe Coding" na Digital Innovation One (DIO).

---

## Próximos passos sugeridos

- Adicionar testes automatizados e linter.
- Subir para Vercel/Netlify para continous deployment (mais simples para SPAs).
- Substituir parser heurístico por serviço NLU (opcional) quando houver backend.

---

Se quiser, eu também posso gerar um workflow de GitHub Actions para build + deploy automático no `gh-pages`.
# Monet.ai

Aplicativo SPA mobile-first para organização de finanças pessoais (MVP).

Como rodar:

1. Instale dependências:

```bash
npm install
```

2. Rode em desenvolvimento:

```bash
npm run dev
```

Notas:
- Estado é persistido via LocalStorage.
- Chat processa intenções via regex/includes conforme PRD.
