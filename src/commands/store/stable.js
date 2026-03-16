import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { storeService } from '../../services/StoreService.js'
import { cfg, t } from '../../config/messages.js'

export default new Command({
  name: 'stable',
  aliases: ['st', 'horses'],
  description: 'View your horse stable',
  category: 'store',
  cooldown: 5,

  async execute (ctx) {
    const horses = await storeService.getHorses(ctx.author.id)

    if (!horses.length) {
      return ctx.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(cfg.colors.empty)
            .setTitle(cfg.stable.title)
            .setDescription(cfg.stable.emptyDescription)
            .setThumbnail(ctx.author.displayAvatarURL())
        ]
      })
    }

    const sep = cfg.stable.fieldSeparator
    const fields = horses.map(h => ({
      name: t(cfg.stable.horseLabel, { name: h.name, quantity: h.quantity }),
      value: [
        t(cfg.stable.fieldSpeed,     { speed: h.speed }),
        t(cfg.stable.fieldWinChance, { chance: Math.round(h.winChance * 100) }),
        t(cfg.stable.fieldOdds,      { odds: h.bettingOdds }),
        t(cfg.stable.fieldId,        { id: h.id })
      ].join(sep),
      inline: false
    }))

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(cfg.colors.stable)
          .setTitle(cfg.stable.title)
          .setDescription(t(cfg.stable.description, {
            count: horses.length,
            plural: horses.length !== 1 ? 's' : ''
          }))
          .addFields(...fields)
          .setThumbnail(ctx.author.displayAvatarURL())
          .setFooter({ text: ctx.author.username })
          .setTimestamp()
      ]
    })
  },

  fromInteraction: () => []
})
