import { EmbedBuilder } from 'discord.js'

export function avatar (msg) {
  const user = msg.mentions.users.first() || msg.author

  const embed = new EmbedBuilder()
    .setImage(user.displayAvatarURL({ size: 4096 }))

  msg.channel.send({ embeds: [embed] })
}
