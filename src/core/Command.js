/**
 * Base class for all bot commands.
 * Each command file exports a single `new Command({ ... })` instance.
 */
export class Command {
  /**
   * @param {object} options
   * @param {string}   options.name           - Primary command name (also used for slash)
   * @param {string[]} [options.aliases]       - Prefix-command aliases
   * @param {string}   options.description     - Short description shown in /help
   * @param {string}   [options.category]      - Category for grouping in /help
   * @param {number}   [options.cooldown]      - Per-user cooldown in seconds (default: 3)
   * @param {boolean}  [options.adminOnly]     - Restrict to guild owner
   * @param {Function} options.execute         - (ctx, args) => Promise<void>
   * @param {Function} [options.fromInteraction] - (opts) => args[] — extract slash args
   */
  constructor ({
    name,
    aliases = [],
    description,
    category = 'general',
    cooldown = 3,
    adminOnly = false,
    execute,
    fromInteraction
  }) {
    this.name = name
    this.aliases = aliases
    this.description = description
    this.category = category
    this.cooldown = cooldown
    this.adminOnly = adminOnly

    if (typeof execute === 'function') {
      this.execute = execute
    }
    if (typeof fromInteraction === 'function') {
      this.fromInteraction = fromInteraction
    }
  }

  /** @param {object} ctx @param {string[]} args */
  async execute (ctx, args) { // eslint-disable-line no-unused-vars
    throw new Error(`Command "${this.name}" does not implement execute()`)
  }

  /**
   * Extract args array from slash command interaction options.
   * Override per-command if the slash options differ from prefix args.
   * @param {import('discord.js').CommandInteractionOptionResolver} opts
   * @returns {string[]}
   */
  fromInteraction (opts) { // eslint-disable-line no-unused-vars
    return []
  }
}
