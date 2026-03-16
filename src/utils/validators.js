import { z } from 'zod'

/** Parse an amount that can be 'all' or a positive integer. Pass maxAmount when 'all' is used. */
export function parseAmount (input, maxAmount = 0) {
  if (!input) return { error: 'No amount provided.' }
  if (String(input).toLowerCase() === 'all') {
    if (maxAmount <= 0) return { error: 'You have nothing to use.' }
    return { amount: maxAmount }
  }
  const n = parseInt(input, 10)
  if (isNaN(n) || n <= 0) return { error: 'Amount must be a positive integer.' }
  return { amount: n }
}

/** Strip Discord mention syntax to get the raw user ID */
export function parseMention (input) {
  if (!input) return null
  return input.replace(/[<@!>]/g, '')
}

/** Parse a roulette bet type. Returns { type, number? } or { error } */
export function parseBetType (input) {
  if (!input) return { error: 'No bet type provided.' }
  const lower = String(input).toLowerCase()
  const VALID = ['red', 'black', 'low', 'high']

  if (VALID.includes(lower)) return { type: lower }

  const n = parseInt(lower, 10)
  if (!isNaN(n)) {
    if (n < 0 || n > 36) return { error: 'Number must be between 0 and 36.' }
    return { type: 'number', number: n }
  }

  return { error: `Invalid bet type. Use: ${VALID.join(', ')}, or a number 0–36.` }
}

/** Validate a lottery number */
export const lotteryNumberSchema = z
  .number()
  .int()
  .min(0)
  .max(999)

/** Validate an admin-give amount */
export const positiveIntSchema = z.number().int().positive()
