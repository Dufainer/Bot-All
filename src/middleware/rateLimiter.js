class RateLimiter {
  constructor () {
    /** @type {Map<string, number>} key → expiry timestamp */
    this.cooldowns = new Map()
  }

  /**
   * Check (and set) a per-user per-command cooldown.
   * @returns {number} Remaining seconds if limited, 0 if allowed.
   */
  check (userId, commandName, cooldownSeconds) {
    const key = `${userId}:${commandName}`
    const now = Date.now()
    const expiry = this.cooldowns.get(key)

    if (expiry && now < expiry) {
      return Math.ceil((expiry - now) / 1000)
    }

    this.cooldowns.set(key, now + cooldownSeconds * 1000)

    // Periodic cleanup to prevent unbounded memory growth
    if (this.cooldowns.size > 5000) {
      for (const [k, v] of this.cooldowns) {
        if (now > v) this.cooldowns.delete(k)
      }
    }

    return 0
  }

  /** Remove a user's cooldown for a specific command (e.g. for testing) */
  reset (userId, commandName) {
    this.cooldowns.delete(`${userId}:${commandName}`)
  }
}

export const rateLimiter = new RateLimiter()
