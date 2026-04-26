# Spec do Produto - InvestAI

## 0. Como ler este documento

Este arquivo e o documento-base do produto nesta fase do projeto. Ele consolida visao de negocio, escopo do MVP e definicoes iniciais de engenharia.

- Fonte principal: `docs/visao-geral/briefing-do-produto.md`.
- Cobertura complementar: `docs/entregas/entrega-parcial-levelup.md` e `definicoes.md`.
- Marcacao de hipotese: todo item nao confirmado diretamente pelo briefing aparece com o rotulo `Assuncao`.

### Diretriz para equipe academica

Este documento deve orientar uma equipe de estudantes a entregar um MVP funcional, demonstravel e tecnicamente coerente. Por isso, a prioridade nao e construir a arquitetura mais completa possivel, mas sim uma versao simples que prove o fluxo principal do produto.

Principios para desenvolvimento:

- Priorizar o fluxo ponta a ponta: buscar empresa -> ver dados -> solicitar analise -> receber valuation -> receber recomendacao.
- Comecar com dados controlados em `seed` ou mock para 5 a 10 empresas e integrar uma API externa apenas depois que o fluxo local estiver funcionando.
- Usar IA para explicar, classificar e recomendar, mas manter calculos numericos e valuation em codigo deterministico.
- Evitar microservicos, filas externas, `Elasticsearch` e machine learning proprietario no MVP.
- Documentar decisoes, prompts, limitacoes e erros conhecidos para facilitar avaliacao academica.
- Manter tarefas pequenas, testaveis e divisiveis entre frontend, backend, banco, IA e documentacao.

## 1. Resumo executivo

### Problema em versao curta

Analisar empresas listadas em bolsa ainda exige juntar dados dispersos, interpretar indicadores manualmente e comparar ativos com pouca padronizacao, o que aumenta tempo, custo e risco de decisao.

### Solucao em versao curta

O InvestAI centraliza dados financeiros, automatiza analises com agentes de IA e entrega valuation e recomendacoes acionaveis para diferentes perfis de investidor.

### Problema detalhado

A analise de ativos costuma ser lenta, fragmentada e dependente de interpretacao manual. Isso aumenta o risco de decisoes baseadas em percepcao, dados incompletos ou pouca capacidade de comparacao entre empresas.

### Solucao proposta

Centralizar dados financeiros, modelos de valuation e analise assistida por IA em uma unica plataforma, com interface simples e respostas acionaveis para investidores e instituicoes.

### Proposta de valor

- Reduzir o tempo necessario para pesquisar e comparar empresas.
- Padronizar a leitura de indicadores e sinais de oportunidade.
- Apoiar decisoes com analise explicita, rastreavel e contextualizada.
- Escalar o atendimento tanto para investidores individuais quanto para carteiras institucionais.

### Onde a IA gera valor

- `Automacao`: coleta, consolidacao e normalizacao de dados financeiros.
- `Classificacao assistida`: enquadramento de empresas por perfil, caracteristicas e sinais de investimento.
- `Analise e predicao assistida`: apoio ao valuation e identificacao de oportunidades.
- `Geracao de conteudo`: recomendacoes e explicacoes contextualizadas a partir do objetivo do usuario.

## 2. Visao do produto

### Contexto

O projeto nasce no contexto do desafio `BB - Squad 27`, com foco em apoio a decisao para analise de empresas listadas em bolsa.

### Objetivo do produto

Entregar uma plataforma web que permita pesquisar empresas, visualizar dados financeiros relevantes, acionar analises automatizadas e receber recomendacoes alinhadas ao perfil ou objetivo do usuario.

### Publico-alvo inicial

- Investidor individual que precisa ganhar velocidade e clareza na avaliacao de ativos.
- Analista ou assessor de investimentos que precisa comparar empresas e justificar recomendacoes.
- Gestor institucional que precisa escalar analise com maior consistencia metodologica.

### Diferenciais competitivos

- Analise avancada como servico de alto valor para a instituicao.
- Reducao de risco por meio de avaliacoes mais consistentes.
- Escalabilidade para usuarios individuais e institucionais.
- Uso de IA multiagente para analise dinamica e contextual.

### Objetivos de negocio da primeira fase

- Validar que usuarios conseguem sair da busca de uma empresa para uma recomendacao acionavel em um fluxo unico.
- Provar que a analise assistida reduz tempo operacional sem perder legibilidade.
- Estruturar uma base tecnica reaproveitavel para evolucao de dados, recomendacao e machine learning.

