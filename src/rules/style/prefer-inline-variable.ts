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

const CAMEL_PASCAL_RE = /[a-z][A-Z]|[A-Z]{2,}[a-z]/

function isMultipleWords(name: string): boolean {
  if (name.includes('_')) {
    // Check for 2+ non-empty segments without allocating arrays
    let segments = 0
    let i = 0
    while (i < name.length) {
      if (name[i] === '_') {
        i++
        continue
      }
      segments++
      if (segments > 1) return true
      while (i < name.length && name[i] !== '_') i++
    }
  }
  return CAMEL_PASCAL_RE.test(name)
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
    // Cache full source text once per file for whitespace scanning in fixes
    let fullText: string | undefined

    return {
      VariableDeclaration(node: any) {
        if (node.parent?.type === 'ExportNamedDeclaration') return

        for (let i = 0; i < node.declarations.length; i++) {
          const declarator = node.declarations[i]

          if (declarator.id.type !== 'Identifier') continue
          if (!declarator.init) continue

          const variable = sourceCode.getDeclaredVariables(declarator)[0]
          if (!variable) continue

          // Single pass over references: count reads, detect reassignment
          let readCount = 0
          let readRef: any = null
          let hasReassignment = false
          for (const ref of variable.references) {
            if (ref.isRead()) {
              readCount++
              if (readCount > 1) break
              readRef = ref
            }
            if (ref.isWrite() && !ref.init) {
              hasReassignment = true
            }
          }
          if (readCount !== 1 || !readRef) continue
          if (node.kind !== 'const' && hasReassignment) continue

          // Walk parent chain instead of allocating ancestors array
          let isExported = false
          for (let p = readRef.identifier.parent; p; p = p.parent) {
            if (p.type === 'ExportSpecifier') {
              isExported = true
              break
            }
          }
          if (isExported) continue

          if (ignoreMultipleWords && isMultipleWords(variable.name)) continue

          const initText = sourceCode.getText(declarator.init)
          const replacement = NEEDS_PARENS.has(declarator.init.type) ? `(${initText})` : initText

          const refParent = readRef.identifier.parent
          const isShorthand = refParent?.type === 'Property' && refParent.shorthand === true

          context.report({
            node: declarator,
            messageId: 'preferInline',
            data: { name: variable.name },
            fix(fixer) {
              const usageFix = isShorthand
                ? fixer.replaceText(refParent, variable.name + ': ' + replacement)
                : fixer.replaceText(readRef.identifier, replacement)

              let removalFix
              if (node.declarations.length === 1) {
                fullText ??= sourceCode.getText()
                let end = node.range[1]
                while (end < fullText.length && (fullText[end] === ' ' || fullText[end] === '\t')) {
                  end++
                }
                if (fullText[end] === '\n') {
                  end++
                } else if (fullText[end] === '\r') {
                  end += fullText[end + 1] === '\n' ? 2 : 1
                }
                removalFix = fixer.removeRange([node.range[0], end])
              } else if (i < node.declarations.length - 1) {
                removalFix = fixer.removeRange([
                  declarator.range[0],
                  node.declarations[i + 1].range[0],
                ])
              } else {
                removalFix = fixer.removeRange([
                  node.declarations[i - 1].range[1],
                  declarator.range[1],
                ])
              }

              return [usageFix, removalFix]
            },
          })
        }
      },
    }
  },
})
