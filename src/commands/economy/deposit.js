import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { MSGS } from '../../i18n/en.js'
import * as db from '../../db/economyDb.js'

const err = (msg) => ({
  embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(msg)]
})

export default new Command({
  name: 'deposit',
  aliases: ['dep'],
  description: 'Move coins from your wallet to the bank',
  category: 'economy',
  cooldown: 5,

  async execute (ctx, args) {
    if (!args[0]) return ctx.channel.send(err(MSGS.errors.noAmount))

    let deposited
    try {
      deposited = await economyService.deposit(ctx.author.id, args[0].toLowerCase())
    } catch (e) {
      if (e.message === 'INVALID_AMOUNT') return ctx.channel.send(err(MSGS.errors.invalidAmount))
      throw e
    }

    if (deposited === null) return ctx.channel.send(err(MSGS.errors.insufficientWallet))

    const { bank } = await db.getUser(ctx.author.id)
    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#5865F2')
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setDescription(MSGS.deposit.success(deposited, bank))
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    return [opts.getString('amount')]
  }
})