## 3. Personas e cenarios

### Persona 1 - Investidor individual

- Perfil: usuario com conhecimento intermediario de mercado, pouco tempo para consolidar dados manualmente.
- Objetivo: descobrir se uma empresa faz sentido para sua estrategia e horizonte.
- Dor principal: excesso de fontes, pouca comparabilidade e dificuldade de traduzir indicadores em decisao.
- Cenario principal: busca uma empresa, consulta dados e recebe uma recomendacao explicada em linguagem simples.

### Persona 2 - Analista ou assessor

- Perfil: profissional que precisa analisar empresas com mais profundidade e comunicar uma tese.
- Objetivo: acelerar comparacoes e gerar insumos para recomendacoes a clientes ou ao time.
- Dor principal: retrabalho para coletar dados, montar contexto e justificar conclusoes.
- Cenario principal: consulta empresas, solicita analise automatizada e usa o resumo gerado para apoiar sua tese.

### Persona 3 - Gestor institucional

- Perfil: usuario responsavel por carteira, governanca ou priorizacao de oportunidades.
- Objetivo: identificar rapidamente ativos com melhor alinhamento a uma estrategia de carteira.
- Dor principal: alto volume de ativos, pouco tempo e necessidade de consistencia entre avaliacoes.
- Cenario principal: recebe sinais de oportunidade e recomendacoes alinhadas a objetivos de carteira.

### Cenarios principais de uso

1. Pesquisar uma empresa listada por nome ou ticker.
2. Consultar indicadores, historico e graficos basicos da empresa.
3. Solicitar uma analise automatizada da empresa.
4. Receber um valuation com preco justo e nivel de confianca.
5. Receber uma recomendacao alinhada ao perfil ou objetivo informado.

### Casos de borda relevantes

- Empresa nao encontrada ou ticker invalido.
- Dados financeiros ausentes, desatualizados ou inconsistentes entre provedores.
- Resposta parcial de um agente sem base suficiente para conclusao.
- Usuario sem perfil definido tentando receber recomendacao personalizada.
- Integracao externa indisponivel no momento da analise.

## 4. Escopo do MVP

### Incluido no MVP

- Busca de empresas listadas em bolsa.
- Visualizacao de dados financeiros essenciais e historico resumido.
- Disparo de analise automatizada por agentes especializados.
- Apresentacao de valuation inicial com racional resumido.
- Geracao de recomendacao alinhada ao perfil ou objetivo do usuario.
- Registro do pedido de analise e do resultado para consulta posterior.

### MVP academico recomendado

Para uma equipe estudante, o MVP deve ser dividido em uma versao obrigatoria e extensoes opcionais.

Obrigatorio para demonstracao:

- Cadastro inicial via `seed` de empresas, setores e indicadores financeiros.
- Busca por nome ou ticker usando dados locais.
- Tela de detalhe com indicadores principais, grafico simples e fonte/data dos dados.
- Botao para solicitar analise da empresa.
- Backend criando `AnalysisRequest`, gerando resultado e salvando status.
- Valuation simplificado calculado em codigo, com premissas visiveis.
- Recomendacao textual gerada por IA ou por regra fallback quando a IA estiver indisponivel.

Opcional se houver tempo:

- Integracao real com uma API de mercado.
- Autenticacao de usuarios.
- Historico completo de analises por usuario.
- Comparacao entre duas ou mais empresas.
- Execucao assincrona com fila real.

### Fora de escopo nesta fase

- Execucao de ordem de compra ou venda.
- Rebalanceamento automatico de carteira.
- Chat aberto multiuso sem contexto de ativo.
- Machine learning proprietario treinado com dados internos.
- Dependencia obrigatoria de `Elasticsearch`.

### Prioridades do MVP

1. Tornar confiavel o fluxo de busca -> dados -> analise -> recomendacao.
2. Garantir legibilidade e rastreabilidade das conclusoes dos agentes.
3. Minimizar dependencia operacional de interpretacao manual para tarefas repetitivas.

### Fluxos principais

#### Fluxo 1 - Busca e consulta de empresa

1. Usuario informa nome ou ticker.
2. Sistema retorna lista de empresas elegiveis.
3. Usuario abre o detalhe da empresa.
4. Sistema exibe dados financeiros, historico e status de disponibilidade de analise.

