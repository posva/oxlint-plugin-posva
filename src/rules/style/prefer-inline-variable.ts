import type { Rule } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const NEEDS_PARENS = new Set([
  'BinaryExpression',
  'LogicalExpression',
  'ConditionalExpression',
  'SequenceExpression',
  'AssignmentExpression',
  'ArrowFunctionExpression',
  'AwaitExpression',
  'YieldExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
])

function isMultipleWords(name: string): boolean {
  if (name.includes('_')) {
    const segments = name.split('_').filter(Boolean)
    if (segments.length > 1) return true
  }
  return /[a-z][A-Z]/.test(name) || /[A-Z]{2,}[a-z]/.test(name)
}

export const stylePreferInlineVariable: Rule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow variable declarations that are only read once, preferring to inline the initializer at the usage site.',
    },
    fixable: 'code',
    messages: {
      preferInline: 'Variable `{{name}}` is only read once. Inline its value at the usage site.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreMultipleWords: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ ignoreMultipleWords: true }],
  },
  create(context) {
    const sourceCode = context.sourceCode
    const options = context.options[0] as { ignoreMultipleWords?: boolean } | undefined
    const ignoreMultipleWords = options?.ignoreMultipleWords !== false

    return {
      VariableDeclaration(node: any) {
        // Skip export declarations
        if (node.parent?.type === 'ExportNamedDeclaration') return

        for (let i = 0; i < node.declarations.length; i++) {
          const declarator = node.declarations[i]

          // Skip destructuring patterns
          if (declarator.id.type !== 'Identifier') continue
          // Skip declarations without initializer
          if (!declarator.init) continue

          const variables = sourceCode.getDeclaredVariables(declarator)
          if (variables.length === 0) continue
          const variable = variables[0]
          if (!variable) continue

          const readRefs = variable.references.filter((ref: any) => ref.isRead())
          if (readRefs.length !== 1) continue

          // For let/var: skip if reassigned (any non-init write)
          if (node.kind !== 'const') {
            const hasReassignment = variable.references.some(
              (ref: any) => ref.isWrite() && !ref.init,
            )
            if (hasReassignment) continue
          }

          const readRef = readRefs[0]
          if (!readRef) continue

          // Skip if the sole read is inside an export specifier
          const ancestors = sourceCode.getAncestors(readRef.identifier)
          if (ancestors.some((a: any) => a.type === 'ExportSpecifier')) continue

          // ignoreMultipleWords option
          if (ignoreMultipleWords && isMultipleWords(variable.name)) continue

          // Build replacement text
          const initText = sourceCode.getText(declarator.init)
          const needsParens = NEEDS_PARENS.has(declarator.init.type)
          const replacement = needsParens ? `(${initText})` : initText

          // Check if usage is in shorthand property
          const parent = readRef.identifier.parent
          const isShorthand = parent?.type === 'Property' && parent.shorthand === true

          context.report({
            node: declarator,
            messageId: 'preferInline',
            data: { name: variable.name },
            fix(fixer) {
              const fixes: any[] = []

              // Replace usage with inlined initializer
              if (isShorthand) {
                fixes.push(fixer.replaceText(parent, variable.name + ': ' + replacement))
              } else {
                fixes.push(fixer.replaceText(readRef.identifier, replacement))
              }

              // Remove declaration or specific declarator
              if (node.declarations.length === 1) {
                // Extend range to eat trailing whitespace/newline
                const text = sourceCode.getText()
                let end = node.range[1]
                while (end < text.length && (text[end] === ' ' || text[end] === '\t')) {
                  end++
                }
                if (end < text.length && text[end] === '\n') {
                  end++
                } else if (end < text.length && text[end] === '\r') {
                  end++
                  if (end < text.length && text[end] === '\n') end++
                }
                fixes.push(fixer.removeRange([node.range[0], end]))
              } else if (i < node.declarations.length - 1) {
                // Not last: remove from this declarator start to next declarator start
                fixes.push(
                  fixer.removeRange([declarator.range[0], node.declarations[i + 1].range[0]]),
                )
              } else {
                // Last: remove from previous declarator end to this declarator end
                fixes.push(
                  fixer.removeRange([node.declarations[i - 1].range[1], declarator.range[1]]),
                )
              }

              return fixes
            },
          })
        }
      },
    }
  },
})
