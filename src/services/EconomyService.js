import * as db from '../db/economyDb.js'
import { WORK_JOBS, FISH_TYPES, FISH_CUMULATIVE, LOTTERY_TICKET_PRICE, LOTTERY_PRIZES, STORE_ITEMS } from '../data/gameData.js'
import { userCache } from '../utils/cache.js'
import logger from '../utils/logger.js'

class EconomyService {
  // ---------------------------------------------------------------------------
  // Balance helpers
  // ---------------------------------------------------------------------------

  /** Get wallet + bank for a user. Uses short-lived cache. */
  async getUser (userId) {
    const cached = userCache.get(userId)
    if (cached) return cached
    const user = await db.getUser(userId)
    userCache.set(userId, user)
    return user
  }

  invalidate (userId) {
    userCache.del(userId)
  }

  // ---------------------------------------------------------------------------
  // Economy actions
  // ---------------------------------------------------------------------------

  /** Pick a random job, add pay to wallet. Returns { job, amount }. */
  async work (userId) {
    const job = WORK_JOBS[Math.floor(Math.random() * WORK_JOBS.length)]
    const amount = Math.floor(Math.random() * (job.maxPay - job.minPay + 1)) + job.minPay
    await db.addToWallet(userId, amount)
    this.invalidate(userId)
    logger.debug(`work: user=${userId} earned=${amount}`)
    return { job: job.name, amount }
  }

  /**
   * Deposit from wallet to bank.
   * @param {string} userId
   * @param {number|'all'} rawAmount
   * @returns {number|null} deposited amount, or null on insufficient funds
   */
  async deposit (userId, rawAmount) {
    let amount = rawAmount
    if (rawAmount === 'all') {
      const { wallet } = await this.getUser(userId)
      amount = wallet
    }
    amount = parseInt(amount, 10)
    if (isNaN(amount) || amount <= 0) throw new Error('INVALID_AMOUNT')

    const ok = await db.transferWalletToBank(userId, amount)
    if (ok) this.invalidate(userId)
    return ok ? amount : null
  }

  /**
   * Withdraw from bank to wallet.
   * @returns {number|null}
   */
  async withdraw (userId, rawAmount) {
    let amount = rawAmount
    if (rawAmount === 'all') {
      const { bank } = await this.getUser(userId)
      amount = bank
    }
    amount = parseInt(amount, 10)
    if (isNaN(amount) || amount <= 0) throw new Error('INVALID_AMOUNT')

    const ok = await db.transferBankToWallet(userId, amount)
    if (ok) this.invalidate(userId)
    return ok ? amount : null
  }

  /**
   * Send coins from one user to another.
   * @returns {number|null} amount sent, or null on insufficient funds
   */
  async pay (fromId, toId, rawAmount) {
    let amount = rawAmount
    if (rawAmount === 'all') {
      const { wallet } = await this.getUser(fromId)
      amount = wallet
    }
    amount = parseInt(amount, 10)
    if (isNaN(amount) || amount <= 0) throw new Error('INVALID_AMOUNT')

    const ok = await db.payUser(fromId, toId, amount)
    if (ok) {
      this.invalidate(fromId)
      this.invalidate(toId)
    }
    return ok ? amount : null
  }

  /**
   * Steal all wallet coins from target.
   * @returns {number} stolen amount (0 if nothing)
   */
  async rob (thiefId, targetId) {
    const stolen = await db.robUser(thiefId, targetId)
    if (stolen > 0) {
      this.invalidate(thiefId)
      this.invalidate(targetId)
    }
    return stolen
  }

  /**
   * Roulette bet.
   * @param {string} userId
   * @param {number|'all'} rawAmount
   * @param {string} betType  'red'|'black'|'low'|'high'|'number'
   * @param {number} [betNumber]
   * @returns {{ roll, color, won, amount, newBalance }}
   */
  async bet (userId, rawAmount, betType, betNumber) {
    const { wallet } = await this.getUser(userId)
    const amount = rawAmount === 'all' ? wallet : parseInt(rawAmount, 10)

    if (isNaN(amount) || amount <= 0) throw new Error('INVALID_AMOUNT')
    if (amount > wallet) throw new Error('INSUFFICIENT_FUNDS')

    const roll = Math.floor(Math.random() * 37)
    const color = roll === 0 ? 'green' : roll % 2 === 0 ? 'red' : 'black'

    const won =
      (betType === 'red' && color === 'red') ||
      (betType === 'black' && color === 'black') ||
      (betType === 'low' && roll >= 1 && roll <= 18) ||
      (betType === 'high' && roll >= 19 && roll <= 36) ||
      (betType === 'number' && roll === betNumber)

    const newBalance = await db.betWallet(userId, won ? amount : -amount)
    this.invalidate(userId)

    return { roll, color, won, amount, newBalance }
  }

