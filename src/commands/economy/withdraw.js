import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { MSGS } from '../../i18n/en.js'
import * as db from '../../db/economyDb.js'

const err = (msg) => ({
  embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(msg)]
})

export default new Command({
  name: 'withdraw',
  aliases: ['with'],
  description: 'Move coins from the bank to your wallet',
  category: 'economy',
  cooldown: 5,

  async execute (ctx, args) {
    if (!args[0]) return ctx.channel.send(err(MSGS.errors.noAmount))

    let withdrawn
    try {
      withdrawn = await economyService.withdraw(ctx.author.id, args[0].toLowerCase())
    } catch (e) {
      if (e.message === 'INVALID_AMOUNT') return ctx.channel.send(err(MSGS.errors.invalidAmount))
      throw e
    }

    if (withdrawn === null) return ctx.channel.send(err(MSGS.errors.insufficientBank))

    const { wallet } = await db.getUser(ctx.author.id)
    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#5865F2')
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setDescription(MSGS.withdraw.success(withdrawn, wallet))
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    return [opts.getString('amount')]
  }
})