#### Fluxo 2 - Analise automatizada

1. Usuario solicita analise de uma empresa.
2. Backend cria um `AnalysisRequest`.
3. Agente de Coleta busca e consolida dados.
4. Agente de Classificacao enquadra a empresa.
5. Agente de Valuation calcula preco justo e sinaliza oportunidade.
6. Resultado consolidado e persistido como `AnalysisResult` e `ValuationResult`.

#### Fluxo 3 - Recomendacao personalizada

1. Usuario informa ou seleciona perfil e objetivo.
2. Sistema recupera analise e valuation disponiveis.
3. Agente de Recomendacao gera recomendacao contextualizada.
4. Resultado final e apresentado com justificativa resumida e nivel de confianca.

## 5. Requisitos

### Requisitos funcionais

- RF01: permitir busca de empresas por nome, ticker ou setor.
- RF02: exibir detalhes basicos da empresa, incluindo indicadores financeiros essenciais.
- RF03: exibir historico resumido e graficos basicos da empresa.
- RF04: permitir solicitar analise automatizada de uma empresa.
- RF05: orquestrar agentes de coleta, classificacao, valuation e recomendacao.
- RF06: persistir pedidos de analise, resultados e status de execucao.
- RF07: gerar valuation com preco justo, racional resumido e sinalizacao de oportunidade.
- RF08: gerar recomendacao alinhada ao perfil ou objetivo do usuario.
- RF09: expor o status da analise para consulta posterior.
- RF10: registrar fonte e timestamp dos dados utilizados na analise.

### Requisitos nao funcionais

- RNF01: frontend e backend devem usar `TypeScript`.
- RNF02: a plataforma deve manter rastreabilidade minima das analises, incluindo fontes, horario da coleta e versao do processamento.
- RNF03: a resposta ao usuario deve deixar claro quando uma recomendacao foi gerada com base parcial ou incompleta.
- RNF04: o sistema deve tolerar indisponibilidade temporaria de integracoes externas e retornar status coerente ao frontend.
- RNF05: a arquitetura deve permitir trocar provedores de dados e modelos de IA com baixo acoplamento.
- RNF06: a latencia de consultas simples deve ser menor que a de analises completas; `Assuncao`: busca e detalhe devem responder em segundos, enquanto analises podem ser assincronas.
- RNF07: o sistema deve armazenar dados estruturados em `PostgreSQL`; `Assuncao`: `Elasticsearch` fica reservado para uma fase futura de busca e indexacao avancada.

### Padroes de uso de IA no produto

- IA deve ser usada para consolidar, classificar, resumir e recomendar, nunca como unica fonte de verdade sobre dados numericos.
- Sempre que possivel, calculos financeiros devem ser reproduziveis fora do modelo generativo.
- Saidas geradas por IA devem incluir justificativa curta, sinais de incerteza e referencia aos dados-base usados no processo.
- O backend deve desacoplar orquestracao, chamada de modelo e pos-processamento para facilitar auditoria.

### Como validar resultados de IA

- Comparar os indicadores usados na resposta com os dados persistidos no sistema.
- Verificar se a recomendacao respeita o perfil e objetivo informados.
- Rejeitar ou marcar como parcial respostas sem racional minimo ou com campos obrigatorios ausentes.
- Manter regras deterministicas para limites, formatos e consistencia de campos numericos.

## 6. Backlog inicial

### Epic 1 - Descoberta e consulta de empresas

**Historia 1.1**  
Como investidor, quero buscar empresas por nome ou ticker para encontrar rapidamente um ativo relevante.

Criterios de aceite:
- a busca retorna lista paginada ou limitada de empresas compativeis.
- cada resultado mostra pelo menos nome, ticker e setor quando disponivel.
- o sistema informa quando nao ha correspondencia.

Tarefas derivadas:
- integrar fonte de busca de empresas.
- criar endpoint de busca.
- montar tela de resultados.

**Historia 1.2**  
Como usuario, quero abrir o detalhe de uma empresa para visualizar seus dados principais antes de pedir uma analise.

Criterios de aceite:
- a tela ou resposta inclui indicadores financeiros essenciais e historico resumido.
- o sistema informa a data de referencia dos dados.
- a ausencia de um indicador nao quebra a visualizacao.

Tarefas derivadas:
- definir conjunto minimo de indicadores.
- integrar coleta de detalhes da empresa.
- persistir snapshot financeiro.

