import { EmbedBuilder } from 'discord.js'

function betCommand (msg, args, userBalances) {
  const amount = args[0].toLowerCase() === 'all' ? (userBalances.get(msg.author.id) || 0) : parseInt(args[0])
  let betType = args[1]
  let betNumber

  if (!isNaN(betType)) {
    betNumber = parseInt(betType)
    betType = 'number'
  }

  const userBalance = userBalances.get(msg.author.id) || 0

  if (isNaN(amount) || amount <= 0) {
    const invalidAmountEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('❌ **Cantidad de apuesta no válida. Debe ser un número positivo.**')
    return msg.channel.send({ embeds: [invalidAmountEmbed] })
  }

  if (amount > userBalance) {
    const insufficientBalanceEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('💸 **Saldo insuficiente. No puedes apostar más de lo que tienes.**')
    return msg.channel.send({ embeds: [insufficientBalanceEmbed] })
  }

  if (!['red', 'black', 'low', 'high', 'number'].includes(betType)) {
    const invalidBetTypeEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('❌ **Tipo de apuesta no válido. Tipos disponibles: red, black, low, high, number.**')
    return msg.channel.send({ embeds: [invalidBetTypeEmbed] })
  }

  if (betType === 'number' && (isNaN(betNumber) || betNumber < 0 || betNumber > 36)) {
    const invalidNumberEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('❌ **Número de apuesta no válido. Debe ser un número entre 0 y 36.**')
    return msg.channel.send({ embeds: [invalidNumberEmbed] })
  }

  const rouletteResult = Math.floor(Math.random() * 37)
  const caseW = rouletteResult % 2 === 0 ? '**Red**' : '**Black**'
  const win = (betType === 'red' && rouletteResult % 2 === 0) ||
                (betType === 'black' && rouletteResult % 2 === 1) ||
                (betType === 'low' && rouletteResult >= 1 && rouletteResult <= 18) ||
                (betType === 'high' && rouletteResult >= 19 && rouletteResult <= 36) ||
                (betType === 'number' && rouletteResult === betNumber)

  const newBalance = win ? userBalance + amount : userBalance - amount
  userBalances.set(msg.author.id, newBalance)

  const resultEmbed = new EmbedBuilder()
    .setColor(win ? '#00FF00' : '#FF0000')
    .setDescription(`${win ? ':tada: **¡Ganaste!**' : ':x: **¡Perdiste!**'} Resultado de la ruleta: ${rouletteResult} (${caseW}). Tu nuevo saldo es **${newBalance} <:Coin:1232427012702994533>**.`)

  msg.channel.send({ embeds: [resultEmbed] })
}

export default betCommand
