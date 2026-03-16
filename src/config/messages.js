import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Raw config loaded from config/messages.json */
export const cfg = JSON.parse(
  readFileSync(path.join(__dirname, '../../config/messages.json'), 'utf8')
)

/**
 * Template helper — replaces {varName} placeholders in a string.
 * Numbers are automatically formatted with toLocaleString().
 *
 * @param {string} template  - e.g. "You earned **{amount}** {coin}"
 * @param {object} vars      - e.g. { amount: 1500, coin: '<:Coin:...>' }
 * @returns {string}
 */
export function t (template, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = vars[key]
    if (val === undefined) return `{${key}}`
    return typeof val === 'number' ? val.toLocaleString() : String(val)
  })
}
