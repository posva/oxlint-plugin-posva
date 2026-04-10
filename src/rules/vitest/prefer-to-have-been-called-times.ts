import type { Rule } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

export const vitestPreferToHaveBeenCalledTimes: Rule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using toHaveBeenCalledTimes(N) instead of toHaveBeenCalledOnce() or not.toHaveBeenCalled()',
    },
    fixable: 'code',
    messages: {
      preferCalledTimes: 'Use toHaveBeenCalledTimes({{count}}) instead of {{original}}.',
    },
  },
  create(context) {
    return {
      CallExpression(node: any) {
        const callee = node.callee
        if (callee.type !== 'MemberExpression') return

        const methodName = callee.property?.name
        const object = callee.object

        // expect(spy).toHaveBeenCalledOnce()
        if (methodName === 'toHaveBeenCalledOnce' && isExpectCall(object)) {
          context.report({
            node,
            messageId: 'preferCalledTimes',
            data: { count: '1', original: 'toHaveBeenCalledOnce()' },
            fix(fixer) {
              // Replace from method name through closing paren: toHaveBeenCalledOnce() → toHaveBeenCalledTimes(1)
              return fixer.replaceTextRange(
                [callee.property.range[0], node.range[1]],
                'toHaveBeenCalledTimes(1)',
              )
            },
          })
          return
        }

        // expect(spy).not.toHaveBeenCalled()
        if (
          methodName === 'toHaveBeenCalled' &&
          object?.type === 'MemberExpression' &&
          object.property?.name === 'not' &&
          isExpectCall(object.object)
        ) {
          context.report({
            node,
            messageId: 'preferCalledTimes',
            data: { count: '0', original: 'not.toHaveBeenCalled()' },
            fix(fixer) {
              // Replace from `not` through closing paren: not.toHaveBeenCalled() → toHaveBeenCalledTimes(0)
              return fixer.replaceTextRange(
                [object.property.range[0], node.range[1]],
                'toHaveBeenCalledTimes(0)',
              )
            },
          })
        }
      },
    }
  },
})

function isExpectCall(node: any): boolean {
  return (
    node?.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    node.callee.name === 'expect'
  )
}
