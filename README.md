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
Collaborator

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
- Chave de API do openrouter.
- Chave de API do brapi.

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

Para rodar use:
```bash
npm run dev
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
    ├── planejamento
    ├── processo
    ├── prompt-ops
    └── visao-geral
        └── briefing-do-produto.md
```

- `README.md`: ponto de entrada do projeto e indice da documentacao.
- `CHANGELOG.md`: registro cronologico das implementacoes por data.
- `SPEC.md`: especificacao consolidada do produto e do MVP academico.
- `docs/visao-geral/briefing-do-produto.md`: contexto do desafio, proposta de valor, escopo inicial e arquitetura base.
- `docs/entregas/entrega-parcial-levelup.md`: checklist dos requisitos da entrega parcial.

## Convencao de organizacao

- Usar nomes de arquivos em minusculas, com palavras separadas por hifens, exceto documentos-base na raiz como `README.md`, `SPEC.md` e `CHANGELOG.md`.
- Separar documentos por objetivo: visao do produto, entregas, arquitetura, planejamento.
- Manter o `README.md` enxuto, sempre apontando para os documentos principais.

## Proximos documentos recomendados

- `docs/planejamento/backlog.md`
- `docs/arquitetura/visao-arquitetural.md`
- `docs/arquitetura/modelo-de-dados.md`
- `docs/arquitetura/api.md`
- `docs/prompt-ops/repositorio-de-prompts.md`
