# InvestAI

InvestAI é um MVP acadêmico de apoio à decisão para análise de empresas listadas em bolsa. A aplicação permite buscar empresas, consultar dados financeiros persistidos, gerar uma análise com valuation determinístico e obter uma recomendação explicada com IA opcional e fallback por regras.

> O projeto não executa ordens, não substitui análise profissional e não deve ser usado como recomendação financeira real. Os dados atuais vêm do seed local e servem para demonstração do fluxo.

## Status Atual

Fluxo principal implementado:

1. Buscar empresa por ticker, nome ou setor.
2. Ver detalhe com snapshot financeiro, histórico resumido e fonte dos dados.
3. Solicitar análise da empresa.
4. Calcular valuation por múltiplo de lucro em código determinístico.
5. Classificar a empresa com OpenRouter quando configurado, ou fallback local quando indisponível.
6. Gerar recomendação `buy`, `monitor` ou `avoid` com base em regras e texto explicativo com fallback.

Dados de demonstração disponíveis no seed:

- `BBAS3` - Banco do Brasil
- `PETR4` - Petrobras PN
- `VALE3` - Vale
- `WEGE3` - WEG
- `ITUB4` - Itaú Unibanco PN

## Stack

- Monorepo com npm workspaces.
- TypeScript em todas as camadas.
- Frontend: React, Vite, Recharts e lucide-react.
- Backend: Node.js, Express, Prisma e Zod.
- Banco: PostgreSQL via Docker Compose.
- Contratos compartilhados: `packages/shared`.
- IA opcional: OpenRouter, com fallback determinístico quando a chave não estiver configurada ou a resposta for inválida.

## Estrutura

```text
.
├── apps
│   ├── api                 # API Express, Prisma, agentes e regras de negócio
│   └── web                 # Frontend React/Vite
├── packages
│   └── shared              # Schemas Zod, tipos e contratos HTTP
├── infra
│   └── docker              # PostgreSQL local
├── docs                    # Documentação de produto e entregas
├── SPEC.md                 # Especificação consolidada do MVP
├── CHANGELOG.md            # Histórico de mudanças
└── AGENTS.md               # Regras para agentes de desenvolvimento
```

## Pré-Requisitos

- Node.js 22 ou superior.
- npm.
- Docker e Docker Compose.

## Como Rodar Localmente

1. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

2. Instale as dependências:

```bash
npm install
```

3. Suba o PostgreSQL:

```bash
npm run db:up
```

4. Rode as migrations e o seed:

```bash
npm run db:migrate
npm run db:seed
```

5. Inicie API e frontend:

```bash
npm run dev
```

URLs locais:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3333`
- Healthcheck: `http://localhost:3333/health`

## Variáveis de Ambiente

O arquivo `.env.example` contém os valores padrão para desenvolvimento local.

```env
DATABASE_URL="postgresql://investai:investai@localhost:5432/investai?schema=public"
API_PORT=3333
WEB_ORIGIN="http://localhost:5173"
VITE_API_URL="http://localhost:3333"
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="mistralai/mistral-small-3.1-24b-instruct"
OPENROUTER_TIMEOUT_MS=8000
```

`OPENROUTER_API_KEY` é opcional. Sem essa chave, o produto mantém o fluxo usando classificação e recomendação por regras locais.

## Comandos Úteis

```bash
npm run dev              # Sobe API e web em modo desenvolvimento
npm run dev:api          # Sobe apenas a API
npm run dev:web          # Sobe apenas o frontend
npm run build            # Compila shared, API e web
npm run typecheck        # Valida tipos em todos os workspaces
npm test                 # Executa testes com Vitest
npm run prisma:validate  # Valida schema Prisma
npm run prisma:generate  # Gera Prisma Client
npm run db:up            # Sobe PostgreSQL local
npm run db:down          # Derruba PostgreSQL local
npm run db:migrate       # Executa migrations
npm run db:seed          # Recria dados locais de demonstração
```

## API

Endpoints disponíveis:

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Status da API |
| `GET` | `/companies?query=BBAS3&limit=8` | Busca empresas por ticker, nome ou setor |
| `GET` | `/companies/:companyId` | Retorna detalhe, snapshot e histórico |
| `POST` | `/analysis-requests` | Cria e executa uma análise |
| `GET` | `/analysis-requests/:analysisRequestId` | Consulta o resultado da análise |
| `POST` | `/recommendations` | Gera recomendação para uma análise |

Exemplo de criação de análise:

```bash
curl -X POST http://localhost:3333/analysis-requests \
  -H "Content-Type: application/json" \
  -d '{"companyId":"ID_DA_EMPRESA","objective":"crescimento com risco moderado"}'
```

Exemplo de recomendação:

```bash
curl -X POST http://localhost:3333/recommendations \
  -H "Content-Type: application/json" \
  -d '{"analysisRequestId":"ID_DA_ANALISE","objective":"crescimento com risco moderado"}'
```

Respostas de erro seguem o contrato compartilhado:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem do erro",
    "details": {}
  }
}
```

## Valuation e IA

Regras importantes do projeto:

- Dados financeiros não são inventados: o MVP usa dados persistidos no banco.
- O valuation é reproduzível e calculado em TypeScript.
- O método atual é `earnings_multiple`: lucro por ação multiplicado por P/L alvo setorial.
- Quando faltam preço atual ou lucro por ação, a análise é marcada como `partial`.
- A IA pode classificar e redigir explicações, mas não é fonte de verdade numérica.
- Quando o provedor de IA falha, demora ou retorna JSON inválido, o sistema usa fallback local.

## Verificação

Antes de considerar o fluxo do MVP pronto, execute:

```bash
npm run typecheck
npm run build
npm run prisma:validate
npm test
```

Os testes atuais cobrem contratos compartilhados, valuation, thresholds de recomendação e fallback de classificação.

## Documentação

- `SPEC.md`: visão do produto, requisitos, escopo do MVP e decisões de arquitetura.
- `CHANGELOG.md`: histórico cronológico de implementações.
- `docs/visao-geral/briefing-do-produto.md`: briefing original do produto.
- `docs/entregas/entrega-parcial-levelup.md`: checklist da entrega parcial.
- `AGENTS.md`: regras operacionais para agentes de IA neste repositório.

## Convenções de Desenvolvimento

- Manter contratos públicos em `packages/shared`.
- Respostas públicas da API devem ser schema-shaped e usar códigos de erro claros.
- Evitar abstrações especulativas; preferir módulos TypeScript simples.
- Manter mudanças pequenas, testáveis e coerentes com o escopo do MVP.
- Expor resultados parciais de forma clara quando dados estiverem ausentes.
