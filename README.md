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
  "$schema": "./node_modules/oxlint-plugin-posva/schema.json",
  "jsPlugins": ["oxlint-plugin-posva"],
  "rules": {
    "posva/vitest-prefer-to-have-been-called-times": "error",
  },
}
```

### Editor Autocompletion

The `$schema` above extends the base oxlint schema with typed entries for this plugin's rules, giving you autocompletion for rule names and their options.

If you use multiple JS plugins that each ship their own schema, you can create a local schema that merges them all with `allOf`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "allOf": [
    { "$ref": "./node_modules/oxlint-plugin-posva/schema.json" },
    { "$ref": "./node_modules/oxlint-plugin-other/schema.json" }
  ]
}
```

Save it as e.g. `oxlintrc-schema.json` and reference it in your config:

```jsonc
{
  "$schema": "./oxlintrc-schema.json",
}
```

## Rules

### style

| Rule                           | Description                                                                                     | Fixable |
| ------------------------------ | ----------------------------------------------------------------------------------------------- | ------- |
| `style-prefer-inline-variable` | Flag variables read only once, suggest inlining. Option `ignoreMultipleWords` (default: `true`) | Yes     |

### vitest

| Rule                                      | Description                                                                                  | Fixable |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- | ------- |
| `vitest-prefer-to-have-been-called-times` | Enforce `toHaveBeenCalledTimes(N)` over `toHaveBeenCalledOnce()` or `not.toHaveBeenCalled()` | Yes     |

## License

[MIT](./LICENSE)
