# InvestAI Agent Rules

These rules adapt the Karpathy-inspired coding guidelines to this project.

## Product Invariants

- Do not invent financial numbers. Use persisted seed/provider data only.
- Keep valuation deterministic and reproducible in code.
- Use LLMs only to classify, explain, summarize, or recommend from known inputs.
- When the LLM is unavailable or invalid, preserve the product flow with rule-based fallback.
- Expose partial results clearly instead of hiding missing data.

## Engineering Rules

- Start from a verifiable goal and keep changes scoped to that goal.
- Prefer simple TypeScript modules over speculative abstractions.
- Match existing repo style and avoid unrelated refactors.
- Shared API contracts belong in `packages/shared`.
- Public API responses must be schema-shaped and include clear error codes.

## Verification

- Run `npm run typecheck`, `npm run build`, `npm run prisma:validate`, and `npm test` before considering the MVP flow ready.
- Add focused tests for valuation, recommendation thresholds, schema validation, and fallback behavior when changing those areas.
