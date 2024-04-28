import { EmbedBuilder } from 'discord.js'

function depositCommand (msg, args, userBalances, bankBalances) {
  let depositAmount

  if (args[0].toLowerCase() === 'all') {
    depositAmount = userBalances.get(msg.author.id) || 0
  } else {
    depositAmount = parseInt(args[0])
  }

  if (isNaN(depositAmount) || depositAmount <= 0) {
    const invalidAmountEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('❌ **Cantidad de depósito no válida.**')
    return msg.channel.send({ embeds: [invalidAmountEmbed] })
  }

  const currentBalance = userBalances.get(msg.author.id) || 0

  if (depositAmount > currentBalance) {
    const insufficientBalanceEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('💸 **Saldo insuficiente para el depósito.**')
    return msg.channel.send({ embeds: [insufficientBalanceEmbed] })
  }

  userBalances.set(msg.author.id, currentBalance - depositAmount)
  bankBalances.set(msg.author.id, (bankBalances.get(msg.author.id) || 0) + depositAmount)

  const successEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setDescription(`:bank: **Depósito exitoso de ${depositAmount} monedas al banco.**`)

  const currentBankBalance = bankBalances.get(msg.author.id) || 0
  successEmbed.setFooter({
    text: `Saldo actual en el banco: ${currentBankBalance} monedas`
  })

  msg.channel.send({ embeds: [successEmbed] })
}

export default depositCommand
