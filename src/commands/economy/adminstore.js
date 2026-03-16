import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { storeService } from '../../services/StoreService.js'
import { parseMention } from '../../utils/validators.js'
import { COIN } from '../../i18n/en.js'

const err = (msg) => ({
  embeds: [new EmbedBuilder().setColor('#ED4245').setDescription(`❌ ${msg}`)]
})

const ok = (msg) => ({
  embeds: [new EmbedBuilder().setColor('#22C55E').setDescription(`✅ ${msg}`)]
})

/** Extract a role ID from a <@&ID> mention or raw ID string */
function parseRoleMention (input) {
  if (!input) return null
  return input.replace(/[<@&>]/g, '').trim() || null
}

// ---------------------------------------------------------------------------
// Subcommand handlers
// ---------------------------------------------------------------------------

async function handleList (ctx) {
  const items = await storeService.getItems()
  if (!items.length) return ctx.reply(err('The store is empty.'))

  const misc = items.filter(i => i.category !== 'Horse')
  const horses = items.filter(i => i.category === 'Horse')

  const lines = (list) => list.map(i => {
    const role = i.roleId ? `  🎭 <@&${i.roleId}>` : ''
    const horseExtra = i.speed ? `  ⚡ ${i.speed}  🎲 ${Math.round(i.winChance * 100)}%  📊 ${i.bettingOdds}` : ''
    return `\`${String(i.id).padStart(2, '0')}\` **${i.name}** — ${i.price.toLocaleString()} ${COIN}${role}${horseExtra}`
  }).join('\n')

  const embed = new EmbedBuilder()
    .setColor('#F59E0B')
    .setTitle('🏪  Store — Item List')
    .setFooter({ text: `${items.length} items total` })

  if (misc.length) embed.addFields({ name: '🎒  Miscellaneous', value: lines(misc), inline: false })
  if (horses.length) embed.addFields({ name: '🐎  Horses', value: lines(horses), inline: false })

  return ctx.reply({ embeds: [embed] })
}

async function handleCreate (ctx, rest) {
  // create <name...> <price>  — last arg is price, rest is name
  if (rest.length < 2) return ctx.reply(err('Usage: `adminstore create <name> <price>`'))
  const price = parseInt(rest[rest.length - 1], 10)
  if (isNaN(price) || price < 0) return ctx.reply(err('Price must be a non-negative integer.'))
  const name = rest.slice(0, -1).join(' ')
  if (!name) return ctx.reply(err('Item name cannot be empty.'))

  const id = await storeService.createItem({ name, price, category: 'Misc' })
  return ctx.reply(ok(`Created **${name}** (ID \`${id}\`) for ${price.toLocaleString()} ${COIN}.`))
}

async function handleCreateHorse (ctx, rest) {
  // createhorse <name> <price> <speed> <winchance%> <odds>
  if (rest.length < 5) {
    return ctx.reply(err('Usage: `adminstore createhorse <name> <price> <speed> <winchance%> <odds>`\nExample: `adminstore createhorse Pegasus 8000 45km/h 50 2:1`'))
  }
  const [rawOdds, rawWin, rawSpeed, rawPrice, ...nameParts] = [...rest].reverse()
  const name = nameParts.reverse().join(' ')
  const price = parseInt(rawPrice, 10)
  const winChance = parseFloat(rawWin) / 100
  const speed = rawSpeed
  const bettingOdds = rawOdds

  if (!name) return ctx.reply(err('Horse name cannot be empty.'))
  if (isNaN(price) || price < 0) return ctx.reply(err('Price must be a non-negative integer.'))
  if (isNaN(winChance) || winChance < 0 || winChance > 1) return ctx.reply(err('Win chance must be 0–100.'))

  const id = await storeService.createItem({ name, price, category: 'Horse', speed, winChance, bettingOdds })
  return ctx.reply(ok(
    `Created horse **${name}** (ID \`${id}\`) for ${price.toLocaleString()} ${COIN}.\n` +
    `⚡ ${speed}  ·  🎲 ${Math.round(winChance * 100)}% win  ·  📊 ${bettingOdds}`
  ))
}

async function handleEdit (ctx, rest) {
  // edit <id> <field> <value...>
  const [rawId, field, ...valueParts] = rest
  const id = parseInt(rawId, 10)
  if (isNaN(id)) return ctx.reply(err('Usage: `adminstore edit <id> <field> <value>`'))

  const item = await storeService.getItem(id)
  if (!item) return ctx.reply(err(`No item with ID \`${id}\` found.`))

  const value = valueParts.join(' ')
  if (!field || !value) return ctx.reply(err('Usage: `adminstore edit <id> <field> <value>`'))

  const FIELDS = ['name', 'price', 'speed', 'winchance', 'odds', 'category']
  if (!FIELDS.includes(field.toLowerCase())) {
    return ctx.reply(err(`Unknown field. Valid fields: ${FIELDS.join(', ')}`))
  }

  let update = {}
  switch (field.toLowerCase()) {
    case 'name':     update = { name: value }; break
    case 'price': {
      const price = parseInt(value, 10)
      if (isNaN(price) || price < 0) return ctx.reply(err('Price must be a non-negative integer.'))
      update = { price }
      break
    }
    case 'speed':    update = { speed: value }; break
    case 'winchance': {
      const wc = parseFloat(value) / 100
      if (isNaN(wc) || wc < 0 || wc > 1) return ctx.reply(err('Win chance must be 0–100.'))
      update = { winChance: wc }
      break
    }
    case 'odds':     update = { bettingOdds: value }; break
    case 'category': {
      const cat = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      if (!['Misc', 'Horse'].includes(cat)) return ctx.reply(err('Category must be `Misc` or `Horse`.'))
      update = { category: cat }
      break
    }
  }

  await storeService.editItem(id, update)
  return ctx.reply(ok(`Updated **${item.name}** (ID \`${id}\`) — \`${field}\` → \`${value}\`.`))
}

