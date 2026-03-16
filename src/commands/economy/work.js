import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { COIN } from '../../i18n/en.js'
import { cfg, t } from '../../config/messages.js'

export default new Command({
  name: 'work',
  description: 'Work a random job and earn coins',
  category: 'economy',
  cooldown: 30,

  async execute (ctx) {
    const { job, amount } = await economyService.work(ctx.author.id)
    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(cfg.colors.success)
          .setAuthor({
            name: ctx.author.username,
            iconURL: ctx.author.displayAvatarURL()
          })
          .setTitle(cfg.work.title)
          .setDescription(t(cfg.work.description, { job, amount, coin: COIN }))
          .setTimestamp()
      ]
    })
  },

  fromInteraction: () => []
})
