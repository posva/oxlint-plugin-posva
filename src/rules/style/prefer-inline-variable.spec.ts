import { RuleTester } from 'oxlint/plugins-dev'
import { stylePreferInlineVariable } from './prefer-inline-variable'

const tester = new RuleTester()

tester.run('posva/style-prefer-inline-variable', stylePreferInlineVariable, {
  valid: [
    // read twice — not single-use
    'const x = 1; use(x); use(x)',
    // destructuring
    'const { a } = obj; use(a)',
    'const [a] = arr; use(a)',
    // exported
    'export const x = 1; use(x)',
    // no initializer
    'let x; use(x)',
    // reassigned let
    'let x = 1; x = 2; use(x)',
    // never read (no-unused-vars territory)
    'const x = 1',

    // ignoreMultipleWords: true (default)
    'const userName = "test"; use(userName)',
    'const user_name = "test"; use(user_name)',
    'const USER_NAME = "test"; use(USER_NAME)',
    'const UserName = "test"; use(UserName)',
    'const XMLParser = "test"; use(XMLParser)',

    // single word — still flagged (invalid), so NOT in valid
    // _prefix is single word — still flagged

    // ignoreMultipleWords: false — multi-word still flagged, tested in invalid

    // re-exported
    'const x = 1; export { x }',
  ],

  invalid: [
    // basic literal
    {
      code: 'const x = 1; use(x)',
      output: 'use(1)',
      errors: [{ messageId: 'preferInline' }],
    },
    // string literal
    {
      code: "const x = 'hello'; use(x)",
      output: "use('hello')",
      errors: [{ messageId: 'preferInline' }],
    },
    // function call
    {
      code: 'const x = foo(); use(x)',
      output: 'use(foo())',
      errors: [{ messageId: 'preferInline' }],
    },
    // binary expression — needs parens
    {
      code: 'const x = a + b; use(x)',
      output: 'use((a + b))',
      errors: [{ messageId: 'preferInline' }],
    },
    // conditional expression — needs parens
    {
      code: 'const x = a ? b : c; use(x)',
      output: 'use((a ? b : c))',
      errors: [{ messageId: 'preferInline' }],
    },
    // arrow function — needs parens
    {
      code: 'const fn = () => 1; arr.map(fn)',
      output: 'arr.map((() => 1))',
      errors: [{ messageId: 'preferInline' }],
    },
    // await expression — needs parens
    {
      code: 'async function f() { const x = await fetch("/"); x.json() }',
      output: 'async function f() { (await fetch("/")).json() }',
      errors: [{ messageId: 'preferInline' }],
    },
    // return statement
    {
      code: 'function f() { const x = foo(); return x }',
      output: 'function f() { return foo() }',
      errors: [{ messageId: 'preferInline' }],
    },
    // shorthand property
    {
      code: 'function f() { const x = 1; return { x } }',
      output: 'function f() { return { x: 1 } }',
      errors: [{ messageId: 'preferInline' }],
    },
    // let single-use (not reassigned)
    {
      code: 'let x = 1; use(x)',
      output: 'use(1)',
      errors: [{ messageId: 'preferInline' }],
    },
    // var single-use
    {
      code: 'var x = 1; use(x)',
      output: 'use(1)',
      errors: [{ messageId: 'preferInline' }],
    },
    // object expression (no parens)
    {
      code: 'const x = { a: 1 }; use(x)',
      output: 'use({ a: 1 })',
      errors: [{ messageId: 'preferInline' }],
    },
    // array expression (no parens)
    {
      code: 'const x = [1, 2]; use(x)',
      output: 'use([1, 2])',
      errors: [{ messageId: 'preferInline' }],
    },
    // logical expression — needs parens
    {
      code: 'const x = a || b; use(x)',
      output: 'use((a || b))',
      errors: [{ messageId: 'preferInline' }],
    },
    // ignoreMultipleWords: false — should flag multi-word names
    {
      code: "const userName = 'test'; use(userName)",
      output: "use('test')",
      options: [{ ignoreMultipleWords: false }],
      errors: [{ messageId: 'preferInline' }],
    },
    // multi-declarator — first declarator single-use
    {
      code: 'const x = 1, y = 2; use(x); use(y); use(y)',
      output: 'const y = 2; use(1); use(y); use(y)',
      errors: [{ messageId: 'preferInline' }],
    },
    // multi-declarator — last declarator single-use
    {
      code: 'const x = 1, y = 2; use(x); use(x); use(y)',
      output: 'const x = 1; use(x); use(x); use(2)',
      errors: [{ messageId: 'preferInline' }],
    },
  ],
})
