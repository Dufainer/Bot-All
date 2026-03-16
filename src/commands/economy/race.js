import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { COIN } from '../../i18n/en.js'
import { cfg, t } from '../../config/messages.js'

export default new Command({
  name: 'hr',
  aliases: ['race', 'horserace'],
  description: 'Race your horse — bet on it winning',
  category: 'economy',
  cooldown: 10,

  async execute (ctx, args) {
    if (args.length < 2) {
      return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription('❌ Usage: `hr <horse-id> <bet>`')] })
    }

    const horseId  = parseInt(args[0], 10)
    const betAmount = parseInt(args[1], 10)

    if (isNaN(horseId) || isNaN(betAmount) || betAmount <= 0) {
      return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription('❌ Usage: `hr <horse-id> <bet>`')] })
    }

    let result
    try {
      result = await economyService.horseRace(ctx.author.id, horseId, betAmount)
    } catch (e) {
      if (e.message === 'HORSE_NOT_OWNED')    return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription(cfg.race.notOwned)] })
      if (e.message === 'INSUFFICIENT_FUNDS') return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription(cfg.race.insufficientFunds)] })
      throw e
    }

    const { won, betAmount: bet, newBalance, horseName } = result

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(won ? cfg.colors.success : cfg.colors.error)
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setTitle(t(won ? cfg.race.winTitle : cfg.race.loseTitle, { horseName }))
          .addFields(
            { name: won ? cfg.race.fieldWon : cfg.race.fieldLost, value: `**${bet.toLocaleString()}** ${COIN}`,         inline: true },
            { name: cfg.race.fieldBalance,                         value: `**${newBalance.toLocaleString()}** ${COIN}`,  inline: true }
          )
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    return [opts.getString('horse'), String(opts.getInteger('bet'))]
  }
})
