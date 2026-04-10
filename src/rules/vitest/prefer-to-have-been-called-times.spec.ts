import { describe, it } from 'vitest'
import { RuleTester } from 'oxlint/plugins-dev'
import { vitestPreferToHaveBeenCalledTimes } from './prefer-to-have-been-called-times'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})

tester.run('posva/vitest-prefer-to-have-been-called-times', vitestPreferToHaveBeenCalledTimes, {
  valid: [
    'expect(spy).toHaveBeenCalledTimes(1)',
    'expect(spy).toHaveBeenCalledTimes(0)',
    'expect(spy).toHaveBeenCalledTimes(3)',
    'expect(spy).toHaveBeenCalled()',
    'expect(spy).toHaveBeenCalledWith("arg")',
  ],
  invalid: [
    {
      code: 'expect(spy).toHaveBeenCalledOnce()',
      output: 'expect(spy).toHaveBeenCalledTimes(1)',
      errors: [{ messageId: 'preferCalledTimes' }],
    },
    {
      code: 'expect(spy).not.toHaveBeenCalled()',
      output: 'expect(spy).toHaveBeenCalledTimes(0)',
      errors: [{ messageId: 'preferCalledTimes' }],
    },
  ],
})
