# Repositório de Prompts

## 1.4 Versão final do repositório de prompts com rastreabilidade de alterações

No InvestAI, o repositório de prompts precisa permitir auditoria completa das mudanças feitas ao longo do projeto. A versão final foi organizada para que cada ajuste possa ser rastreado no próprio código, no histórico do Git e nos arquivos de documentação do fluxo de IA.

A rastreabilidade é garantida por:

- commits com mensagem objetiva indicando o que mudou no prompt;
- pull requests ou revisões com descrição do motivo da alteração;
- documentação de apoio apontando o agente ou regra impactada;
- associação direta entre prompt e componente que o consome;
- testes e exemplos de entrada/saída para validar o comportamento esperado.

No projeto atual, os principais pontos de referência são:

- [apps/api/src/modules/agents/classification-agent.ts](../../apps/api/src/modules/agents/classification-agent.ts);
- [apps/api/src/modules/agents/recommendation-agent.ts](../../apps/api/src/modules/agents/recommendation-agent.ts);
- [apps/api/src/modules/agents/openrouter.ts](../../apps/api/src/modules/agents/openrouter.ts);
- [apps/api/src/modules/recommendations/recommendation-rules.ts](../../apps/api/src/modules/recommendations/recommendation-rules.ts);
- [docs/prompt-ops/integracoes-de-ia-e-engenharia-de-prompt.md](integracoes-de-ia-e-engenharia-de-prompt.md).

Assim, qualquer revisão futura consegue verificar o que foi ajustado, por que foi ajustado e qual foi o efeito prático no fluxo da IA.

## 1.5 Exemplos de prompts que falharam

### Exemplo 1: classificação sem JSON válido

Prompt inicial: "Resuma a situação da empresa com base no valuation."

Falha observada: a IA respondia em texto livre, misturando resumo, explicação e recomendação. Isso quebrava a leitura automática do backend e impedia a validação do schema.

Ajuste aplicado: o prompt passou a exigir JSON estrito, com campos fixos e sem texto fora da estrutura esperada.

Validação do output:

- validação com `zod` antes de aceitar a resposta;
- testes com casos conhecidos para confirmar a presença dos campos obrigatórios;
- fallback local quando o JSON vinha fora do padrão.

### Exemplo 2: recomendação alterando números do core

Prompt inicial: "Explique a recomendação final para o usuário."

Falha observada: a IA tentava alterar o sinal da recomendação e, em alguns casos, inventava valores para preço justo ou upside.

Ajuste aplicado: o prompt passou a proibir qualquer alteração nos números calculados pelo core determinístico e a limitar a resposta a um resumo em português brasileiro.

Validação do output:

- comparação da resposta da IA com os valores calculados em [apps/api/src/modules/valuation/valuation.ts](../../apps/api/src/modules/valuation/valuation.ts);
- teste de regressão para casos em que o sinal não podia mudar;
- uso de `fallbackRecommendationText` quando a saída divergente era detectada.

### Critério final de aceite

Antes de considerar um prompt pronto, a equipe verificava se a saída:

1. respeitava o schema esperado;
2. não alterava valores calculados pelo sistema;
3. mantinha o fluxo operando mesmo quando a IA falhava.

Esse processo garantiu que a IA atuasse como camada de apoio, sem comprometer a confiabilidade do InvestAI.
