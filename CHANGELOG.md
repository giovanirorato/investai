# Changelog

Este arquivo registra as implementacoes e mudancas relevantes do projeto em ordem cronologica, usando o formato `AAAA-MM-DD`.

## 2026-05-26

### Adicionado

- Criado `AGENTS.md` com regras do InvestAI para uso de IA, valuation deterministico, fallback e verificacao.
- Implementados contratos compartilhados para empresas, analises, erros e recomendacoes.
- Implementados endpoints de busca, detalhe, analise, consulta de analise e recomendacao.
- Adicionados modulos de valuation deterministico, recomendacao por regra e adaptador OpenRouter opcional.
- Substituida a tela placeholder por fluxo funcional de busca, detalhe, grafico, analise e recomendacao.
- Adicionados testes unitarios com Vitest para contratos, valuation, recomendacao e fallback de classificacao.

### Alterado

- Ajustados scripts de build, typecheck e test para compilar `@investai/shared` antes de `apps/api` e `apps/web`.
- Permitido persistir valuation parcial com `fairPrice` e `upsidePct` nulos.

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
- Criado setup raiz com `package.json`, workspaces npm, `tsconfig.base.json`, `.gitignore` e `.env.example`.
- Implementada API minima em Express com endpoint `GET /health`.
- Adicionado schema Prisma inicial com entidades de empresas, snapshots, historico, analises, valuation, recomendacoes e perfis.
- Adicionada migration inicial do Prisma para PostgreSQL.
- Criado seed inicial com 5 empresas e 2 perfis de usuario.
- Criado frontend minimo com React e Vite para validar o status da API.
- Criado pacote `packages/shared` com contratos e schemas iniciais.

### Alterado

- Atualizada `SPEC.md` para orientar o desenvolvimento por uma equipe academica.
- Definido MVP academico recomendado, com itens obrigatorios e opcionais.
- Ajustada a stack proposta para `React`, `Vite`, `Node.js`, `Express` ou `Fastify`, `Prisma`, `PostgreSQL`, `Zod` e `Recharts`.
- Atualizada a estrutura de pastas recomendada para refletir o monorepo adotado.
- Adicionadas regras iniciais de valuation deterministico e recomendacao.
- Adicionados enums, formato padrao de erro e guia de implementacao por fases.
- Atualizado `README.md` com comandos para instalar, subir banco, rodar migrations, seed e servidores locais.
- Ajustado `infra/docker/docker-compose.yml` para usar variaveis de ambiente e healthcheck do PostgreSQL.

### Observacoes

- O projeto agora possui setup local minimo, mas os endpoints funcionais do produto ainda precisam ser implementados.
- A proxima etapa recomendada e implementar `GET /companies` e `GET /companies/:companyId` usando o Prisma.
