# Planejamento do InvestAI

## Objetivo do plano

Organizar o desenvolvimento do MVP de forma que o fluxo principal ficasse funcional primeiro: buscar empresa, ver dados, rodar analise, calcular valuation e gerar recomendacao.

## Fases do projeto

### Fase 1 - Base tecnica

- Estruturar o monorepo com `apps/api`, `apps/web` e `packages/shared`.
- Definir a modelagem inicial no Prisma.
- Criar os contratos compartilhados entre frontend e backend.
- Preparar a documentacao base do produto e do projeto.

### Fase 2 - Dados e persistencia

- Criar o modelo de empresas, snapshots, historico e analises.
- Preparar a carga inicial via `seed` e importacao de fontes externas.
- Registrar status, data de coleta e fontes para manter rastreabilidade.

### Fase 3 - Fluxo de analise

- Expor endpoints para buscar empresas e consultar detalhes.
- Criar o endpoint de analise e persistir resultado da execucao.
- Implementar valuation deterministico com suporte a retorno parcial quando faltar dado.
- Criar a camada de classificacao e a geracao da recomendacao.

### Fase 4 - Interface

- Montar a tela principal com busca, lista, detalhe e acoes de analise.
- Exibir status da API, erros e retorno parcial de forma clara.
- Consumir os contratos compartilhados para evitar divergencia de formato.

### Fase 5 - Validacao

- Cobrir os calculos de valuation com testes.
- Cobrir as regras de recomendacao com testes.
- Validar schemas e contratos compartilhados.
- Revisar a documentacao de entrega e processo.

## O que ja foi feito

- API Express com rotas para healthcheck, empresas, analise e recomendacao.
- Frontend React com busca e painel unico de operacao.
- Contratos compartilhados para empresa, analise, recomendacao e erro.
- Schema Prisma com entidades do dominio e relacoes entre elas.
- Importacao de dados a partir de CSV e provedores externos.
- Valuation com regra deterministica baseada em P/L alvo por setor.
- Regras de recomendacao com fallback textual quando a IA nao entrega uma saida util.

## Prioridades que guiaram a execucao

1. Entregar um fluxo demonstravel ponta a ponta.
2. Garantir que os numeros pudessem ser auditados.
3. Evitar dependencia forte de IA para o funcionamento basico.
4. Manter o projeto simples o suficiente para manutencao por uma equipe academica.

## Proximos incrementos naturais

- Melhorar o volume e a qualidade dos dados carregados no banco.
- Ampliar a cobertura de testes para importacao e classificacao.
- Separar analise assincrona em etapas mais explicitas, se o fluxo crescer.
- Evoluir a interface com comparacao entre empresas e historico de analises.