### Epic 2 - Analise automatizada

**Historia 2.1**  
Como analista, quero solicitar uma analise automatizada para reduzir o tempo gasto com consolidacao manual.

Criterios de aceite:
- ao solicitar analise, o sistema cria um `AnalysisRequest` com status inicial.
- o backend executa agentes na ordem prevista ou marca falha parcial.
- o usuario consegue consultar o status da analise.

Tarefas derivadas:
- modelar pedido de analise.
- orquestrar pipeline de agentes.
- registrar logs e status por etapa.

**Historia 2.2**  
Como analista, quero receber um valuation com racional resumido para usar como insumo de decisao.

Criterios de aceite:
- o resultado inclui preco justo, sinalizacao de oportunidade e resumo do racional.
- o sistema indica quando o valuation foi calculado com base parcial.
- a resposta preserva referencia aos dados usados.

Tarefas derivadas:
- definir contrato do valuation.
- implementar etapa de calculo e consolidacao.
- persistir resultado com metadados de confianca.

### Epic 3 - Recomendacao personalizada

**Historia 3.1**  
Como investidor, quero receber recomendacoes alinhadas ao meu perfil para decidir com mais contexto.

Criterios de aceite:
- a recomendacao considera perfil ou objetivo informado.
- a resposta inclui resumo, justificativa e proxima acao sugerida.
- o sistema impede recomendacao personalizada sem contexto minimo.

Tarefas derivadas:
- modelar `UserProfile`.
- implementar entrada de perfil e objetivo.
- acionar agente de recomendacao.

### Epic 4 - Base tecnica e governanca

**Historia 4.1**  
Como time de produto e engenharia, queremos rastrear dados, fontes e falhas para garantir confiabilidade.

Criterios de aceite:
- cada analise registra data, fonte e status por etapa.
- falhas externas e respostas inconsistentes ficam visiveis no backend.
- o frontend recebe mensagens claras de indisponibilidade ou parcialidade.

Tarefas derivadas:
- padronizar logs de execucao.
- definir codigos de erro.
- mapear mensagens de retorno.

## 7. Arquitetura inicial

### Stack proposta

- Frontend: `React`, `Vite` e `TypeScript`.
- Backend: `Node.js`, `Express` ou `Fastify` e `TypeScript`.
- Validacao de dados: `Zod` ou biblioteca equivalente.
- ORM e banco: `Prisma` com `PostgreSQL`.
- Graficos: biblioteca simples no frontend, como `Recharts` ou equivalente.
- IA: `OpenRouter` ou outro provedor compativel, isolado atras de um adaptador.
- Dados de mercado no MVP: primeiro `seed` local; depois `Yahoo Finance`, `Alpha Vantage` ou equivalente.
- Busca/indexacao avancada: `Elasticsearch` somente em fase futura.
- `Assuncao`: a equipe deve escolher `Express` ou `Fastify`, nao ambos.
- `Assuncao`: manter `OpenRouter` como opcao pratica para acesso a modelos open-source, conforme `definicoes.md`.

### Ferramentas de IA e classificacao de custo

- Gratuitas ou com camada gratuita: provedores de dados com free tier, modelos open-source via infraestrutura propria ou terceiros.
- Pagas: APIs premium de mercado, modelos fechados com custo por token e servicos gerenciados de busca/indexacao.
- `Assuncao`: o MVP deve priorizar componentes com baixo custo inicial e facilidade de substituicao.

### Estrutura recomendada de pastas para implementacao

Os documentos base existentes permanecem como ponto de entrada do projeto:

```text
.
  README.md
  definicoes.md
  docs/
    entregas/
    visao-geral/
  spec/
    spec.md
    duvidas.md
```

Para a implementacao, a estrutura adotada e um monorepo simples, com poucas camadas e responsabilidades claras:

```text
.
  apps/
    web/
      package.json
      src/
        app/
        components/
        features/
          companies/
          analysis/
          recommendations/
        services/
        styles/
    api/
      package.json
      prisma/
        schema.prisma
        seed.ts
      src/
        modules/
          companies/
          analysis/
          recommendations/
          agents/
          integrations/
          valuation/
        shared/
        jobs/
        config/
  packages/
    shared/
      src/
        contracts/
        schemas/
        types/
  infra/
    docker/
      docker-compose.yml
  docs/
    arquitetura/
    entregas/
    planejamento/
    processo/
    prompt-ops/
    visao-geral/
  spec/
    spec.md
    duvidas.md
```

