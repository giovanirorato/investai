# Changelog

Este arquivo registra as implementacoes e mudancas relevantes do projeto em ordem cronologica, usando o formato `AAAA-MM-DD`.

## 2026-08-21

### Adicionado

- Criados contratos compartilhados point-in-time para candidatos, regras, metricas de backtest e experimentos do G Dividendos Evolutivo (`GDE-1.0.0`).
- Criado contrato auditavel para snapshots de carteira, preservando arquivo-fonte, hash, linha de origem, valores ausentes e avisos de importacao.
- Implementado calculo deterministico de dividendo normalizado bruto e liquido pela restricao mais conservadora entre recorrencia, lucro e caixa.
- Implementados filtros eliminatorios, quarentena de governanca, comparacao setorial, pontuacao por cobertura de dados e ranking do universo elegivel.
- Implementada construcao de carteira com pesos aproximadamente iguais, limites por empresa, setor e fonte de renda e manutencao de saldo nao alocado em caixa.
- Implementado calculador de backtest para renda real de 12 meses, CAGR, drawdowns, giro anualizado, falsos positivos e concentracao por empresa e setor.
- Implementada governanca champion/challenger com criterios de promocao, observacao, manutencao e rollback.
- Implementada auditoria de snapshots com reconciliacao de totais, duplicidades, valores ausentes e completude.
- Adicionados testes unitarios para contratos, metricas de backtest, normalizacao, look-ahead, governanca, yield traps, dados ausentes, concentracao, snapshots e evolucao metodologica.
- Documentada a metodologia em `docs/metodologia/gde-v1.md`.
- Registrado o primeiro contrato falsificavel em `docs/metodologia/experimentos/gde-exp-001-reduzir-armadilhas-de-dividendos.json`.

### Pendente de validacao

- Executar `typecheck`, `build`, validacao Prisma e testes em ambiente com execucao disponivel.
- Mapear e importar os snapshots de 4 e 19 de abril de 2026.
- Implementar a coleta historica point-in-time da CVM/B3 e o backtest walk-forward completo.

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