  /**
   * Fishing minigame. Uses pre-computed cumulative probabilities.
   * @returns {{ fish, value, newBalance }}
   */
  async fish (userId) {
    const r = Math.random()
    const idx = FISH_CUMULATIVE.findIndex(c => r < c)
    const fish = FISH_TYPES[idx === -1 ? FISH_TYPES.length - 1 : idx]
    const value = Math.floor(Math.random() * (fish.max - fish.min + 1)) + fish.min

    await db.addToWallet(userId, value)
    this.invalidate(userId)

    const { wallet: newBalance } = await this.getUser(userId)
    return { fish: fish.name, value, newBalance }
  }

  /**
   * Lottery. Deducts ticket price, draws 3 winning numbers, pays prize.
   * @param {number} userNumber  0–999
   * @returns {{ winningNumbers, place, prize, finalBalance }}
   */
  async lottery (userId, userNumber) {
    const { wallet } = await this.getUser(userId)
    if (wallet < LOTTERY_TICKET_PRICE) throw new Error('INSUFFICIENT_FUNDS')

    await db.setWallet(userId, wallet - LOTTERY_TICKET_PRICE)

    const winningNumbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 1000))
    const place = winningNumbers.indexOf(userNumber)
    const prize = place !== -1 ? LOTTERY_PRIZES[place] : 0

    if (prize > 0) await db.addToWallet(userId, prize)
    this.invalidate(userId)

    return {
      winningNumbers,
      place,
      prize,
      ticketPrice: LOTTERY_TICKET_PRICE,
      finalBalance: wallet - LOTTERY_TICKET_PRICE + prize
    }
  }

  /**
   * Horse race. Win chance is derived from the horse's stats.
   * @returns {{ won, betAmount, newBalance, horseName }}
   */
  async horseRace (userId, horseId, betAmount) {
    const inventory = await db.getInventory(userId)
    if (!inventory.some(e => e.itemId === horseId)) throw new Error('HORSE_NOT_OWNED')

    const { wallet } = await this.getUser(userId)
    if (wallet < betAmount) throw new Error('INSUFFICIENT_FUNDS')

    const horse = STORE_ITEMS.find(i => i.id === horseId)
    const winChance = horse?.winChance ?? 0.33

    const won = Math.random() < winChance
    const newBalance = won ? wallet + betAmount : wallet - betAmount
    await db.setWallet(userId, newBalance)
    this.invalidate(userId)

    return { won, betAmount, newBalance, horseName: horse?.name ?? `Horse #${horseId}` }
  }

  /** Admin: add coins to a user's wallet */
  async adminGive (targetId, amount) {
    await db.addToWallet(targetId, amount)
    this.invalidate(targetId)
  }

  /** Admin: subtract coins from wallet (floors at 0) */
  async adminTake (targetId, amount) {
    const { wallet } = await this.getUser(targetId)
    const newWallet = Math.max(0, wallet - amount)
    await db.setWallet(targetId, newWallet)
    this.invalidate(targetId)
    return newWallet
  }

  /** Admin: set wallet to an exact value */
  async adminSetWallet (targetId, amount) {
    await db.setWallet(targetId, amount)
    this.invalidate(targetId)
  }

  /** Admin: set bank to an exact value */
  async adminSetBank (targetId, amount) {
    await db.setBank(targetId, amount)
    this.invalidate(targetId)
  }

  /** Admin: zero wallet + bank + inventory for a user */
  async adminReset (targetId) {
    await db.resetUser(targetId)
    this.invalidate(targetId)
  }

  /** Admin: wipe the entire server economy */
  async adminWipe () {
    await db.wipeAll()
    userCache.flushAll()
  }

  /** Top N richest users */
  async getRichList (limit = 10) {
    return db.getRichList(limit)
  }

  /** Full balance for one user (bypasses cache for accuracy) */
  async adminLookup (targetId) {
    return db.getUser(targetId)
  }

  /** Global economy stats */
  async getEconStats () {
    return db.getEconStats()
  }
}

export const economyService = new EconomyService()
