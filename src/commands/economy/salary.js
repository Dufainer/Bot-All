import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { parseMention } from '../../utils/validators.js'
import { COIN } from '../../i18n/en.js'
import { cfg, t } from '../../config/messages.js'

export default new Command({
  name: 'salary',
  aliases: ['sal', 'balance', 'bal'],
  description: 'View your wallet & bank balance (or another user\'s)',
  category: 'economy',
  cooldown: 3,

  async execute (ctx, args) {
    const targetId = args[0] ? parseMention(args[0]) : ctx.author.id
    const { wallet, bank } = await economyService.getUser(targetId)
    const total = wallet + bank

    const targetUser = ctx.client.users.cache.get(targetId) ?? ctx.author
    const isSelf     = targetId === ctx.author.id
    const ownerLabel = isSelf
      ? cfg.salary.ownLabel
      : t(cfg.salary.otherLabel, { username: targetUser.username })

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(cfg.colors.info)
          .setAuthor({ name: ownerLabel, iconURL: targetUser.displayAvatarURL() })
          .addFields(
            { name: cfg.salary.fieldWallet, value: `${wallet.toLocaleString()} ${COIN}`, inline: true },
            { name: cfg.salary.fieldBank,   value: `${bank.toLocaleString()} ${COIN}`,   inline: true },
            { name: cfg.salary.fieldTotal,  value: `${total.toLocaleString()} ${COIN}`,  inline: true }
          )
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    const user = opts.getUser('user')
    return user ? [`<@${user.id}>`] : []
  }
})
