# Changelog

Este arquivo registra as implementacoes e mudancas relevantes do projeto em ordem cronologica, usando o formato `AAAA-MM-DD`.

## 2026-04-26

### Adicionado

- Criada a estrutura inicial de monorepo para implementacao:
  - `apps/web`
  - `apps/api`
  - `packages/shared`
  - `infra/docker`
  - novas pastas de documentacao em `docs/`
- Adicionados arquivos base:
  - `apps/web/package.json`
  - `apps/api/package.json`
  - `apps/api/prisma/schema.prisma`
  - `apps/api/prisma/seed.ts`
  - `packages/shared/package.json`
  - `infra/docker/docker-compose.yml`
- Adicionados placeholders `.gitkeep` para manter pastas vazias versionadas.

### Alterado

- Atualizada `spec/spec.md` para orientar o desenvolvimento por uma equipe academica.
- Definido MVP academico recomendado, com itens obrigatorios e opcionais.
- Ajustada a stack proposta para `React`, `Vite`, `Node.js`, `Express` ou `Fastify`, `Prisma`, `PostgreSQL`, `Zod` e `Recharts`.
- Atualizada a estrutura de pastas recomendada para refletir o monorepo adotado.
- Adicionadas regras iniciais de valuation deterministico e recomendacao.
- Adicionados enums, formato padrao de erro e guia de implementacao por fases.

### Observacoes

- O projeto ainda nao possui implementacao funcional de frontend, backend ou banco.
- A proxima etapa recomendada e configurar os workspaces, scripts de desenvolvimento e modelos iniciais do Prisma.
