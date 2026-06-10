# InvestAI

Plataforma de apoio a decisao para analise de empresas listadas em bolsa, identificacao de oportunidades e recomendacao de estrategias de investimento com apoio de IA.

## Colaboradores

@Allanzin178
Allan
Awaiting Allanzin178’s response
Allanzin178 • Collaborator
 
 @Danimell061
Daniel Francisco Evangelista de Sousa
Awaiting Daniell061’s response
Danimell061 • Collaborator
 
 @DevKalleby
DevKalleby
Awaiting DevKalleby’s response
Pending Invite
 
 @evandrolorens
Evandro Lorens
evandrolorens • Collaborator

 @Lucasgean08
Lucas_Gean
Awaiting Lucasgean08’s response
Pending Invite
 
 @marianaurani
Mariana Urani
Awaiting marianaurani’s response
Pending Invite
 
 @Matucaul
Mateus Lacerda
Matucaul • Collaborator

 @sudo-igor
Igor Sudo
Awaiting sudo-igor’s response
Pending Invite
 
 @williamffccsm
William de Jesus
Awaiting williamffccsm’s response
Pending Invite

## Trello

Para organização do projeto.
 - Mateus lacerda.

## Áreas de atuação

- Orientações
    - Giovani Rorato
- Frontend
- Backpend
- Conexão os os dados históricos
    - Base de dados, modelagem e dados.
- Conexão com os modelos LLM opensource
    - Giovani Rorato
- Aplicação de machine learaning
    - 

## Diretriz tecnica atual

O projeto usara `TypeScript` como linguagem principal. Essa decisao orienta a implementacao do frontend e do backend, reduz a fragmentacao tecnologica e simplifica manutencao, tipagem e compartilhamento de contratos entre camadas.

## Como rodar localmente

Pre-requisitos:

- Node.js 22 ou superior.
- Docker e Docker Compose.
- npm.
- Conta e chave de API do OpenRouter.
- Chave de API do BrAPI.

### Variaveis de ambiente

Copie o arquivo de exemplo e preencha os valores necessarios:

```bash
cp .env.example .env
```

As principais variaveis sao:

- `DATABASE_URL`: string de conexao do PostgreSQL.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`: configuracao do banco local.
- `API_PORT`: porta da API.
- `WEB_ORIGIN`: origem permitida para o frontend.
- `VITE_API_URL`: URL da API consumida pelo frontend.
- `BRAPI_API_KEY`: chave usada na importacao de dados de mercado.
- `OPENROUTER_API_KEY`: chave usada pelas integracoes de IA.
- `OPENROUTER_MODEL`: modelo consumido via OpenRouter.
- `OPENROUTER_TIMEOUT_MS`: tempo maximo da chamada para IA.

### Como obter a chave da BrAPI

1. Acesse `https://brapi.dev/` e crie ou entre na sua conta.
2. Abra a area de API keys ou de integracao da plataforma.
3. Gere uma nova chave de acesso.
4. Copie o valor exibido e cole em `BRAPI_API_KEY` no arquivo `.env`.
5. Nao commite essa chave no repositório.

### Como obter a chave do OpenRouter

1. Acesse `https://openrouter.ai` e crie ou entre na sua conta.
2. Abra a area de API keys.
3. Gere uma nova chave de acesso.
4. Copie o valor exibido e cole em `OPENROUTER_API_KEY` no arquivo `.env`.
5. Nao commite essa chave no repositório.

Passos:

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:migrate
npm run prisma:generate
```
Coloque todas as informacoes necessarias no .env para que a aplicação rode com uso de IA e com as informações das empresas
Após colocar a api da brapi no .env, use o comando 

```bash
npm run import:companies
```

Se quiser validar a estrutura do banco antes de subir a interface, rode também:

```bash
npm run prisma:validate
```

Para rodar use:
```bash
npm run dev
```

Se preferir iniciar apenas a API ou apenas o frontend:

```bash
npm run dev:api
npm run dev:web
```

URLs locais:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3333`
- Healthcheck da API: `http://localhost:3333/health`

Comandos uteis:

```bash
npm run dev:api
npm run dev:web
npm run import:companies
npm run prisma:generate
npm run prisma:studio
npm run prisma:reset
npm run typecheck
npm run build
npm run db:down
```

## Estrutura do projeto

```text
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   └── src
│   └── web
│       └── src
├── packages
│   └── shared
├── infra
│   └── docker
├── docs
├── SPEC.md
└── CHANGELOG.md
```

- `apps/api`: backend Node.js com Express, Prisma e PostgreSQL.
- `apps/web`: frontend React com Vite.
- `packages/shared`: tipos, contratos e schemas compartilhados.
- `infra/docker`: dependencias locais, como PostgreSQL.
- `SPEC.md`: documento-base do produto, escopo do MVP e duvidas abertas.
- `docs`: documentos da entrega, arquitetura, planejamento, processo e prompt ops.

## Documentacao atual

```text
.
├── README.md
├── CHANGELOG.md
├── SPEC.md
├── apps
├── packages
├── infra
└── docs
    ├── entregas
    │   └── entrega-parcial-levelup.md
    ├── arquitetura
    │   └── arquitetura.md
    ├── planejamento
    │   └── planejamento.md
    ├── processo
    │   └── processo.md
    ├── prompt-ops
    │   └── integracoes-de-ia-e-engenharia-de-prompt.md
    └── visao-geral
        └── briefing-do-produto.md
```

- `README.md`: ponto de entrada do projeto e indice da documentacao.
- `CHANGELOG.md`: registro cronologico das implementacoes por data.
- `SPEC.md`: especificacao consolidada do produto e do MVP academico.
- `docs/visao-geral/briefing-do-produto.md`: contexto do desafio, proposta de valor, escopo inicial e arquitetura base.
- `docs/entregas/entrega-parcial-levelup.md`: checklist dos requisitos da entrega parcial.
- `docs/arquitetura/arquitetura.md`: visao geral da arquitetura, organizacao por camadas e fluxo tecnico principal.
- `docs/planejamento/planejamento.md`: fases, prioridades e evolucao planejada do projeto.
- `docs/processo/processo.md`: processo de desenvolvimento, convencoes e criterios de validacao.
- `docs/prompt-ops/integracoes-de-ia-e-engenharia-de-prompt.md`: documentacao das integracoes de IA, prompts e processo de obtenção da API key do OpenRouter.

## Convencao de organizacao

- Usar nomes de arquivos em minusculas, com palavras separadas por hifens, exceto documentos-base na raiz como `README.md`, `SPEC.md` e `CHANGELOG.md`.
- Separar documentos por objetivo: visao do produto, entregas, arquitetura, planejamento.
- Manter o `README.md` enxuto, sempre apontando para os documentos principais.

## Proximos documentos recomendados

- `docs/planejamento/backlog.md`
- `docs/arquitetura/modelo-de-dados.md`
- `docs/arquitetura/api.md`
