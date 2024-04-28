import { EmbedBuilder } from 'discord.js'

function lotteryCommand (msg, args, userBalances) {
  const ticketPrice = 100
  const userBalance = userBalances.get(msg.author.id) || 0

  if (!args.length) {
    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('🎟️ ¡Bienvenido a la Gran Lotería! 🎟️')
      .setDescription('Participa en nuestra emocionante lotería y gana premios increíbles. Elige un número de 3 digitos y podrías ser el próximo gran ganador.')
      .addFields(
        { name: '💰 Precio del boleto', value: `${ticketPrice} <:Coin:1232427012702994533>` },
        { name: '🥇 Premio mayor (1er lugar)', value: '10000 <:Coin:1232427012702994533>' },
        { name: '🥈 Segundo lugar (2er lugar)', value: '5000 <:Coin:1232427012702994533>' },
        { name: '🥉 Tercer lugar (3er lugar)', value: '1000 <:Coin:1232427012702994533>' }
      )

    return msg.channel.send({ embeds: [embed] })
  }

  if (userBalance < ticketPrice) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setDescription('💸 **Oh no, parece que no tienes suficientes <:Coin:1232427012702994533> para comprar un boleto de lotería.**')
      .addFields({ name: '💼 Saldo actual', value: `${userBalance} <:Coin:1232427012702994533>` })

    return msg.channel.send({ embeds: [embed] })
  }

  userBalances.set(msg.author.id, userBalance - ticketPrice)

  const winningNumbers = [Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000)]

  if (isNaN(userNumber) || userNumber < 0 || userNumber > 999) {
    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setDescription('❌ **Ups, parece que hubo un error. Debes elegir un número entre 000 y 999.**')

    return msg.channel.send({ embeds: [embed] })
  }

  let prize
  if (winningNumbers.includes(userNumber)) {
    const place = winningNumbers.indexOf(userNumber) + 1
    switch (place) {
      case 1:
        prize = 10000
        break
      case 2:
        prize = 5000
        break
      case 3:
        prize = 1000
        break
    }
  } else {
    prize = 0
  }

  userBalances.set(msg.author.id, userBalances.get(msg.author.id) + prize)

  const embed = new EmbedBuilder()
    .setColor(prize > 0 ? '#2ECC71' : '#E74C3C')
    .setDescription(prize > 0 ? `🎉 ¡Felicidades! Has ganado ${prize} <:Coin:1232427012702994533>.` : '😢 Lo siento, no has ganado esta vez. ¡No te desanimes y sigue intentándolo!')
    .addFields(
      { name: '💼 Tu nuevo saldo', value: `${userBalances.get(msg.author.id)} <:Coin:1232427012702994533>` }
    )

  msg.channel.send({ embeds: [embed] })

  const winningEmbed = new EmbedBuilder()
    .setColor('#3498DB')
    .setTitle('🎟️ Números ganadores 🎟️')
    .setDescription(`🥇 1er lugar: \`${winningNumbers[0]}\`, 🥈 2do lugar: \`${winningNumbers[1]}\`, 🥉 3er lugar: \`${winningNumbers[2]}\`.`)

  return msg.channel.send({ embeds: [winningEmbed] })
}

export default lotteryCommand