Responsabilidades principais:

- `apps/web`: interface React, fluxos de busca, detalhe de empresa, status de analise e recomendacoes.
- `apps/api`: API Node.js, regras de negocio, orquestracao dos agentes, integracoes externas e persistencia.
- `apps/api/prisma`: schema do banco, migracoes e dados iniciais para demonstracao.
- `apps/api/src/modules`: modulos de negocio separados por responsabilidade.
- `apps/api/src/modules/valuation`: calculos deterministicos de valuation e premissas usadas.
- `apps/api/src/modules/agents`: chamadas para IA, prompts, validacao da resposta e fallback.
- `apps/api/src/modules/integrations`: adaptadores para APIs externas, mantendo o restante do backend desacoplado.
- `packages/shared`: tipos, DTOs e schemas compartilhados entre frontend e backend.
- `infra/docker`: configuracao local para subir PostgreSQL e dependencias de desenvolvimento.
- `docs`: documentos derivados da entrega parcial, separados por arquitetura, planejamento, processo e prompt ops.
- `spec`: documento-base consolidado e duvidas ainda nao resolvidas.

Essa estrutura reduz a quantidade de pacotes, mas ainda preserva separacao suficiente para o time dividir tarefas. `Assuncao`: se o grupo tiver pouco tempo, `packages/shared` pode ser criado apenas quando houver tipos duplicados entre frontend e backend.

### Componentes principais

- Frontend web: busca, detalhe da empresa, status de analise e visualizacao de recomendacao.
- API backend: recebe requisicoes do frontend, valida entrada, orquestra integracoes e consolida respostas.
- Camada de integracao: conecta APIs de mercado e provedores de IA.
- Camada de agentes: encapsula papeis de coleta, classificacao, valuation e recomendacao.
- Persistencia: armazena empresas, snapshots, pedidos de analise, resultados e perfis.

### Agentes do sistema

#### Agente de Coleta

- Entrada: identificador da empresa e parametros da analise.
- Saida: dados financeiros, historicos e metadados de origem.
- Dependencias: provedores de mercado e camada de persistencia.

#### Agente de Classificacao

- Entrada: empresa e dados consolidados.
- Saida: classificacoes relevantes, atributos da empresa e sinais para a tese.
- Dependencias: resultado do agente de coleta e provedor de IA.

#### Agente de Valuation

- Entrada: dados consolidados e classificacao da empresa.
- Saida: preco justo, sinalizacao de oportunidade e resumo do racional.
- Dependencias: regras financeiras, possivel apoio de IA e persistencia do resultado.

#### Regra inicial de valuation para o MVP

O MVP academico deve usar uma regra simples, reproduzivel e facil de explicar. A sugestao inicial e valuation por multiplo de lucro:

1. Obter `currentPrice`, `earningsPerShare` e setor da empresa.
2. Definir um `targetPeRatio` por setor ou por tabela fixa documentada.
3. Calcular `fairPrice = earningsPerShare * targetPeRatio`.
4. Calcular `upsidePct = (fairPrice - currentPrice) / currentPrice`.
5. Classificar confianca como `low`, `medium` ou `high` conforme completude dos dados.

Exemplo de tabela inicial de multiplos:

| Setor | `targetPeRatio` |
| --- | --- |
| Financeiro | 8 |
| Energia | 10 |
| Varejo | 12 |
| Tecnologia | 18 |
| Outro | 10 |

Se `currentPrice` ou `earningsPerShare` estiver ausente, o valuation deve retornar status `partial` e explicar a ausencia. A IA pode ajudar a redigir o racional, mas nao deve inventar numeros nem substituir o calculo.

#### Agente de Recomendacao

- Entrada: perfil do usuario, objetivo, classificacao e valuation.
- Saida: recomendacao contextualizada e proxima acao sugerida.
- Dependencias: resultado dos agentes anteriores e provedor de IA.

#### Regra inicial de recomendacao para o MVP

O sinal padronizado deve ser gerado por regra simples antes de qualquer texto da IA:

- `buy`: `upsidePct >= 0.15`, confianca `medium` ou `high` e perfil compativel com risco do ativo.
- `monitor`: `upsidePct` entre `-0.05` e `0.15`, ou confianca `low`, ou dados parcialmente completos.
- `avoid`: `upsidePct < -0.05`, dados criticos ausentes ou incompatibilidade clara com o perfil informado.

