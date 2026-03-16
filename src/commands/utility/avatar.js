import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'

export default new Command({
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'Display a user\'s avatar in full resolution',
  category: 'utility',
  cooldown: 3,

  async execute (ctx, args) {
    let user = ctx.author

    if (args[0]) {
      // Prefer resolved user from mentions cache
      const mentionId = args[0].replace(/[<@!>]/g, '')
      const resolved = ctx.client.users.cache.get(mentionId)
      if (resolved) user = resolved
    }

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${user.username}'s Avatar`)
          .setImage(user.displayAvatarURL({ size: 4096, extension: 'png' }))
          .setColor('#5865F2')
      ]
    })
  },

  fromInteraction (opts) {
    const user = opts.getUser('user')
    return user ? [`<@${user.id}>`] : []
  }
})
