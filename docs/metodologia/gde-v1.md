# G Dividendos Evolutivo — GDE v1.0

## Objetivo

O GDE busca aumentar a renda passiva líquida e real ao longo do tempo, preservando o patrimônio e mantendo drawdown, concentração, giro, custos e complexidade dentro de limites verificáveis.

O sistema não seleciona simplesmente os maiores dividend yields. Ele prioriza:

1. segurança do dividendo;
2. qualidade do negócio;
3. persistência e crescimento real;
4. valuation;
5. liquidez e sinal de mercado com peso reduzido.

A regularidade mensal de renda deve ser produzida por gestão de caixa e reserva de distribuição, não pela escolha artificial de empresas segundo o mês de pagamento.

## Estado desta implementação

| Componente | Estado | Arquivo principal |
|---|---|---|
| Contrato point-in-time | Implementado | `packages/shared/src/contracts/gde.ts` |
| Contrato de snapshot da carteira | Implementado | `packages/shared/src/contracts/gde-snapshot.ts` |
| Auditoria de snapshot | Implementado | `apps/api/src/modules/gde/gde-snapshot-audit.ts` |
| Normalização de dividendos | Implementado | `apps/api/src/modules/gde/gde-engine.ts` |
| Filtros eliminatórios e quarentena | Implementado | `apps/api/src/modules/gde/gde-engine.ts` |
| Ranking setorial | Implementado | `apps/api/src/modules/gde/gde-engine.ts` |
| Construção da carteira | Implementado | `apps/api/src/modules/gde/gde-engine.ts` |
| Champion/challenger e rollback | Implementado | `apps/api/src/modules/gde/gde-evolution.ts` |
| Testes unitários | Escritos | `apps/api/tests/gde-*.test.ts` |
| Leitor do XLSX de posição | Pendente | fronteira de integração |
| Coleta histórica CVM/B3 point-in-time | Pendente | fronteira de integração |
| Backtest walk-forward completo | Pendente | próxima fase |
| Carteira-sombra e relatório periódico | Pendente | fase posterior ao backtest |

A ausência de dados históricos completos não é tratada como zero nem como resultado favorável. O motor expõe cobertura de métricas e mantém o capital não alocado em caixa quando o universo elegível é insuficiente.

## Invariantes

1. **Sem look-ahead:** `financialsPublishedAt` e `marketDataObservedAt` não podem ser posteriores a `asOfDate`.
2. **Sem números inventados:** métricas ausentes permanecem nulas e reduzem a cobertura da nota.
3. **Filtro antes da nota:** empresa rejeitada ou em quarentena não recebe pontuação.
4. **Uma classe por decisão econômica:** o universo deve eliminar duplicidade de classes antes do ranking final.
5. **Comparação coerente:** a nota usa percentis no setor quando há ao menos três pares; caso contrário, usa o mesmo modelo econômico e, por último, o universo elegível.
6. **Qualidade não é relaxada para completar a carteira:** o saldo permanece em liquidez quando não há empresas suficientes.
7. **Toda evolução é reversível:** nenhuma regra nova entra no champion sem contrato, teste fora da amostra e guardrails aprovados.

## Configuração champion inicial

A configuração `GDE-1.0.0` usa:

| Regra | Valor inicial |
|---|---:|
| Completude mínima de dados | 80% |
| Histórico mínimo | 5 anos |
| Histórico mínimo para cíclicas | 7 anos |
| Liquidez média diária mínima em 63 pregões | maior entre R$ 2 milhões e percentil 20 |
| Nota mínima de entrada | 70 |
| Nota mínima de manutenção | 55 |
| Posição máxima de manutenção no ranking | 30 |
| Quantidade-alvo | 15 empresas |
| Quantidade mínima | 12 empresas |
| Peso máximo por empresa | 8% |
| Peso máximo por setor | 25% |
| Participação máxima de uma empresa na renda | 12% |
| Participação máxima das cinco maiores fontes de renda | 45% |

Os valores são hipóteses iniciais. Eles não devem ser ajustados depois de observado o período reservado para teste.

## Contrato de dados point-in-time

