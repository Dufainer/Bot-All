import { EmbedBuilder } from 'discord.js'

function transferCommand (msg, args, userBalances) {
  if (args.length !== 2) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setDescription('❌ **Uso incorrecto del comando.** Usa `/transfer <@usuario> <cantidad>`')

    return msg.channel.send({ embeds: [embed] })
  }

  const mention = args[0]
  const amount = args[1].toLowerCase() === 'all' ? (userBalances.get(msg.author.id) || 0) : parseInt(args[1])

  if (isNaN(amount) || amount <= 0) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setDescription('❌ **Cantidad de transferencia no válida.**')

    return msg.channel.send({ embeds: [embed] })
  }

  const targetUserId = mention.replace('<@', '').replace('>', '')
  const currentBalance = userBalances.get(msg.author.id) || 0

  if (amount > currentBalance) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setDescription('💸 **Saldo insuficiente para la transferencia.**')
      .addFields({ name: 'Saldo actual', value: `${currentBalance} monedas` })

    return msg.channel.send({ embeds: [embed] })
  }

  userBalances.set(msg.author.id, currentBalance - amount)
  userBalances.set(targetUserId, (userBalances.get(targetUserId) || 0) + amount)

  const embed = new EmbedBuilder()
    .setColor('#2ECC71')
    .setDescription(`:money_with_wings: **Transferencia de ${amount} monedas a <@${targetUserId}> realizada con éxito.**`)
    .setThumbnail('https://cdn.discordapp.com/attachments/1227025952924635147/1227040773514592266/36572029-fc29-4f4f-80f0-505ef7d1477f-removebg-preview.png')
    .addFields({ name: 'Nuevo saldo', value: `${currentBalance - amount} monedas` })

  msg.channel.send({ embeds: [embed] })
}

export default transferCommand
