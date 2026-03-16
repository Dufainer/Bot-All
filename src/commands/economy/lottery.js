import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { COIN } from '../../i18n/en.js'
import { LOTTERY_TICKET_PRICE, LOTTERY_PRIZES } from '../../data/gameData.js'
import { cfg, t } from '../../config/messages.js'

export default new Command({
  name: 'lottery',
  aliases: ['lot'],
  description: 'Buy a lottery ticket and pick a number 000–999',
  category: 'economy',
  cooldown: 10,

  async execute (ctx, args) {
    if (!args.length) {
      return ctx.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(cfg.colors.lottery)
            .setTitle(cfg.lottery.title)
            .setDescription(t(cfg.lottery.infoDescription, { price: LOTTERY_TICKET_PRICE, coin: COIN }))
            .addFields(
              { name: `${cfg.lottery.placeLabels[0]} prize`, value: `${LOTTERY_PRIZES[0].toLocaleString()} ${COIN}`, inline: true },
              { name: `${cfg.lottery.placeLabels[1]} prize`, value: `${LOTTERY_PRIZES[1].toLocaleString()} ${COIN}`, inline: true },
              { name: `${cfg.lottery.placeLabels[2]} prize`, value: `${LOTTERY_PRIZES[2].toLocaleString()} ${COIN}`, inline: true }
            )
            .setFooter({ text: cfg.lottery.footer })
        ]
      })
    }

    const userNumber = parseInt(args[0], 10)
    if (isNaN(userNumber) || userNumber < 0 || userNumber > 999) {
      return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription('❌ Choose a number between **000** and **999**.') ] })
    }

    let result
    try {
      result = await economyService.lottery(ctx.author.id, userNumber)
    } catch (e) {
      if (e.message === 'INSUFFICIENT_FUNDS') {
        const { wallet } = await economyService.getUser(ctx.author.id)
        return ctx.reply({ embeds: [new EmbedBuilder().setColor(cfg.colors.error).setDescription(
          t(cfg.lottery.insufficientFunds, { wallet, price: LOTTERY_TICKET_PRICE, coin: COIN })
        )] })
      }
      throw e
    }

    const { winningNumbers, place, prize, finalBalance } = result
    const won = prize > 0
    const placeLabel = cfg.lottery.placeLabels[place]

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(won ? cfg.colors.success : cfg.colors.error)
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setTitle(won ? t(cfg.lottery.winTitle, { place: placeLabel }) : cfg.lottery.loseTitle)
          .addFields(
            { name: cfg.lottery.fieldYourNumber,     value: `\`${String(userNumber).padStart(3, '0')}\``, inline: true },
            { name: cfg.lottery.fieldWinningNumbers, value: winningNumbers.map((n, i) => `${cfg.lottery.placeLabels[i]}: \`${String(n).padStart(3, '0')}\``).join('\n'), inline: true },
            ...(won ? [{ name: cfg.lottery.fieldPrize,   value: `**+${prize.toLocaleString()}** ${COIN}`,         inline: true }] : []),
            { name: cfg.lottery.fieldBalance,        value: `**${finalBalance.toLocaleString()}** ${COIN}`,       inline: true }
          )
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    const num = opts.getInteger('number')
    return num !== null ? [String(num)] : []
  }
})
