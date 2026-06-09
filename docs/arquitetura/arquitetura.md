# Arquitetura do InvestAI

## Visao geral

O InvestAI foi organizado como um monorepo TypeScript com tres superficies principais:

- `apps/api`: backend HTTP com Express, Prisma e regras de negocio.
- `apps/web`: frontend React com Vite e interface de consulta/analise.
- `packages/shared`: contratos, schemas e tipos compartilhados entre front e back.

A ideia central da arquitetura e manter os calculos financeiros deterministicos em codigo e usar IA apenas para classificacao, explicacao e recomendacao.

## Estrutura por tipo de arquivo

### Arquivos de raiz

- `README.md`: ponto de entrada da documentacao operacional do projeto.
- `SPEC.md`: consolidacao do escopo do MVP, requisitos e premissas do produto.
- `CHANGELOG.md`: historico cronologico das entregas e ajustes feitos no projeto.
- `AGENTS.md`: regras de trabalho e criterios tecnicos seguidos no repositório.

### Backend em `apps/api`

- `src/server.ts`: inicializa o servidor Express, registra rotas e conecta os endpoints da API.
- `src/config/env.ts`: carrega e valida variaveis de ambiente a partir do `.env` da raiz.
- `src/shared/http.ts`: centraliza o tratamento de erros HTTP e handlers assincronos.
- `src/shared/prisma.ts`: instancia compartilhada do cliente Prisma.
- `src/shared/numbers.ts`: utilitarios para conversao e arredondamento numerico.

#### Modulos de negocio

- `src/modules/analysis/analysis-service.ts`: orquestra criacao de analise, valuation e persistencia do resultado.
- `src/modules/valuation/valuation.ts`: calcula valor justo, upside e status parcial/completo de forma deterministica.
- `src/modules/recommendations/recommendation-service.ts`: cria recomendacoes a partir da analise disponivel e das regras de decisao.
- `src/modules/recommendations/recommendation-rules.ts`: define as regras de negocio para buy, monitor e avoid.
- `src/modules/agents/classification-agent.ts`: classifica a empresa e ajusta a justificativa da analise.
- `src/modules/agents/recommendation-agent.ts`: gera texto final da recomendacao, com fallback quando necessario.
- `src/modules/agents/openrouter.ts`: encapsula a integracao com o provedor de LLM.

#### Modulos de empresas e integracoes

- `src/modules/companies/company-mapper.ts`: converte os registros do banco para os contratos de resposta da API.
- `src/modules/integrations/import-service.ts`: importa empresas e snapshots a partir das fontes externas e do CSV local.
- `src/modules/integrations/types.ts`: define o formato intermediario usado na importacao.
- `src/modules/integrations/providers/*`: concentram as fontes de dados externas e o arquivo `statusinvest.csv` usado como base de importacao.
- `src/modules/integrations/merge/company-merger.ts`: combina os dados vindos de diferentes provedores antes da persistencia.

### Frontend em `apps/web`

- `src/main.tsx`: ponto de entrada do React.
- `src/app/App.tsx`: tela principal da aplicacao, com busca, detalhe da empresa, disparo de analise e recomendacao.
- `src/styles/global.css`: base visual do produto e estilos globais da interface.

### Contratos em `packages/shared`

- `src/index.ts`: reexporta schemas e tipos para consumo pelo backend e pelo frontend.
- `src/contracts/*.ts`: contratos de analise, recomendacao, erro e healthcheck.
- `src/schemas/company.ts`: schemas de busca, resumo e detalhe de empresa.
- `src/types/recommendation.ts`: tipos auxiliares de recomendacao, quando aplicavel.

### Persistencia e dados

- `apps/api/prisma/schema.prisma`: modelo do dominio, enums, relacoes e indices do banco.
- `apps/api/prisma/seed.ts`: carga inicial de dados para empresas, perfis e series historicas.
- `apps/api/prisma/migrations/*`: historico de evolucao do schema do banco.

### Infra e testes

- `infra/docker/docker-compose.yml`: sobe a infraestrutura local, principalmente PostgreSQL.
- `apps/api/tests/*`: testes de valuation, regras de recomendacao e agentes.
- `packages/shared/tests/*`: valida contratos e schemas compartilhados.

## Fluxo tecnico principal

1. O frontend consulta `GET /companies` e `GET /companies/:companyId` para montar a lista e o detalhe.
2. O usuario dispara `POST /analysis-requests`.
3. A API carrega a empresa, calcula valuation, classifica o contexto e persiste `AnalysisResult` + `ValuationResult`.
4. O frontend busca o resultado com `GET /analysis-requests/:analysisRequestId`.
5. Com a analise pronta, o usuario pode chamar `POST /recommendations` para obter a recomendacao final.

## Decisoes de arquitetura

- Os contratos de entrada e saida vivem em `packages/shared` para evitar divergencia entre front e back.
- O valuation e as regras de recomendacao sao deterministicas para manter rastreabilidade.
- A IA entra como camada de interpretacao e redacao, nunca como unica fonte de verdade para numeros.
- O Prisma concentra o modelo relacional e as restricoes de integridade do MVP.
- O frontend consome a API em vez de acessar o banco diretamente.
