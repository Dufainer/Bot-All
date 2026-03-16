import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { parseMention } from '../../utils/validators.js'
import { MSGS } from '../../i18n/en.js'
import * as db from '../../db/economyDb.js'

const err = (msg) => ({
  embeds: [new EmbedBuilder().setColor('#E74C3C').setDescription(msg)]
})

export default new Command({
  name: 'pay',
  aliases: ['send', 'transfer'],
  description: 'Send coins to another user',
  category: 'economy',
  cooldown: 5,

  async execute (ctx, args) {
    if (!args[0] || !args[1]) {
      return ctx.channel.send(err('❌ Usage: `pay <@user> <amount|all>`'))
    }

    const targetId = parseMention(args[0])
    if (!targetId) return ctx.channel.send(err(MSGS.errors.noMention))
    if (targetId === ctx.author.id) return ctx.channel.send(err(MSGS.pay.selfPay))

    let sent
    try {
      sent = await economyService.pay(ctx.author.id, targetId, args[1].toLowerCase())
    } catch (e) {
      if (e.message === 'INVALID_AMOUNT') return ctx.channel.send(err(MSGS.errors.invalidAmount))
      throw e
    }

    if (sent === null) return ctx.channel.send(err(MSGS.errors.insufficientWallet))

    const { wallet: newBalance } = await db.getUser(ctx.author.id)
    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#22C55E')
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setDescription(MSGS.pay.success(sent, targetId, newBalance))
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    const user = opts.getUser('user')
    return [`<@${user.id}>`, opts.getString('amount')]
  }
})