A IA deve transformar esse sinal em uma explicacao legivel, sempre respeitando o resultado calculado pela regra.

### Fluxo fim a fim

1. Frontend envia busca ou pedido de analise para a API.
2. API valida parametros e busca dados ja persistidos quando possivel.
3. Se necessario, a camada de integracao coleta dados externos.
4. O backend aciona agentes de classificacao e valuation.
5. O resultado consolidado e salvo no banco.
6. Quando houver perfil ou objetivo, o agente de recomendacao gera a saida final.
7. A API devolve dados estruturados para o frontend com status, rastreabilidade e mensagens de erro quando houver.

### Latencia, timeout e indisponibilidade

- Consultas simples devem ser sincronas quando os dados ja estiverem persistidos.
- No MVP academico, analises podem ser processadas de forma sincrona pelo backend e ainda assim persistir status.
- Analises completas podem evoluir para execucao assincrona com consulta posterior de status.
- Timeout de integracao externa deve gerar retentativa controlada e status parcial.
- Falha de modelo de IA nao deve apagar resultados ja coletados ou calculados por etapas anteriores.

## 8. Dados e API

### Modelo conceitual de entidades

| Entidade | Finalidade | Campos principais | Relacionamentos |
| --- | --- | --- | --- |
| `UserProfile` | Guardar contexto do usuario para recomendacao | `id`, `type`, `riskTolerance`, `objective`, `investmentHorizon` | 1:N com `Recommendation` |
| `Company` | Representar empresa listada | `id`, `ticker`, `name`, `sector`, `market` | 1:N com `FinancialSnapshot`, `HistoricalSeries`, `AnalysisRequest` |
| `FinancialSnapshot` | Guardar indicadores pontuais | `id`, `companyId`, `referenceDate`, `currentPrice`, `earningsPerShare`, `peRatio`, `revenue`, `ebitda`, `netIncome`, `debt`, `source` | N:1 com `Company` |
| `HistoricalSeries` | Guardar series historicas e dados para graficos | `id`, `companyId`, `metric`, `period`, `value`, `source` | N:1 com `Company` |
| `AnalysisRequest` | Registrar pedido e status da analise | `id`, `companyId`, `requestedBy`, `status`, `requestedAt` | N:1 com `Company`; 1:1 ou 1:N com `AnalysisResult` |
| `AnalysisResult` | Consolidar resultado analitico da empresa | `id`, `analysisRequestId`, `classificationSummary`, `confidenceLevel`, `generatedAt` | N:1 com `AnalysisRequest` |
| `ValuationResult` | Guardar resultado do valuation | `id`, `analysisResultId`, `fairPrice`, `upsidePct`, `targetPeRatio`, `method`, `rationaleSummary` | N:1 com `AnalysisResult` |
| `Recommendation` | Registrar recomendacao ao usuario | `id`, `analysisResultId`, `userProfileId`, `recommendationType`, `summary`, `nextAction` | N:1 com `AnalysisResult`; N:1 com `UserProfile` |

### Chaves e relacionamentos

- Chaves primarias: `id` em todas as entidades.
- Chaves estrangeiras: `companyId`, `analysisRequestId`, `analysisResultId`, `userProfileId`.
- Entidades diretamente ligadas ao uso de IA: `AnalysisResult`, `ValuationResult`, `Recommendation`.

### Endpoints iniciais

#### `GET /companies`

Objetivo: buscar empresas por nome, ticker ou setor.

Parametros:

- `query` obrigatorio.
- `sector` opcional.
- `limit` opcional.

Resposta resumida:

```json
{
  "items": [
    {
      "id": "cmp_123",
      "ticker": "BBAS3",
      "name": "Banco do Brasil",
      "sector": "Financeiro"
    }
  ]
}
```

#### `GET /companies/:companyId`

Objetivo: retornar detalhe da empresa e indicadores disponiveis.

Resposta resumida:

```json
{
  "company": {
    "id": "cmp_123",
    "ticker": "BBAS3",
    "name": "Banco do Brasil",
    "sector": "Financeiro"
  },
  "financialSnapshot": {
    "referenceDate": "2026-03-31",
    "currentPrice": 28.5,
    "earningsPerShare": 4.06,
    "peRatio": 7.02,
    "revenue": 0,
    "netIncome": 0,
    "source": "provider-x"
  },
  "historicalSeries": []
}
```

