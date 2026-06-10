# Repositório de Prompts

## 1.4. Versão final do repositório de prompts com rastreabilidade de alterações

O desenvolvimento do InvestAI foi conduzido por meio de uma sequência de prompts que orientaram a construção da arquitetura da aplicação, a integração com IA, as regras de valuation, os mecanismos de recomendação e a validação das respostas geradas pelo modelo.

A seguir estão os principais prompts utilizados durante o processo. O repositório foi organizado de forma que as modificações possam ser verificadas pelo histórico do Git, pelos arquivos de documentação e pela associação direta entre cada prompt e o componente que o consome.

### Prompt 01 — Arquitetura Inicial do Projeto

Crie a estrutura inicial do InvestAI com backend em TypeScript, separando de forma clara a camada de API, a camada compartilhada e a interface web.

O projeto deve manter o core numérico determinístico e evitar que a IA seja usada como fonte única de verdade para dados financeiros.

Organize a aplicação de forma que os módulos responsáveis por valuation, recomendações e agentes de IA fiquem desacoplados e sejam fáceis de validar separadamente.

### Prompt 02 — Valuation Determinístico

Desenvolva a camada de valuation do InvestAI com foco em previsibilidade, rastreabilidade e reprodução dos cálculos.

O cálculo de preço justo, upside e sinal de recomendação deve ser feito em código determinístico, sem depender de saída generativa.

Considere que os dados financeiros podem chegar incompletos e que o sistema deve continuar funcionando com fallback quando algum campo essencial não estiver disponível.

### Prompt 03 — Integração com OpenRouter

Implemente a integração com o OpenRouter como camada de acesso aos modelos generativos do projeto.

A integração deve enviar a chave de API por variável de ambiente, solicitar resposta em JSON quando necessário e retornar fallback local caso a API falhe, a chave esteja ausente ou a resposta venha em formato inválido.

### Prompt 04 — Prompt de Classificação

Crie um agente de classificação capaz de transformar o contexto da empresa em um resumo curto e rastreável.

O prompt deve exigir JSON válido, limitar a saída a campos fixos e evitar qualquer texto fora da estrutura esperada.

O contexto enviado para o modelo deve incluir empresa, setor e resultado do valuation, sem permitir que a IA altere os números calculados pelo core.

### Prompt 05 — Prompt de Recomendação

Crie um agente de recomendação para converter a decisão tomada pelas regras do sistema em uma explicação clara para o usuário.

O prompt deve responder em português brasileiro, manter o sinal da recomendação definido pelo sistema e evitar inventar números como preço justo ou upside.

Se a resposta vier fora do formato esperado, o sistema deve usar fallback local para preservar a experiência do usuário.

### Prompt 06 — Persistência e Dados Estruturados

Desenvolva a camada de persistência do InvestAI para armazenar dados financeiros, snapshots de empresa, resultados de valuation e saídas de classificação e recomendação.

A solução deve priorizar consistência, leitura previsível e facilidade de auditoria dos dados persistidos.

### Prompt 07 — Validação e Fallback

Implemente validação das respostas geradas pela IA antes que elas sejam exibidas ou persistidas.

O sistema deve verificar se a saída respeita o schema esperado, se os campos obrigatórios estão presentes e se o conteúdo não contradiz os valores calculados pelo core determinístico.

Quando a resposta não puder ser validada, o fluxo deve continuar com fallback local.

### Prompt 08 — Otimização e Robustez

Realize uma revisão do fluxo de IA com foco em robustez, desempenho e confiabilidade.

Analise principalmente o tempo de resposta do modelo, o custo de validação, o comportamento do fallback e o impacto da IA no fluxo principal do produto.

## 1.5. Exemplos de prompts que falharam

Durante o desenvolvimento, alguns prompts não produziram resultados satisfatórios na primeira tentativa e precisaram de refinamento humano. Isso ocorreu principalmente em cenários que exigiam maior precisão na estrutura da resposta, respeito ao core determinístico e validação explícita do output.

Os exemplos a seguir mostram como a engenharia de prompts foi ajustada para obter respostas mais adequadas ao contexto do projeto.

### Exemplo 1: Classificação sem saída estruturada

Prompt inicial: "Resuma a situação da empresa com base no valuation."

Limitação identificada:

A resposta gerada veio em texto livre, com resumo e observações misturados, o que dificultava o parse no backend e impedia a validação automática do schema.

Refinamento aplicado:

O prompt foi ajustado para exigir JSON estrito, com campos fixos, sem Markdown e sem qualquer texto fora da estrutura esperada.

Como a equipe validou o output:

- validação com schema antes de aceitar a resposta;
- testes com casos conhecidos para confirmar a presença dos campos obrigatórios;
- uso de fallback local quando o JSON vinha fora do padrão.

### Exemplo 2: Recomendação alterando números do core

Prompt inicial: "Explique a recomendação final para o usuário."

Limitação identificada:

A IA tentava alterar o sinal da recomendação e, em alguns casos, inventava valores para preço justo ou upside, gerando conflito com o cálculo determinístico do sistema.

Refinamento aplicado:

O prompt passou a proibir explicitamente qualquer alteração nos números calculados pelo core e a restringir a resposta a um resumo em português brasileiro, deixando claro que a IA não poderia redefinir a decisão tomada pelas regras do sistema.

Como a equipe validou o output:

- comparação da resposta da IA com os valores calculados pelo valuation;
- teste de regressão para casos em que o sinal não podia mudar;
- uso de fallback local quando a saída divergente era detectada.

### Exemplo 3: Resposta generativa sem respeito ao contexto da aplicação

Prompt inicial: "Explique a empresa e dê uma visão geral do caso."

Limitação identificada:

A resposta ficou genérica demais e não aproveitou o contexto real do InvestAI, ignorando os dados persistidos, o setor da empresa e o resultado do valuation.

Refinamento aplicado:

O prompt foi reescrito para incluir o contexto da empresa, o sinal da recomendação, o nível de confiança e a regra de não inventar dados numéricos.

Como a equipe validou o output:

- conferência manual com o contexto enviado ao modelo;
- checagem de aderência ao schema esperado;
- verificação de que a resposta estava alinhada ao valuation e às regras do sistema.

Esses exemplos evidenciam que a qualidade da IA depende diretamente da precisão dos prompts fornecidos. No InvestAI, a validação humana foi essencial para garantir que a IA atuasse como camada de apoio, sem comprometer a confiabilidade do fluxo principal.
