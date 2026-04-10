import { describe, it } from 'vitest'
import { RuleTester } from 'oxlint/plugins-dev'

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

RuleTester.setDefaultConfig({
  languageOptions: { parserOptions: { lang: 'ts' } },
})
