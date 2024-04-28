import { EmbedBuilder } from 'discord.js'

async function raceHorses (msg, userBalances, userInventory) {
  const args = msg.content.split(' ').slice(1)
  if (args.length < 2) {
    return msg.channel.send('Comando inválido. Usa `!carrera <ID del caballo> <monto>`')
  }
  const [horseIdStr, betAmountStr] = args
  const selectedHorseId = parseInt(horseIdStr)
  const betAmount = parseInt(betAmountStr)

  try {
    if (!userInventory.has(selectedHorseId)) {
      throw new Error('¡Lo siento! No posees el caballo seleccionado en tu inventario.')
    }

    if (userBalances.get(msg.author.id) < betAmount) {
      throw new Error('¡Lo siento! No tienes suficiente saldo para realizar esta apuesta.')
    }

    const winningHorseId = simulateRace()

    const winnings = selectedHorseId === winningHorseId ? betAmount * 2 : 0
    const resultMessage = `¡${selectedHorseId === winningHorseId ? 'Felicidades!' : 'Lo siento!'} ${selectedHorseId === winningHorseId ? 'Has ganado' : 'Tu caballo no ha ganado'} la carrera. Ganaste ${winnings} monedas.`

    userBalances.set(msg.author.id, userBalances.get(msg.author.id) + winnings)

    const embed = new EmbedBuilder()
      .setTitle('Resultado de la carrera de caballos')
      .setDescription(resultMessage)
      .addField('Caballo ganador', `Caballo ${winningHorseId}`)
      .addField('Premio', `${winnings} monedas`)
      .setColor(selectedHorseId === winningHorseId ? '#00ff00' : '#ff0000')
      .setTimestamp()

    msg.channel.send(embed)
  } catch (error) {
    msg.channel.send(error.message)
  }
}

function simulateRace () {
  return Math.floor(Math.random() * 3) + 1
}

export default raceHorses
