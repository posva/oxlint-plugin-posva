import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import plugin from './index'

const schema = JSON.parse(readFileSync(resolve(process.cwd(), 'schema.json'), 'utf-8'))

const schemaRules = Object.keys(schema.properties.rules.properties)
const pluginRules = Object.keys(plugin.rules!).map((r) => `posva/${r}`)

describe('schema.json', () => {
  it('has an entry for every plugin rule', () => {
    for (const rule of pluginRules) {
      expect(schemaRules).toContain(rule)
    }
  })

  it('has no extra entries beyond plugin rules', () => {
    for (const rule of schemaRules) {
      expect(pluginRules).toContain(rule)
    }
  })

  it('each rule entry has a description', () => {
    for (const rule of schemaRules) {
      expect(schema.properties.rules.properties[rule].description).toBeTruthy()
    }
  })
})
