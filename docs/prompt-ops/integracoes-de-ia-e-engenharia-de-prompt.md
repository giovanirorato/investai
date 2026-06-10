# Integracoes de IA e Engenharia de Prompt

## 1.2 Documentacao de Integracoes de IA e Engenharia de Prompt

Este documento resume como a camada de IA e a engenharia de prompts se encaixam no fluxo do InvestAI. O objetivo nao e substituir a logica deterministica do produto, mas complementar a experiencia com classificacao, explicacao e linguagem natural sem comprometer a rastreabilidade dos resultados.

## Visao geral da integracao

A IA no InvestAI e tratada como uma camada de apoio. Ela entra depois que os dados financeiros ja foram carregados e o valuation ja foi calculado em codigo.

Isso significa que:

- os numeros continuam vindo do core deterministico;
- a IA nao define preco justo, upside ou sinal de recomendacao;
- o modelo apenas interpreta, resume e apresenta o resultado com mais clareza;
- quando a IA falha, o fluxo continua com fallback local.

## Camada de acesso ao modelo

A integracao com o provedor generativo esta centralizada em `apps/api/src/modules/agents/openrouter.ts`.

Responsabilidades dessa camada:

- fazer a chamada HTTP para `https://openrouter.ai/api/v1/chat/completions`;
- enviar a `OPENROUTER_API_KEY` no header `Authorization`;
- selecionar o modelo definido em `OPENROUTER_MODEL`;
- solicitar resposta em JSON com `response_format: { type: "json_object" }`;
- aplicar timeout configuravel por `OPENROUTER_TIMEOUT_MS`;
- retornar `null` quando a chave estiver ausente, a resposta vier invalida ou a API falhar.

## Prompts que sustentam o core da aplicacao

### Prompt de classificacao

Arquivo: `apps/api/src/modules/agents/classification-agent.ts`

Este prompt transforma o contexto da empresa em um resumo curto e rastreavel. A resposta precisa ser estritamente estruturada para facilitar validacao e uso pelo backend.

Regras principais do prompt:

- responder apenas com JSON valido;
- retornar exatamente `classificationSummary` e `confidenceLevel`;
- limitar `confidenceLevel` a `low`, `medium` ou `high`;
- nao incluir Markdown, comentarios ou texto extra;
- considerar apenas empresa, setor e resultado do valuation enviados na entrada.

Esse agente existe para padronizar a leitura do caso e reduzir variacoes de linguagem sem abrir mao da verificacao do backend.

### Prompt de recomendacao

Arquivo: `apps/api/src/modules/agents/recommendation-agent.ts`

Este prompt pega a decisao ja calculada pelas regras do sistema e a converte em uma resposta util para o usuario final.

Regras principais do prompt:

- responder apenas com JSON valido;
- retornar exatamente `summary` e `nextAction`;
- escrever em portugues brasileiro;
- nao inventar numeros nem alterar o sinal da recomendacao;
- usar como contexto o sinal da recomendacao, o objetivo do usuario, o nivel de confianca e o resultado do valuation.

O papel desse agente e melhorar a comunicacao, nao redefinir a logica de negocio.

## Validacao e fallback

Os dois agentes usam validacao com `zod` antes de aceitar a resposta.

Se a saida vier fora do formato esperado:

- a classificacao usa `fallbackClassification`;
- a recomendacao usa `fallbackRecommendationText`;
- o sistema continua funcional sem travar a experiencia do usuario.

Esse desenho reduz o impacto de respostas inconsistentes e mantem o produto util mesmo quando o modelo externo falha.

## Prompts ideais para evolucao futura do core

Para evolucoes futuras, vale manter a mesma logica: prompt curto, objetivo, com saida estruturada e limites claros do que a IA pode ou nao alterar.

### Prompt 1: Analise de divergencia de dados

Objetivo: detectar divergencias entre fontes financeiras, dados persistidos e resultado do valuation.

A saida ideal deve:

1. indicar onde a divergencia aparece;
2. apontar qual fonte ou etapa pode ter causado o desvio;
3. explicar o impacto potencial sobre preco justo e upside;
4. sugerir a menor correcao possivel para normalizar os dados.

### Prompt 2: Contexto de mercado e setor

Objetivo: identificar se variacoes de setor, segmento ou ambiente macro podem justificar mudancas no resumo final.

A saida ideal deve:

1. agrupar o caso por setor, segmento ou perfil da empresa;
2. destacar padroes anormais ou mudancas relevantes;
3. sugerir hipoteses explicaveis com base nos dados disponiveis;
4. recomendar testes ou verificacoes para validar a leitura.

### Prompt 3: Auto-healing e sugestao de ajuste

Objetivo: gerar uma sugestao de correcao quando a analise identificar que o problema esta no prompt, na regra ou no formato de saida.

A saida ideal deve:

1. propor uma sugestao objetiva de ajuste;
2. explicar rapidamente a logica da alteracao;
3. preservar compatibilidade com o fluxo atual;
4. quando necessario, sugerir refatoracao de prompt ou regra.

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

8. Nao commite a chave no repositorio.
9. Se a chave estiver ausente, a aplicacao continua funcionando com fallback local.

## Guia rapido de implantacao

Para facilitar o uso do projeto em outros ambientes, o fluxo minimo de configuracao e este:

1. configurar as variaveis sensiveis no `.env`;
2. garantir que a chave do OpenRouter nao entre no controle de versao;
3. validar que o modelo e o timeout estao corretos para o ambiente;
4. confirmar que os agentes continuam operando com fallback quando a IA nao responde.

## Boas praticas de prompt

- manter as saidas curtas e estruturadas;
- exigir JSON quando o backend precisa fazer parse da resposta;
- descrever claramente o que nao pode mudar, como sinais numericos e campos obrigatorios;
- validar sempre a saida antes de persistir ou exibir ao usuario;
- preservar fallback local quando o modelo estiver indisponivel.

## Relacao com o fluxo do produto

A integracao de IA entra depois que os dados da empresa ja estao carregados e o valuation ja foi calculado. Isso garante que a IA trabalhe sobre dados persistidos e reduza o risco de inventar numeros.

Fluxo resumido:

1. O usuario consulta uma empresa.
2. A API carrega os dados financeiros persistidos.
3. O valuation deterministico calcula preco justo e upside.
4. O agente de classificacao gera um resumo estruturado.
5. O agente de recomendacao gera a explicacao final.
6. Se a IA falhar, o fallback local mantem o produto util.

## Arquivos relacionados

- `apps/api/src/modules/agents/openrouter.ts`
- `apps/api/src/modules/agents/classification-agent.ts`
- `apps/api/src/modules/agents/recommendation-agent.ts`
- `apps/api/src/modules/recommendations/recommendation-rules.ts`
- `apps/api/src/modules/valuation/valuation.ts`
- `apps/api/src/config/env.ts`
