import 'dotenv/config'
import { client } from './src/config/client.js'
import { CommandHandler } from './src/core/CommandHandler.js'
import { storeService } from './src/services/StoreService.js'
import { initDb } from './src/db/economyDb.js'
import { buildStorePage, buildStoreRow } from './src/commands/store/store.js'
import { buildInventoryEmbed } from './src/commands/store/inventory.js'
import logger from './src/utils/logger.js'

const handler = new CommandHandler()

// Prefix characters (slash '/' is reserved for Discord slash commands)
const PREFIXES = ['$', '!', 'h']

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
async function main () {
  await initDb()
  await handler.loadAll()
  await storeService.init()   // seed store_items table if empty

  client.once('ready', () => {
    logger.info(`Connected as ${client.user.tag}`)
  })

  // --- Prefix commands ---
  client.on('messageCreate', (msg) => {
    if (msg.author.bot) return

    const prefix = PREFIXES.find(p => msg.content.startsWith(p))
    if (!prefix) return

    const [name, ...args] = msg.content.slice(prefix.length).trim().split(/\s+/)
    if (!name) return

    handler.dispatch(CommandHandler.messageCtx(msg), name.toLowerCase(), args)
  })

  // --- Slash commands ---
  client.on('interactionCreate', async (interaction) => {
    // ── Autocomplete ──────────────────────────────────────────────────────
    if (interaction.isAutocomplete()) {
      const { commandName } = interaction
      const focused = interaction.options.getFocused(true)

      try {
        // /buy — all active store items
        if (commandName === 'buy' && focused.name === 'item') {
          const items = await storeService.getItems()
          const filter = focused.value.toLowerCase()
          const choices = items
            .filter(i => i.name.toLowerCase().includes(filter) || String(i.id).includes(filter))
            .slice(0, 25)
            .map(i => ({
              name: `[${i.id}] ${i.name} — ${i.price.toLocaleString()} coins`,
              value: String(i.id)
            }))
          return interaction.respond(choices)
        }

        // /hr — only horses the user owns
        if (commandName === 'hr' && focused.name === 'horse') {
          const horses = await storeService.getHorses(interaction.user.id)
          const choices = horses.map(h => ({
            name: `${h.name}  ·  ⚡ ${h.speed}  ·  🎲 ${Math.round(h.winChance * 100)}% win`,
            value: String(h.id)
          }))
          return interaction.respond(choices)
        }

        // /admin removeitem — user's inventory; additem — all items
        if (commandName === 'admin' && focused.name === 'item') {
          const action = interaction.options.getString('action')
          const targetUserId = interaction.options.get('user')?.value

          let items
          if (action === 'removeitem' && targetUserId) {
            items = await storeService.getInventory(targetUserId)
          } else {
            items = await storeService.getItems()
          }

          const filter = focused.value.toLowerCase()
          const choices = items
            .filter(i => i.name.toLowerCase().includes(filter))
            .slice(0, 25)
            .map(i => ({
              name: `[${i.id}] ${i.name}${i.quantity != null ? ` × ${i.quantity}` : ''}`,
              value: String(i.id)
            }))
          return interaction.respond(choices)
        }

        // /use — only role items the user owns
        if (commandName === 'use' && focused.name === 'item') {
          const inv = await storeService.getInventory(interaction.user.id)
          const usable = inv.filter(i => i.roleId)
          const filter = focused.value.toLowerCase()
          const choices = usable
            .filter(i => i.name.toLowerCase().includes(filter) || String(i.id).includes(filter))
            .slice(0, 25)
            .map(i => ({
              name: `[${i.id}] ${i.name} × ${i.quantity}`,
              value: String(i.id)
            }))
          return interaction.respond(choices)
        }

        // /adminstore — autocomplete for item option
        if (commandName === 'adminstore' && focused.name === 'item') {
          const action = interaction.options.getString('action')
          let items

          if (action === 'setrole' || action === 'clearrole' || action === 'delete' || action === 'edit') {
            items = await storeService.getItems()
          } else {
            items = await storeService.getItems()
          }

          const filter = focused.value.toLowerCase()
          const choices = items
            .filter(i => i.name.toLowerCase().includes(filter) || String(i.id).includes(filter))
            .slice(0, 25)
            .map(i => ({
              name: `[${i.id}] ${i.name} (${i.category})`,
              value: String(i.id)
            }))
          return interaction.respond(choices)
        }
      } catch {
        return interaction.respond([])
      }

      return interaction.respond([])
    }

    // ── Buttons ───────────────────────────────────────────────────────────
    if (interaction.isButton()) {
      const [type, sub] = interaction.customId.split(':')

      if (type === 'store') {
        const page = sub === '1' ? 1 : 0
        const items = await storeService.getItems()
        return interaction.update({
          embeds: [buildStorePage(items, page)],
          components: [buildStoreRow(page)]
        })
      }

      if (type === 'inv') {
        const page = sub === 'horses' ? 1 : 0
        const user = interaction.user
        const items = await storeService.getInventory(user.id)
        const { embed, row } = buildInventoryEmbed(
          items, page, user.username, user.displayAvatarURL()
        )
        return interaction.update({ embeds: [embed], components: row ? [row] : [] })
      }

      return
    }

    // ── Chat input commands ───────────────────────────────────────────────
    if (!interaction.isChatInputCommand()) return

    const command = handler.resolve(interaction.commandName)
    if (!command) return

    const ctx = CommandHandler.interactionCtx(interaction)
    const args = command.fromInteraction(interaction.options)

    await handler.dispatch(ctx, interaction.commandName, args)
  })

  await client.login(process.env.CLIENT_TOKEN)
}

main().catch((err) => {
  logger.error('Fatal startup error', { error: err.message })
  process.exit(1)
})