Cada candidato contém, no mínimo:

- ticker, setor e modelo econômico;
- data da decisão;
- data efetiva de publicação das demonstrações;
- data efetiva de observação do preço e da liquidez;
- fontes utilizadas;
- completude dos dados;
- histórico disponível;
- liquidez em 63 pregões;
- indicadores de solvência, governança e recorrência;
- dados necessários para normalizar o dividendo;
- métricas de segurança, qualidade, persistência, valuation e mercado.

Os modelos econômicos suportados são:

- empresa não financeira;
- banco;
- seguradora;
- utility ou concessão;
- empresa cíclica.

A separação evita usar fluxo de caixa livre convencional para bancos ou tratar endividamento de uma seguradora como o de uma indústria.

## Dividendo normalizado

Para empresas em que fluxo de caixa livre é economicamente aplicável:

```text
DPS sustentável = mínimo de:
  mediana real do DPS recorrente
  payout máximo × LPA ajustado mediano real
  payout de caixa máximo × FCF por ação mediano real
```

Depois:

```text
DY normalizado bruto = DPS sustentável bruto / preço observado
DY normalizado líquido = DPS sustentável após imposto / preço observado
```

O motor informa qual restrição foi vinculante:

- `recurring_dividend`;
- `earnings_payout`;
- `cash_payout`.

A alíquota efetiva é parâmetro do dado de entrada. Isso evita embutir uma regra tributária única para todos os investidores e tipos de provento.

## Filtros eliminatórios

A empresa é rejeitada quando ocorre, entre outras condições:

- uso de informação futura;
- negociação suspensa;
- recuperação ou insolvência;
- patrimônio líquido estruturalmente negativo;
- completude ou histórico insuficientes;
- liquidez abaixo do piso;
- histórico insuficiente de pagamentos sem política nova comprovada;
- dividendos financiados por dívida;
- persistência insuficiente de lucro ou caixa, quando aplicável;
- falha de capital ou solvência em modelos financeiros e cíclicos.

A empresa entra em quarentena, sem receber nota, diante de:

- risco material de governança;
- parecer adverso de auditoria;
- conflito material com partes relacionadas;
- cobertura de juros em deterioração;
- dado prudencial essencial ausente.

Quarentena exige revisão humana e evidência adicional; ela não equivale a aprovação parcial.

## Pontuação

| Bloco | Peso |
|---|---:|
| Segurança do dividendo | 35 |
| Qualidade do negócio | 25 |
| Persistência e crescimento | 20 |
| Valuation | 15 |
| Liquidez e mercado | 5 |

Cada métrica válida é transformada em percentil no grupo de comparação. Métricas em que menor é melhor, como payout, dívida, diluição, cortes ou índice combinado, têm o percentil invertido.

A nota de cada bloco também recebe penalização proporcional à cobertura:

```text
nota do bloco = peso × percentil médio × cobertura das métricas do bloco
```

Assim, ausência de informação não melhora artificialmente a empresa.

## Construção da carteira

1. Ordenar apenas empresas elegíveis.
2. Admitir apenas nota igual ou superior a 70.
3. Aplicar peso aproximadamente igual, limitado a 8%.
4. Respeitar 25% por setor.
5. Parar em 15 empresas.
6. Manter em caixa a parcela que não puder ser alocada sem violar qualidade ou concentração.
7. Calcular participação de cada empresa na renda normalizada líquida.
8. Sinalizar qualquer violação de 12% por pagador ou 45% para os cinco maiores pagadores.

A versão atual não vende nem compra automaticamente. Ela produz uma decisão determinística e auditável para ser usada pelas regras de execução e pelo relatório.

## Auditoria do snapshot real

O contrato de snapshot registra:

- identificador e data observada;
- data da importação;
- nome e hash do arquivo-fonte;
- linha de origem de cada posição;
- classe de ativo;
- quantidade;
- preço médio, preço de mercado e valor de mercado quando disponíveis;
- avisos da importação;
- total declarado, quando presente.

A auditoria:

- calcula valor de mercado explícito ou `quantidade × preço`;
- não estima valor quando preço e valor estão ausentes;
- identifica símbolos duplicados;
- calcula completude;
- reconcilia o total calculado com o declarado;
- classifica o snapshot como `valid`, `partial` ou `invalid`.

O arquivo `posicao-2026-04-19-09-58-32.xlsx` será a primeira observação real assim que o adaptador XLSX mapear suas colunas para esse contrato.

## Champion, challenger e rollback

Cada mudança metodológica precisa de um contrato com:

- problema;
- componente alterado;
- hipótese;
- mudança aplicada;
- resultado esperado;
- métrica de validação;
- risco de regressão;
- janela de validação;
- critério de decisão.

A política inicial promove o challenger quando:

- o CAGR da renda real melhora ao menos 0,5 ponto percentual ao ano; **ou**
- o drawdown da renda melhora ao menos 2 pontos percentuais sem perda superior a 0,1 ponto percentual no CAGR;
- vence ou empata em pelo menos dois terços das janelas fora da amostra;
- não piora o drawdown patrimonial em mais de 3 pontos percentuais;
- não aumenta o giro em mais de 10 pontos percentuais;
- não eleva materialmente falsos positivos ou concentração;
- complexidade adicional apresenta benefício mensurável.

Resultados possíveis:

- `promote`: challenger substitui o champion;
- `observe`: permanece apenas em carteira-sombra;
- `rollback`: alteração é revertida;
- `maintain`: champion permanece por ausência de melhoria material.

## Primeiro contrato falsificável

O primeiro challenger testa a redução do peso indireto do yield em favor da cobertura por caixa. O contrato completo está em:

`docs/metodologia/experimentos/gde-exp-001-reduzir-armadilhas-de-dividendos.json`

A hipótese não é considerada aprovada até a execução point-in-time, walk-forward e carteira-sombra.

## Protocolo de validação planejado

### Base histórica

- universo com empresas listadas e deslistadas;
- demonstrações usadas somente depois da publicação;
- eventos corporativos e proventos conhecidos em cada data;
- preços executáveis, custos, impostos e slippage;
- rebalanceamento anual em maio;
- aporte e reinvestimento separados do retorno da estratégia.

### Partições

- desenvolvimento: 2011–2017;
- validação: 2018–2021;
- teste intocado: 2022 até o último mês completo disponível;
- janelas móveis adicionais para walk-forward.

### Comparações

- IDIV;
- Ibovespa e IBrX 100 com retorno total;
- CDI líquido aplicável;
- IPCA;
- carteira ingênua de maiores yields;
- carteira igualmente ponderada do universo elegível;
- versão sem filtros de qualidade.

### Robustez

- bootstrap por blocos para preservar dependências temporais;
- blocos médios de 12, 24 e 36 meses na estratégia de ações;
- exclusão dos melhores ativos e setores;
- custos maiores;
- choques de inflação, juros, recessão e commodities;
- ablação de cada bloco de pontuação.

## Verificação do código

Com o ambiente de desenvolvimento disponível, executar:

```bash
npm run typecheck
npm run build
npm run prisma:validate
npm test
```

Os testes cobrem:

- restrição vinculante do dividendo normalizado;
- tributação parametrizada;
- rejeição de look-ahead;
- quarentena de governança;
- yield trap;
- penalização por dados ausentes;
- limite por setor;
- manutenção de caixa quando o universo é insuficiente;
- reconciliação de snapshot;
- promoção, observação, manutenção e rollback.

## Próxima fase executável

1. mapear as abas e colunas dos snapshots de 4 e 19 de abril de 2026;
2. gerar hash e trilha de origem;
3. importar o snapshot de 19 de abril;
4. produzir relatório de completude, duplicidades, pesos e concentrações;
5. separar ações, FIIs, renda fixa e demais classes;
6. iniciar o coletor histórico point-in-time para as ações brasileiras;
7. rodar o primeiro backtest do champion sem otimizar parâmetros no período de teste.

Nenhuma recomendação de compra ou venda deve ser emitida antes da reconciliação do snapshot e da validação mínima do motor com dados reais.
