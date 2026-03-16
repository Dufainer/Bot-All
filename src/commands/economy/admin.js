import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { storeService } from '../../services/StoreService.js'
import { parseMention } from '../../utils/validators.js'
import { MSGS, COIN } from '../../i18n/en.js'

// ---------------------------------------------------------------------------
// Subcommand handlers
// ---------------------------------------------------------------------------

async function handleGive (ctx, rest) {
  const [mention, rawAmount] = rest
  const amount = parseInt(rawAmount, 10)
  if (!mention || isNaN(amount) || amount <= 0) return ctx.reply('❌ Usage: `admin give <@user> <amount>`')
  const targetId = parseMention(mention)
  await economyService.adminGive(targetId, amount)
  return ctx.reply(MSGS.admin.give(amount, targetId))
}

async function handleTake (ctx, rest) {
  const [mention, rawAmount] = rest
  const amount = parseInt(rawAmount, 10)
  if (!mention || isNaN(amount) || amount <= 0) return ctx.reply('❌ Usage: `admin take <@user> <amount>`')
  const targetId = parseMention(mention)
  const remaining = await economyService.adminTake(targetId, amount)
  return ctx.reply(MSGS.admin.take(amount, targetId, remaining))
}

async function handleSetWallet (ctx, rest) {
  const [mention, rawAmount] = rest
  const amount = parseInt(rawAmount, 10)
  if (!mention || isNaN(amount) || amount < 0) return ctx.reply('❌ Usage: `admin setwallet <@user> <amount>`')
  const targetId = parseMention(mention)
  await economyService.adminSetWallet(targetId, amount)
  return ctx.reply(MSGS.admin.setwallet(amount, targetId))
}

async function handleSetBank (ctx, rest) {
  const [mention, rawAmount] = rest
  const amount = parseInt(rawAmount, 10)
  if (!mention || isNaN(amount) || amount < 0) return ctx.reply('❌ Usage: `admin setbank <@user> <amount>`')
  const targetId = parseMention(mention)
  await economyService.adminSetBank(targetId, amount)
  return ctx.reply(MSGS.admin.setbank(amount, targetId))
}

async function handleReset (ctx, rest) {
  const [mention] = rest
  if (!mention) return ctx.reply('❌ Usage: `admin reset <@user>`')
  const targetId = parseMention(mention)
  await economyService.adminReset(targetId)
  return ctx.reply(MSGS.admin.reset(targetId))
}

async function handleWipe (ctx) {
  await economyService.adminWipe()
  return ctx.reply(MSGS.admin.wipe)
}

async function handleRichList (ctx) {
  const list = await economyService.getRichList(10)
  if (!list.length) return ctx.reply(MSGS.admin.richlistEmpty)

  const description = list
    .map((row, i) => MSGS.admin.richlistLine(i + 1, row.id, row.total))
    .join('\n')

  return ctx.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(MSGS.admin.richlistTitle)
        .setDescription(description)
        .setColor('#FFD700')
    ]
  })
}

async function handleLookup (ctx, rest) {
  const [mention] = rest
  if (!mention) return ctx.reply('❌ Usage: `admin lookup <@user>`')
  const targetId = parseMention(mention)
  const user = await economyService.adminLookup(targetId)
  const wallet = user?.wallet ?? 0
  const bank = user?.bank ?? 0

  return ctx.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(MSGS.admin.lookupTitle(targetId))
        .setDescription(MSGS.admin.lookupDesc(wallet, bank, wallet + bank))
        .setColor('#5865F2')
    ]
  })
}

async function handleEconStat (ctx) {
  const stats = await economyService.getEconStats()
  const wallet = stats?.totalWallet ?? 0
  const bank = stats?.totalBank ?? 0

  return ctx.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(MSGS.admin.econstatTitle)
        .setDescription(MSGS.admin.econstatDesc(stats?.userCount ?? 0, wallet, bank, wallet + bank))
        .setColor('#00B0F4')
    ]
  })
}

async function handleAddItem (ctx, rest) {
  const [mention, rawId] = rest
  const itemId = parseInt(rawId, 10)
  if (!mention || isNaN(itemId)) return ctx.reply('❌ Usage: `admin additem <@user> <item-id>`')
  const targetId = parseMention(mention)
  const item = await storeService.adminAddItem(targetId, itemId)
  return ctx.reply(MSGS.admin.itemAdded(item.name, targetId))
}

async function handleRemoveItem (ctx, rest) {
  const [mention, rawId] = rest
  const itemId = parseInt(rawId, 10)
  if (!mention || isNaN(itemId)) return ctx.reply('❌ Usage: `admin removeitem <@user> <item-id>`')
  const targetId = parseMention(mention)
  const item = await storeService.adminRemoveItem(targetId, itemId)
  return ctx.reply(MSGS.admin.itemRemoved(item.name, targetId))
}

// ---------------------------------------------------------------------------
// Command definition
// ---------------------------------------------------------------------------

export default new Command({
  name: 'admin',
  aliases: [],
  description: '(Admin) Economy management — use `admin help` to list subcommands',
  category: 'economy',
  cooldown: 2,
  adminOnly: true,

  async execute (ctx, args) {
    const [sub, ...rest] = args

    switch (sub?.toLowerCase()) {
      case 'give':        return handleGive(ctx, rest)
      case 'take':        return handleTake(ctx, rest)
      case 'setwallet':   return handleSetWallet(ctx, rest)
      case 'setbank':     return handleSetBank(ctx, rest)
      case 'reset':       return handleReset(ctx, rest)
      case 'wipe':        return handleWipe(ctx)
      case 'richlist':    return handleRichList(ctx)
      case 'lookup':      return handleLookup(ctx, rest)
      case 'econstat':    return handleEconStat(ctx)
      case 'additem':     return handleAddItem(ctx, rest)
      case 'removeitem':  return handleRemoveItem(ctx, rest)
      case 'help':
      default: {
        return ctx.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('⚙️ Admin Commands')
              .setDescription(MSGS.admin.usage.join('\n'))
              .setColor('#ED4245')
          ]
        })
      }
    }
  },

  fromInteraction (opts) {
    const action = opts.getString('action')
    const user = opts.getUser('user')
    const amount = opts.getInteger('amount')
    const item = opts.getString('item')

    const args = [action]
    if (user) args.push(`<@${user.id}>`)
    if (amount != null) args.push(String(amount))
    if (item != null) args.push(item)
    return args
  }
})
