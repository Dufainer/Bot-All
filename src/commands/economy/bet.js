import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { parseBetType } from '../../utils/validators.js'
import { MSGS, COIN } from '../../i18n/en.js'
import { cfg } from '../../config/messages.js'

export default new Command({
  name: 'bet',
  aliases: ['roulette'],
  description: 'Bet on a roulette spin: red · black · low · high · 0-36',
  category: 'economy',
  cooldown: 5,

  async execute (ctx, args) {
    if (!args[0] || !args[1]) {
      return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription('❌ Usage: `bet <amount|all> <red|black|low|high|0-36>`')] })
    }

    const { type, number: betNumber, error: typeErr } = parseBetType(args[1])
    if (typeErr) return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription(`❌ ${typeErr}`)] })

    let result
    try {
      result = await economyService.bet(ctx.author.id, args[0], type, betNumber)
    } catch (e) {
      if (e.message === 'INVALID_AMOUNT')    return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription(MSGS.errors.invalidAmount)] })
      if (e.message === 'INSUFFICIENT_FUNDS') return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription(MSGS.errors.insufficientWallet)] })
      throw e
    }

    const { roll, color, won, amount, newBalance } = result
    const colorEmoji = cfg.bet.colorEmojis[color] ?? cfg.bet.colorEmojis._default
    const colorLabel = color.charAt(0).toUpperCase() + color.slice(1)

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(won ? cfg.colors.success : cfg.colors.error)
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setTitle(won ? cfg.bet.winTitle : cfg.bet.loseTitle)
          .addFields(
            { name: cfg.bet.fieldRoll,                    value: `**${roll}**  ${colorEmoji} ${colorLabel}`,         inline: true },
            { name: won ? cfg.bet.fieldWon : cfg.bet.fieldLost, value: `**${amount.toLocaleString()}** ${COIN}`,     inline: true },
            { name: cfg.bet.fieldBalance,                 value: `**${newBalance.toLocaleString()}** ${COIN}`,       inline: true }
          )
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    return [opts.getString('amount'), opts.getString('type')]
  }
})
