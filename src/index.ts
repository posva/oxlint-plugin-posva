import type { Plugin } from '@oxlint/plugins'
import { definePlugin, eslintCompatPlugin } from '@oxlint/plugins'
import { vitestPreferToHaveBeenCalledTimes } from './rules/vitest/prefer-to-have-been-called-times'

const plugin: Plugin = eslintCompatPlugin(
  definePlugin({
    meta: { name: 'posva' },
    rules: {
      'vitest-prefer-to-have-been-called-times': vitestPreferToHaveBeenCalledTimes,
    },
  }),
)

export default plugin
