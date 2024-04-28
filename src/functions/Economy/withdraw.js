import { EmbedBuilder } from 'discord.js'

function withdrawCommand (msg, args, userBalances, bankBalances) {
  const withdrawAmount = args[0].toLowerCase() === 'all' ? (bankBalances.get(msg.author.id) || 0) : parseInt(args[0])

  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    const invalidAmountEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('❌ **Cantidad de retiro no válida.**')
    return msg.channel.send({ embeds: [invalidAmountEmbed] })
  }

  const currentBankBalance = bankBalances.get(msg.author.id) || 0

  if (withdrawAmount > currentBankBalance) {
    const insufficientBalanceEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('💸 **Saldo insuficiente para el retiro.**')
    return msg.channel.send({ embeds: [insufficientBalanceEmbed] })
  }

  bankBalances.set(msg.author.id, currentBankBalance - withdrawAmount)
  userBalances.set(msg.author.id, (userBalances.get(msg.author.id) || 0) + withdrawAmount)

  const successEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setDescription(`:bank: **Retirado exitosamente ${withdrawAmount} monedas del banco.**`)

  const currentBalance = userBalances.get(msg.author.id) || 0
  successEmbed.setFooter({
    text: `Saldo actual: ${currentBalance} monedas`
  })

  msg.channel.send({ embeds: [successEmbed] })
}

export default withdrawCommand
