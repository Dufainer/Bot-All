import { EmbedBuilder } from 'discord.js'

function robCommand (msg, args, userBalances, bankBalances) {
  if (!args[0]) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setDescription('❌ **Por favor, menciona a un usuario para robar.**')

    return msg.channel.send({ embeds: [embed] })
  }

  const mention = args[0]
  const targetUserId = mention.replace('<@', '').replace('>', '')

  if (!userBalances.has(targetUserId)) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setDescription('❌ **Usuario no encontrado.**')

    return msg.channel.send({ embeds: [embed] })
  }

  const targetUserBalance = userBalances.get(targetUserId) || 0
  const targetUserBankBalance = bankBalances.get(targetUserId) || 0

  if (targetUserBalance === 0) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setDescription('💸 **Este usuario no tiene dinero para robar.**')
      .addFields({ name: 'Saldo del usuario', value: `${targetUserBalance} monedas` })

    return msg.channel.send({ embeds: [embed] })
  }

  const stolenAmount = targetUserBalance

  userBalances.set(msg.author.id, (userBalances.get(msg.author.id) || 0) + stolenAmount)
  userBalances.set(targetUserId, targetUserBalance - stolenAmount)

  const embed = new EmbedBuilder()
    .setColor('#2ECC71')
    .setDescription(`🔫 **Has robado con éxito ${stolenAmount} monedas de ${mention}.**`)
    .addFields({ name: 'Tu nuevo saldo', value: `${(userBalances.get(msg.author.id) || 0) - stolenAmount} monedas` })

  msg.channel.send({ embeds: [embed] })
}

export default robCommand
