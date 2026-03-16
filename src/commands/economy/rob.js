import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { parseMention } from '../../utils/validators.js'
import { MSGS } from '../../i18n/en.js'

const err = (msg) => ({
  embeds: [new EmbedBuilder().setColor('#E74C3C').setDescription(msg)]
})

export default new Command({
  name: 'rob',
  description: 'Steal all wallet coins from another user',
  category: 'economy',
  cooldown: 60,

  async execute (ctx, args) {
    if (!args[0]) return ctx.channel.send(err(MSGS.errors.noMention))

    const targetId = parseMention(args[0])
    if (!targetId) return ctx.channel.send(err(MSGS.errors.noMention))
    if (targetId === ctx.author.id) return ctx.channel.send(err(MSGS.rob.selfRob))

    const stolen = await economyService.rob(ctx.author.id, targetId)

    if (stolen === 0) return ctx.channel.send(err(MSGS.rob.empty))

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#22C55E')
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setDescription(MSGS.rob.success(stolen, targetId))
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    const user = opts.getUser('user')
    return [`<@${user.id}>`]
  }
})