#### `POST /analysis-requests`

Objetivo: criar um pedido de analise.

Requisicao resumida:

```json
{
  "companyId": "cmp_123",
  "userProfileId": "usr_001",
  "objective": "renda de longo prazo"
}
```

Resposta resumida:

```json
{
  "id": "anr_001",
  "status": "queued"
}
```

#### `GET /analysis-requests/:analysisRequestId`

Objetivo: consultar status e resultado consolidado da analise.

Resposta resumida:

```json
{
  "id": "anr_001",
  "status": "completed",
  "analysisResult": {
    "classificationSummary": "empresa madura e geradora de caixa",
    "confidenceLevel": "medium"
  },
  "valuationResult": {
    "fairPrice": 32.5,
    "upsidePct": 0.14,
    "assumptions": {
      "method": "earnings_multiple",
      "targetPeRatio": 8
    }
  }
}
```

#### `POST /recommendations`

Objetivo: gerar recomendacao contextualizada com base em analise pronta.

Requisicao resumida:

```json
{
  "analysisRequestId": "anr_001",
  "userProfileId": "usr_001",
  "objective": "crescimento com risco moderado"
}
```

Resposta resumida:

```json
{
  "recommendationType": "monitor",
  "summary": "ativo com fundamentos consistentes e upside moderado",
  "nextAction": "acompanhar proximo resultado trimestral"
}
```

### Regras iniciais de validacao

- `query` nao pode ser vazio na busca de empresas.
- `companyId` deve existir antes da criacao de uma analise.
- recomendacao personalizada exige `userProfileId` ou `objective`.
- respostas de agentes devem conter campos minimos obrigatorios antes de serem marcadas como concluidas.

### Enums iniciais recomendados

Status de `AnalysisRequest`:

- `queued`: pedido criado, ainda nao processado.
- `processing`: agentes ou regras em execucao.
- `partial`: parte da analise foi concluida, mas houve falha em alguma etapa.
- `completed`: analise concluida com campos obrigatorios preenchidos.
- `failed`: analise nao pode ser concluida.

Nivel de confianca:

- `low`: dados insuficientes, resposta parcial ou premissas fracas.
- `medium`: dados principais presentes, mas com alguma limitacao.
- `high`: dados principais presentes, consistentes e com racional verificavel.

Tipo de recomendacao:

- `buy`: ativo parece atrativo conforme perfil e premissas.
- `monitor`: ativo deve ser acompanhado antes de decisao.
- `avoid`: ativo nao esta alinhado ao perfil, risco ou premissas atuais.

### Formato padrao de erro

```json
{
  "error": {
    "code": "COMPANY_NOT_FOUND",
    "message": "Empresa nao encontrada para o identificador informado.",
    "details": {
      "companyId": "cmp_invalido"
    }
  }
}
```

### Exemplo de fluxo completo

1. Usuario busca `BBAS3` em `GET /companies?query=BBAS3`.
2. Sistema retorna a empresa e o usuario abre `GET /companies/:companyId`.
3. Usuario solicita analise via `POST /analysis-requests`.
4. Backend cria `AnalysisRequest`, coleta dados, classifica a empresa e calcula valuation.
5. Usuario consulta `GET /analysis-requests/:analysisRequestId` ate o status ser `completed`.
6. Usuario pede recomendacao em `POST /recommendations`.
7. Sistema devolve recomendacao com resumo, proxima acao e referencia ao contexto analisado.

## 9. Guia de implementacao para equipe estudante

### Sequencia recomendada de desenvolvimento

#### Fase 1 - Base do projeto

Objetivo: deixar o repositorio pronto para o time trabalhar.

Entregas:

- Criar `apps/web`, `apps/api`, `packages/shared`, `infra/docker` e pastas de documentacao.
- Configurar `TypeScript`, lint basico e scripts de desenvolvimento.
- Subir `PostgreSQL` local com `docker-compose`.
- Criar schema inicial do Prisma e seed com empresas.

#### Fase 2 - API e banco com dados locais

Objetivo: validar o backend sem depender de integracoes externas.

Entregas:

- Implementar `GET /companies`.
- Implementar `GET /companies/:companyId`.
- Criar entidades `Company`, `FinancialSnapshot` e `HistoricalSeries`.
- Popular o banco com 5 a 10 empresas conhecidas e dados suficientes para demonstracao.

