# oxlint-plugin-posva

[![npm version](https://img.shields.io/npm/v/oxlint-plugin-posva.svg)](https://npmx.dev/package/oxlint-plugin-posva)
[![ci](https://github.com/posva/oxlint-plugin-posva/actions/workflows/ci.yml/badge.svg)](https://github.com/posva/oxlint-plugin-posva/actions/workflows/ci.yml)

Personal [oxlint](https://oxc.rs) rules plugin.

## Installation

```bash
pnpm add -D oxlint-plugin-posva
```

## Configuration

In `.oxlintrc.json`:

```jsonc
{
  "jsPlugins": ["oxlint-plugin-posva"],
  "rules": {
    "posva/vitest-prefer-to-have-been-called-times": "error",
  },
}
```

## Rules

### vitest

| Rule                                      | Description                                                                                  | Fixable |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- | ------- |
| `vitest-prefer-to-have-been-called-times` | Enforce `toHaveBeenCalledTimes(N)` over `toHaveBeenCalledOnce()` or `not.toHaveBeenCalled()` | Yes     |

## License

[MIT](./LICENSE)
