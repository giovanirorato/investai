# GDE — contrato e calculador de backtest

## Finalidade

Este documento define como o GDE transforma uma série histórica mensal em métricas comparáveis entre o champion e um challenger. O calculador é determinístico: não usa LLM, não estima dados ausentes e não altera parâmetros durante a avaliação.

Arquivo principal:

`apps/api/src/modules/gde/gde-backtest.ts`

Contrato de entrada:

`packages/shared/src/contracts/gde-backtest.ts`

## Observação mensal

Cada observação contém:

| Campo | Uso |
|---|---|
| `date` | ordenação e horizonte da série |
| `netDividendIncome` | renda de dividendos e JCP após custos e impostos aplicáveis |
| `cpiIndex` | deflator da renda, exposição e índice de riqueza |
| `portfolioMarketValue` | exposição monetária usada no denominador do giro |
| `wealthIndexLevel` | índice de riqueza ajustado a aportes e retiradas, usado no drawdown patrimonial |
| `tradedNotional` | volume financeiro comprado e vendido no período |

`portfolioMarketValue` e `wealthIndexLevel` não são equivalentes.

O valor de mercado pode aumentar por aporte, mas isso não representa retorno. Por isso, drawdown patrimonial usa um índice de riqueza previamente ajustado aos fluxos externos. O coletor ou simulador deve construir esse índice antes de chamar o calculador.

## Renda real de 12 meses

Para cada mês a partir da 12ª observação:

```text
renda real mensal = renda líquida nominal / índice de preços do mês
renda real 12m = soma das 12 rendas reais mensais mais recentes
```

O valor fica expresso em unidades reais do índice de preços. O crescimento e o drawdown não dependem da escala escolhida para o índice.

## CAGR da renda real

```text
CAGR = (renda real 12m final / renda real 12m inicial)^(12 / meses) - 1
```

Se a renda inicial ou final não for positiva, o calculador retorna zero e registra `real_income_cagr_unavailable`. O resultado não deve ser interpretado como crescimento zero; ele indica métrica indisponível.

## Drawdown da renda

Para cada ponto da série de renda real de 12 meses:

```text
drawdown = (pico anterior - valor atual) / pico anterior
```

A métrica reportada é o maior drawdown observado.

## Drawdown patrimonial real

```text
índice de riqueza real = wealthIndexLevel / cpiIndex
```

O maior drawdown dessa série é o `wealthDrawdown`.

A construção do `wealthIndexLevel` deve neutralizar aportes e retiradas. Caso contrário, a métrica mistura decisão de investimento com fluxo de caixa do investidor.

## Giro anualizado

```text
notional real negociado = soma(tradedNotional / cpiIndex)
exposição real média = média(portfolioMarketValue / cpiIndex)
giro bruto do período = notional real negociado / exposição real média
giro anualizado = giro bruto × 12 / quantidade de observações mensais
```

Se não houver exposição positiva, a métrica retorna zero com o aviso `turnover_unavailable_without_portfolio_value`.

O simulador deve usar uma convenção estável para `tradedNotional`, preferencialmente a soma do menor valor entre compras e vendas ou outra regra documentada. A convenção escolhida não pode mudar entre champion e challenger.

## Taxa de falsos positivos

```text
taxa = empresas selecionadas que deterioraram / seleções avaliadas
```

A definição operacional do GDE considera falso positivo, em até 24 meses, uma empresa selecionada que:

- corta materialmente o dividendo normalizado;
- passa a descumprir filtro eliminatório; ou
- exige saída por deterioração fundamental.

Se nenhuma seleção puder ser avaliada, a métrica retorna zero com o aviso `false_positive_rate_unavailable`.

## Concentração da renda

A concentração usa o índice Herfindahl-Hirschman:

```text
HHI = soma(participação_i²)
```

O cálculo é realizado:

- por ticker;
- por setor, depois da agregação da renda dos tickers de cada setor.

HHI próximo de 1 indica dependência elevada. HHI menor indica renda distribuída entre mais fontes.

## Consistência das janelas

O contrato exige:

- ao menos 13 observações mensais;
- datas em ordem cronológica estrita;
- `falsePositiveCount <= evaluatedSelectionCount`;
- `windowsWon <= windowsTotal`;
- setor para todo ticker que contribui para a renda.

A quantidade mínima de 13 observações permite produzir dois pontos de renda de 12 meses, mas uma validação robusta precisa de horizontes muito maiores.

## O que o calculador não faz

O módulo não:

- coleta dados da CVM, B3, Banco Central ou IBGE;
- corrige sobrevivência ou look-ahead sozinho;
- calcula o índice de riqueza a partir de aportes;
- escolhe custos ou alíquotas;
- seleciona parâmetros;
- executa walk-forward;
- promove challengers automaticamente sem o módulo de governança.

Essas responsabilidades ficam nas camadas de coleta, simulação e evolução. A separação permite testar cada componente e reverter mudanças sem alterar toda a estratégia.

## Verificação

Os testes sintéticos em `apps/api/tests/gde-backtest.test.ts` verificam:

- crescimento real de renda;
- drawdown de renda;
- drawdown patrimonial ajustado a fluxos externos;
- giro anualizado;
- falsos positivos;
- HHI por empresa e setor;
- deflação;
- rejeição de ordem cronológica inválida;
- rejeição de renda sem setor correspondente.
