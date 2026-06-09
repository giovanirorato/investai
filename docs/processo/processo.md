# Processo de desenvolvimento

## Principios adotados

- Comecar pelo fluxo principal e nao por infra extra.
- Usar TypeScript em toda a aplicacao para reduzir divergencia entre camadas.
- Centralizar contratos em `packages/shared`.
- Preservar calculos deterministcos no backend.
- Tratar IA como componente de apoio, com fallback quando falhar.

## Como o trabalho foi organizado

### 1. Dados e dominio

- A modelagem ficou concentrada em `apps/api/prisma/schema.prisma`.
- A importacao de empresas e snapshots acontece no backend via `import-service.ts`.
- Os dados sao salvos em tabelas separadas para empresa, snapshot, serie historica, analise e recomendacao.

### 2. Contratos e validacao

- As entradas da API sao validadas com `zod` nos schemas de `packages/shared`.
- O backend e o frontend reutilizam os mesmos tipos exportados por `packages/shared/src/index.ts`.
- Isso evita que a interface assuma formatos diferentes dos que a API realmente retorna.

### 3. Regras de negocio

- O valuation usa uma regra fixa por setor para calcular preco justo.
- A recomendacao usa regras objetivas para decidir entre `buy`, `monitor` e `avoid`.
- A camada de IA complementa o resultado com texto explicativo, mas nao define os numeros.

### 4. Interface e fluxo de usuario

- O frontend carrega status da API, busca empresas e mostra o detalhe selecionado.
- A analise e a recomendacao sao disparadas por botoes dedicados na mesma tela.
- Erros e estado de carregamento sao expostos de forma direta para o usuario.

## Convencoes de codigo

- Pasta `modules` no backend separa responsabilidade por dominio.
- `shared` guarda utilitarios pequenos e infraestrutura comum.
- `tests` fica perto da superficie testada para facilitar manutencao.
- Nomes de arquivos ficam em minusculo com hifens, exceto arquivos-base na raiz.

## Comandos usados no ciclo local

```bash
npm run dev
npm run build
npm run typecheck
npm run test
npm run db:up
npm run db:migrate
npm run db:seed
npm run import:companies
```

## Criterios praticos de validacao

- Conferir se `GET /health` responde antes de testar a interface.
- Confirmar se a busca de empresas retorna dados do banco.
- Verificar se a analise cria registro persistido e devolve `status` coerente.
- Verificar se a recomendacao respeita o resultado da analise e o objetivo informado.
- Validar se o fallback funciona quando a IA nao gera texto valido.