async function handleSetRole (ctx, rest) {
  // setrole <id> <@role|roleId>
  const [rawId, rawRole] = rest
  const id = parseInt(rawId, 10)
  if (isNaN(id) || !rawRole) return ctx.reply(err('Usage: `adminstore setrole <id> <@role>`'))

  const item = await storeService.getItem(id)
  if (!item) return ctx.reply(err(`No item with ID \`${id}\` found.`))

  const roleId = parseRoleMention(rawRole)
  if (!roleId) return ctx.reply(err('Could not parse role. Mention it or paste the role ID.'))

  await storeService.editItem(id, { roleId })
  return ctx.reply(ok(`Set role reward for **${item.name}** → <@&${roleId}>.`))
}

async function handleClearRole (ctx, rest) {
  const [rawId] = rest
  const id = parseInt(rawId, 10)
  if (isNaN(id)) return ctx.reply(err('Usage: `adminstore clearrole <id>`'))

  const item = await storeService.getItem(id)
  if (!item) return ctx.reply(err(`No item with ID \`${id}\` found.`))

  await storeService.editItem(id, { roleId: null })
  return ctx.reply(ok(`Cleared role reward for **${item.name}**.`))
}

async function handleDelete (ctx, rest) {
  const [rawId] = rest
  const id = parseInt(rawId, 10)
  if (isNaN(id)) return ctx.reply(err('Usage: `adminstore delete <id>`'))

  const item = await storeService.getItem(id)
  if (!item) return ctx.reply(err(`No item with ID \`${id}\` found.`))

  await storeService.deleteItem(id)
  return ctx.reply(ok(`Removed **${item.name}** (ID \`${id}\`) from the store.`))
}

// ---------------------------------------------------------------------------
// Command definition
// ---------------------------------------------------------------------------

const USAGE = [
  '`list` — Show all store items with IDs',
  '`create <name> <price>` — Add a misc item',
  '`createhorse <name> <price> <speed> <winchance%> <odds>` — Add a horse',
  '`edit <id> <field> <value>` — Edit an item field (name · price · speed · winchance · odds · category)',
  '`setrole <id> <@role>` — Assign a role reward on purchase',
  '`clearrole <id>` — Remove the role reward',
  '`delete <id>` — Remove an item from the store'
]

export default new Command({
  name: 'adminstore',
  aliases: ['as', 'storeadmin'],
  description: '(Admin) Manage store items — use `adminstore help` for subcommands',
  category: 'economy',
  cooldown: 2,
  adminOnly: true,

  async execute (ctx, args) {
    const [sub, ...rest] = args

    switch (sub?.toLowerCase()) {
      case 'list':        return handleList(ctx)
      case 'create':      return handleCreate(ctx, rest)
      case 'createhorse': return handleCreateHorse(ctx, rest)
      case 'edit':        return handleEdit(ctx, rest)
      case 'setrole':     return handleSetRole(ctx, rest)
      case 'clearrole':   return handleClearRole(ctx, rest)
      case 'delete':      return handleDelete(ctx, rest)
      case 'help':
      default:
        return ctx.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#F59E0B')
              .setTitle('🏪  Admin Store Commands')
              .setDescription(USAGE.join('\n'))
          ]
        })
    }
  },

  fromInteraction (opts) {
    const action = opts.getString('action')
    const item   = opts.getString('item')
    const name   = opts.getString('name')
    const price  = opts.getInteger('price')
    const speed  = opts.getString('speed')
    const win    = opts.getNumber('winchance')
    const odds   = opts.getString('odds')
    const field  = opts.getString('field')
    const value  = opts.getString('value')
    const role   = opts.getRole('role')

    const args = [action]

    switch (action) {
      case 'list':        break
      case 'create':
        if (name) args.push(name)
        if (price != null) args.push(String(price))
        break
      case 'createhorse':
        if (name)  args.push(name)
        if (price != null) args.push(String(price))
        if (speed) args.push(speed)
        if (win != null)   args.push(String(win))
        if (odds)  args.push(odds)
        break
      case 'edit':
        if (item)  args.push(item)
        if (field) args.push(field)
        if (value) args.push(value)
        break
      case 'setrole':
        if (item) args.push(item)
        if (role) args.push(role.id)
        break
      case 'clearrole':
      case 'delete':
        if (item) args.push(item)
        break
    }

    return args
  }
})
