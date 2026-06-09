# Integracoes de IA e Engenharia de Prompt

## 1.2 Documentacao de Integracoes de IA e Engenharia de Prompt

Esta documentacao descreve as APIs de IA usadas no projeto, o contexto em que elas entram no fluxo do InvestAI e os prompts que sustentam o core da aplicacao.

## APIs de IA utilizadas

### OpenRouter

O projeto usa o OpenRouter como camada de acesso aos modelos generativos. A integracao esta centralizada em `apps/api/src/modules/agents/openrouter.ts`.

Responsabilidades dessa camada:

- fazer a chamada HTTP para `https://openrouter.ai/api/v1/chat/completions`;
- enviar a `OPENROUTER_API_KEY` via header `Authorization`;
- selecionar o modelo definido em `OPENROUTER_MODEL`;
- solicitar resposta em formato JSON com `response_format: { type: "json_object" }`;
- aplicar timeout configuravel por `OPENROUTER_TIMEOUT_MS`;
- retornar `null` quando a IA falha, quando a chave nao existe ou quando a resposta vem invalida.

## Contexto de uso da IA no produto

A IA nao e usada como fonte unica de verdade para dados numericos. Ela entra em tres pontos principais:

- classificar a empresa com base no snapshot, setor e resultado do valuation;
- gerar texto final de recomendacao com linguagem mais natural;
- apoiar o produto sem impedir o fluxo quando a resposta generativa falha.

O core numerico continua em codigo deterministico:

- o valuation e calculado em `apps/api/src/modules/valuation/valuation.ts`;
- as regras de decisao da recomendacao ficam em `apps/api/src/modules/recommendations/recommendation-rules.ts`;
- a IA apenas refina a redacao e a interpretacao do resultado.

## Prompts que sustentam o core da aplicacao

### Prompt de classificacao

Arquivo: `apps/api/src/modules/agents/classification-agent.ts`

Comportamento:

- o system prompt pede resposta apenas em JSON valido;
- a resposta deve conter exatamente `classificationSummary` e `confidenceLevel`;
- o campo `confidenceLevel` deve ser `low`, `medium` ou `high`;
- a resposta nao pode conter texto extra, Markdown ou explicacoes fora do JSON;
- o input enviado para a IA contem empresa, setor e resultado do valuation.

Esse agente existe para transformar dados estruturados em um resumo curto e rastreavel da situacao da empresa. Se a resposta nao respeita o schema, o projeto cai para o fallback local.

### Prompt de recomendacao

Arquivo: `apps/api/src/modules/agents/recommendation-agent.ts`

Comportamento:

- o system prompt pede somente um JSON valido com `summary` e `nextAction`;
- a resposta deve ser em portugues brasileiro;
- o prompt reforca que a IA nao pode inventar numeros nem alterar o sinal da recomendacao;
- o input enviado inclui sinal da recomendacao, objetivo do usuario, nivel de confianca e contexto do valuation.

Esse agente existe para converter a decisao ja tomada pelas regras do sistema em uma resposta util para o usuario.

## Validacao e fallback

Os dois agentes usam validacao com `zod` antes de aceitar a resposta.

Se a resposta vier fora do formato esperado:

- a classificacao usa `fallbackClassification`;
- a recomendacao usa `fallbackRecommendationText`;
- o sistema continua funcional sem travar o fluxo do usuario.

Esse desenho evita que falhas de modelo interrompam a experiencia principal.

## Processo para obter a API key do OpenRouter

1. Acesse `https://openrouter.ai` e crie ou entre na sua conta.
2. Abra a area de API keys da plataforma.
3. Gere uma nova chave de acesso.
4. Copie a chave assim que ela for exibida, porque normalmente ela aparece completa apenas uma vez.
5. No arquivo `.env` da raiz do projeto, adicione a variavel:

```env
OPENROUTER_API_KEY=cole_sua_chave_aqui
```

6. Opcionalmente, ajuste o modelo usado pela aplicacao com:

```env
OPENROUTER_MODEL=nex-agi/nex-n2-pro:free
```

7. Se necessario, altere o tempo limite da chamada com:

```env
OPENROUTER_TIMEOUT_MS=8000
```

8. Nao commite a chave no repositório.
9. Se a chave estiver ausente, a aplicacao continua funcionando com fallback local.

## Boas praticas de prompt

- manter as saidas curtas e estruturadas;
- exigir JSON quando o backend precisa fazer parse da resposta;
- descrever explicitamente o que nao pode mudar, como sinais numericos e campos obrigatorios;
- validar sempre a saida antes de persistir ou exibir ao usuario;
- preservar fallback local quando o modelo estiver indisponivel.

## Relacao com o fluxo do produto

A integracao de IA entra depois que os dados da empresa ja estao carregados e o valuation ja foi calculado. Isso garante que a IA trabalhe sobre dados persistidos e reduza o risco de inventar numeros.

Fluxo resumido:

1. Usuario consulta uma empresa.
2. A API carrega dados financeiros persistidos.
3. O valuation deterministico calcula preco justo e upside.
4. O agente de classificacao gera um resumo estruturado.
5. O agente de recomendacao gera a explicacao final.
6. Se a IA falhar, o fallback local mantém o produto util.

## Arquivos relacionados

- `apps/api/src/modules/agents/openrouter.ts`
- `apps/api/src/modules/agents/classification-agent.ts`
- `apps/api/src/modules/agents/recommendation-agent.ts`
- `apps/api/src/modules/recommendations/recommendation-rules.ts`
- `apps/api/src/modules/valuation/valuation.ts`
- `apps/api/src/config/env.ts`
