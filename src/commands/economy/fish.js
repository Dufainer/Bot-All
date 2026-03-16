import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { COIN } from '../../i18n/en.js'
import { cfg, t } from '../../config/messages.js'

export default new Command({
  name: 'fish',
  description: 'Go fishing and earn coins',
  category: 'economy',
  cooldown: 15,

  async execute (ctx) {
    const { fish, value, newBalance } = await economyService.fish(ctx.author.id)
    const emoji = cfg.fish.emojis[fish] ?? cfg.fish.emojis._default

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(cfg.colors.fishing)
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setTitle(t(cfg.fish.title, { emoji, fish }))
          .addFields(
            { name: cfg.fish.fieldEarned,  value: `**+${value.toLocaleString()}** ${COIN}`,      inline: true },
            { name: cfg.fish.fieldBalance, value: `**${newBalance.toLocaleString()}** ${COIN}`,  inline: true }
          )
          .setTimestamp()
      ]
    })
  },

  fromInteraction: () => []
})
