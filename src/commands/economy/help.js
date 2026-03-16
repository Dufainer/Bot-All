import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { cfg } from '../../config/messages.js'

export default new Command({
  name: 'help',
  aliases: ['commands', 'cmds'],
  description: 'Show all available commands',
  category: 'general',
  cooldown: 5,

  async execute (ctx) {
    const s = cfg.help.sections
    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(cfg.colors.info)
          .setTitle(cfg.help.title)
          .setThumbnail(ctx.client.user?.displayAvatarURL() ?? null)
          .addFields(
            { name: s.economy.label, value: s.economy.lines.join('\n'), inline: false },
            { name: s.games.label,   value: s.games.lines.join('\n'),   inline: false },
            { name: s.store.label,   value: s.store.lines.join('\n'),   inline: false },
            { name: s.utility.label, value: s.utility.lines.join('\n'), inline: false }
          )
          .setFooter({ text: cfg.help.footer })
      ]
    })
  },

  fromInteraction: () => []
})
