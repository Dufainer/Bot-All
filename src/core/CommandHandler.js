import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { rateLimiter } from '../middleware/rateLimiter.js'
import logger from '../utils/logger.js'
import { MSGS } from '../i18n/en.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class CommandHandler {
  constructor () {
    /** @type {Map<string, import('./Command.js').Command>} */
    this.commands = new Map()
    /** @type {Map<string, string>} alias → primary name */
    this.aliases = new Map()
  }

  /** Register a single command instance */
  register (command) {
    this.commands.set(command.name, command)
    for (const alias of command.aliases) {
      this.aliases.set(alias, command.name)
    }
    logger.debug(`Registered command: ${command.name}`)
  }

  /** Auto-load all commands from src/commands/**\/*.js */
  async loadAll () {
    const commandsDir = path.join(__dirname, '../commands')
    const categories = readdirSync(commandsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const cat of categories) {
      const files = readdirSync(path.join(commandsDir, cat))
        .filter(f => f.endsWith('.js'))

      for (const file of files) {
        const filePath = path.join(commandsDir, cat, file)
        const { default: command } = await import(pathToFileURL(filePath).href)
        if (command && command.name) {
          this.register(command)
        }
      }
    }

    logger.info(`Loaded ${this.commands.size} commands.`)
  }

  /** Resolve a command by name or alias */
  resolve (name) {
    return this.commands.get(name) ?? this.commands.get(this.aliases.get(name))
  }

  /**
   * Dispatch a command. Handles rate-limiting, admin check, and error logging.
   * @param {object}   ctx         - Normalised message/interaction context
   * @param {string}   commandName
   * @param {string[]} args
   */
  async dispatch (ctx, commandName, args = []) {
    const command = this.resolve(commandName?.toLowerCase())
    if (!command) return

    // Rate-limit check
    const remaining = rateLimiter.check(ctx.author.id, command.name, command.cooldown)
    if (remaining > 0) {
      return ctx.reply(MSGS.cooldown(remaining))
    }

    // Admin-only guard
    if (command.adminOnly && ctx.author.id !== ctx.guild?.ownerId) {
      return ctx.reply(MSGS.errors.noPermission)
    }

    try {
      await command.execute(ctx, args)
    } catch (err) {
      logger.error(`Error in /${command.name}`, { error: err.message, stack: err.stack })
      ctx.reply(MSGS.errors.generic)
    }
  }

  // ---------------------------------------------------------------------------
  // Context factory helpers
  // ---------------------------------------------------------------------------

  /** Build a normalised ctx from a Discord Message */
  static messageCtx (msg) {
    return {
      author: msg.author,
      guild: msg.guild,
      client: msg.client,
      channel: msg.channel,
      /** Sends a reply (mirrors channel.send for convenience) */
      reply: (data) => msg.channel.send(typeof data === 'string' ? { content: data } : data)
    }
  }

  /** Build a normalised ctx from a Discord ChatInputCommandInteraction */
  static interactionCtx (interaction) {
    let replied = false

    const respond = async (data) => {
      const payload = typeof data === 'string' ? { content: data } : data
      if (!replied) {
        replied = true
        await interaction.reply(payload)
        return interaction.fetchReply()
      }
      return interaction.followUp(payload)
    }

    return {
      author: interaction.user,
      guild: interaction.guild,
      client: interaction.client,
      channel: { send: respond },
      reply: respond,
      _interaction: interaction,
      get _replied () { return replied }
    }
  }
}
