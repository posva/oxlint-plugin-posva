# oxlint-plugin-posva

## Adding a rule

1. Create rule in `src/rules/<category>/<rule-name>.ts` using `defineRule` from `@oxlint/plugins`
2. Create test as `<rule-name>.spec.ts` next to it — just `new RuleTester()` + `.run()` (vitest wiring and default config handled by `src/vitest-setup.ts`)
3. Register in `src/index.ts` under `rules` as `<category>-<rule-name>`

Rules are referenced as `posva/<category>-<rule-name>` (e.g. `posva/vitest-prefer-to-have-been-called-times`).

## Testing

- `pnpm exec vitest run` — run all tests
- `pnpm exec vitest run <test-file>` — run one test
- RuleTester global config lives in `src/vitest-setup.ts`