#### Fase 3 - Frontend funcional

Objetivo: entregar o primeiro fluxo visivel para apresentacao.

Entregas:

- Tela de busca por nome ou ticker.
- Lista de resultados.
- Tela de detalhe da empresa.
- Grafico simples de historico.
- Indicacao de fonte e data dos dados.

#### Fase 4 - Analise e valuation deterministico

Objetivo: provar a logica principal antes da IA.

Entregas:

- Implementar `POST /analysis-requests`.
- Implementar `GET /analysis-requests/:analysisRequestId`.
- Criar valuation simplificado com premissas documentadas.
- Salvar `AnalysisRequest`, `AnalysisResult` e `ValuationResult`.
- Retornar status `completed`, `partial` ou `failed`.

#### Fase 5 - Integracao com IA

Objetivo: adicionar valor de IA sem comprometer o fluxo principal.

Entregas:

- Criar adaptador unico para o provedor de IA.
- Criar prompt de classificacao e recomendacao.
- Validar se a resposta da IA possui campos obrigatorios.
- Criar fallback por regra quando a IA falhar.
- Registrar prompt, entrada resumida, saida e problemas encontrados em `docs/prompt-ops/`.

#### Fase 6 - Refinamento e apresentacao

Objetivo: preparar uma entrega estavel, explicavel e demonstravel.

Entregas:

- Melhorar mensagens de erro e estados de carregamento.
- Revisar documentacao de arquitetura, API, banco e processo.
- Preparar roteiro de demonstracao do fluxo completo.
- Registrar limitacoes conhecidas e proximos passos.

### Divisao sugerida de responsabilidades

- Frontend: telas, navegacao, componentes, graficos e consumo da API.
- Backend: endpoints, validacao, regras de negocio e orquestracao.
- Banco e dados: Prisma, schema, migracoes, seeds e consistencia dos indicadores.
- IA e prompts: adaptador do provedor, prompts, validacao de respostas e fallback.
- Documentacao e QA: checklist da entrega, testes manuais, relato do processo e organizacao dos documentos.

### Criterios de pronto do MVP

O MVP pode ser considerado pronto para apresentacao quando:

- O projeto roda localmente com comandos documentados.
- Existe pelo menos uma empresa pesquisavel do inicio ao fim do fluxo.
- A tela de detalhe mostra indicadores, historico, fonte e data.
- Uma analise pode ser criada, consultada e persistida.
- O valuation mostra preco justo, premissas, upside e nivel de confianca.
- A recomendacao deixa claro o perfil ou objetivo considerado.
- Erros comuns possuem mensagem compreensivel no frontend.
- O documento de prompt ops registra pelo menos os prompts usados na IA.

## 10. Riscos, falhas e duvidas

### Riscos e falhas esperados

- Integracoes de mercado podem retornar dados desatualizados, divergentes ou incompletos.
- Modelos de IA podem responder com linguagem convincente, mas com justificativa insuficiente.
- Valuation pode aparentar precisao excessiva se nao houver exposicao clara de premissas e limites.
- O custo por consulta pode crescer rapidamente se o fluxo depender de chamadas de IA em toda interacao.
- Latencia externa pode comprometer a experiencia se o sistema nao separar consulta simples de analise pesada.

### Tratamento esperado

- Validar formato, presenca e consistencia minima dos dados antes de acionar agentes posteriores.
- Registrar falhas por etapa e retornar status `partial` ou `failed` quando necessario.
- Preservar resultados validos de etapas anteriores mesmo quando uma etapa posterior falhar.
- Exibir mensagens claras para ausencia de dados, timeout, limite de requisicao e recomendacao parcial.

### Duvidas em aberto

- Qual conjunto minimo de indicadores financeiros deve ser obrigatorio na tela inicial de detalhe?
- Qual tabela de multiplos por setor sera usada no valuation simplificado?
- Quais limites de `upsidePct` serao usados para mapear recomendacao em `buy`, `monitor` ou `avoid`?
- O perfil do usuario sera explicitamente cadastrado ou inferido a partir de perguntas no fluxo?

### Proximos refinamentos recomendados

- Quebrar este documento em backlog, API, dados e visao arquitetural quando o repositorio de implementacao estiver mais estavel.
- Resolver as duvidas em aberto antes de fechar contratos definitivos de API.
- Acrescentar entrevistas, validacoes externas e repositorio de prompts em documentos dedicados.
