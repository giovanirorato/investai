# GDE — validação de engenharia de 21/08/2026

## Escopo

Esta validação cobre somente o **núcleo de engenharia do G Dividendos Evolutivo v1.0**:

- contratos point-in-time;
- normalização de dividendos;
- filtros eliminatórios e quarentena;
- pontuação e ranking;
- construção inicial da carteira;
- revisão de posições existentes;
- auditoria de snapshots;
- cálculo das métricas de backtest;
- governança champion/challenger;
- contratos falsificáveis e rollback.

Ela **não** valida desempenho financeiro real, superioridade sobre benchmarks nem recomendações de compra ou venda.

## Contrato falsificável desta etapa

**Problema identificado:** a metodologia existia como especificação, mas ainda não possuía contratos executáveis, testes automatizados nem uma fronteira clara entre dados, decisão e evolução.

**Componente alterado:** contratos, motor de decisão, métricas, validação e governança de evolução.

**Hipótese:** um núcleo determinístico e isolado permitirá reproduzir decisões, detectar look-ahead, impedir imputação favorável de dados ausentes e testar challengers sem alterar diretamente a carteira real.

**Mudança aplicada:** implementação dos módulos GDE, seus contratos compartilhados, testes unitários, documentação e workflow de CI.

**Resultado esperado:** typecheck, build, validação Prisma e todos os testes aprovados; falhas de dados devem produzir rejeição, quarentena, revisão ou aviso explícito, nunca aprovação silenciosa.

**Risco de regressão:** complexidade excessiva, alteração acidental de comportamento existente, falsa sensação de que testes sintéticos equivalem a backtest financeiro real ou introdução de regras difíceis de auditar.

**Janela de validação:** execução integral da CI no merge ref do PR e revisão da lista de arquivos modificados.

**Decisão posterior:** manter o núcleo em PR rascunho e avançar para dados reais; não promover a metodologia para uso financeiro até concluir a ingestão point-in-time e o backtest fora da amostra.

## Evidências executadas

GitHub Actions, execução `32506517316`:

| Verificação | Resultado |
|---|---|
| Instalação reproduzível com `npm ci` | Aprovada |
| Geração do Prisma Client | Aprovada |
| Typecheck de shared, API e web | Aprovado |
| Build de shared, API e web | Aprovado |
| Validação do schema Prisma | Aprovada |
| Testes automatizados | 10 arquivos e 45 testes aprovados |
| Testes diretamente relacionados ao GDE | 31 aprovados |

Arquivos de teste do GDE:

- `gde-backtest.test.ts`: 5 testes;
- `gde-contracts.test.ts`: 4 testes;
- `gde-engine.test.ts`: 7 testes;
- `gde-evolution.test.ts`: 5 testes;
- `gde-holding-review.test.ts`: 7 testes;
- `gde-snapshot-audit.test.ts`: 3 testes.

## Falha encontrada e correção

A primeira execução da CI falhou em duas expectativas antigas de `packages/shared/tests/contracts.test.ts`:

1. o teste esperava rejeição de busca vazia;
2. o teste esperava limite padrão de 10 resultados.

O comportamento já implementado da aplicação era diferente:

- a tela inicial chama a busca com string vazia para carregar a lista de empresas;
- o contrato atual usa limite padrão de 50.

A correção foi cirúrgica: somente as expectativas antigas foram alinhadas ao contrato e à interface existentes. A API e o comportamento do produto não foram alterados. A segunda execução da CI aprovou todos os 45 testes.

## Invariantes confirmados por testes

- informações financeiras ou de mercado posteriores à data de decisão são rejeitadas;
- risco grave de governança fica em quarentena e não recebe nota;
- alto yield não compensa segurança e qualidade fracas;
- métricas ausentes reduzem cobertura, sem imputação favorável;
- a carteira respeita limite setorial e mantém saldo em caixa quando faltam empresas elegíveis;
- posições existentes usam zona de manutenção mais ampla do que a zona de entrada;
- a primeira falha ordinária gera observação e a segunda consecutiva gera revisão de saída;
- insolvência, dividendo financiado por dívida e falhas prudenciais geram revisão urgente;
- inconsistência de dados gera revisão de dados, não decisão financeira;
- drawdown patrimonial usa índice de riqueza ajustado a aportes e retiradas;
- séries mensais com datas inválidas, ordem incorreta ou meses ausentes são rejeitadas;
- challenger só é promovido quando cumpre o objetivo primário e todos os guardrails;
- regressões materiais geram rollback.

## Limitações abertas

### Bloqueio principal

Os arquivos abaixo ainda não foram mapeados porque o ambiente local retornou `ClientResponseError` em todas as tentativas de acesso ao container, e a busca de arquivos não os disponibilizou como planilhas navegáveis:

- `posicao-2026-04-04-18-46-26.xlsx`;
- `posicao-2026-04-19-09-58-32.xlsx`.

Consequentemente, ainda não existem nesta etapa:

- reconciliação real das posições;
- pesos reais por ativo e classe;
- concentração real de patrimônio e renda;
- classificação real de ativos;
- backtest histórico do champion;
- comparação com benchmarks;
- recomendação de compra, venda ou rebalanceamento.

### Avisos técnicos não atribuídos ao GDE

A CI também revelou avisos preexistentes do repositório:

- `npm audit` reportou 16 vulnerabilidades nas dependências, sendo 2 críticas;
- o build web gerou aviso de chunk superior a 500 kB;
- `actions/checkout@v4` e `actions/setup-node@v4` receberam aviso de migração de runtime do GitHub Actions.

Esses pontos não foram corrigidos nesta mudança para evitar refatoração ou atualização de dependências fora do escopo. Devem ser tratados em ciclo técnico separado, com seus próprios testes e rollback.

## Decisão

**Manter em observação controlada.**

O núcleo de engenharia está aprovado para servir como base da próxima fase. A metodologia financeira ainda não está aprovada para orientar capital real porque não passou por:

1. ingestão e reconciliação dos snapshots reais;
2. coleta histórica point-in-time;
3. backtest com empresas deslistadas e custos;
4. validação walk-forward;
5. testes de robustez e bootstrap em blocos;
6. carteira-sombra.

## Próxima verificação

A próxima decisão será tomada quando o snapshot de 19/04/2026 estiver importado e auditado. O critério mínimo para avançar ao backtest histórico será:

- 100% das posições identificadas ou explicitamente classificadas como pendentes;
- nenhum símbolo duplicado sem justificativa;
- valor de mercado reconciliado dentro da tolerância definida;
- separação correta entre ações brasileiras, FIIs, renda fixa, internacional, cripto/alternativos e caixa;
- trilha de origem preservada por arquivo e linha.
