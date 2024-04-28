import { EmbedBuilder } from 'discord.js'

function fishingCommand (msg, userBalances) {
  const fishTypes = [
    { name: 'Sardina', min: 5, max: 15, probability: 0.4 },
    { name: 'Trucha', min: 10, max: 25, probability: 0.3 },
    { name: 'Salmón', min: 20, max: 40, probability: 0.2 },
    { name: 'Dorado', min: 30, max: 60, probability: 0.1 },
    { name: 'Tiburón', min: 50, max: 100, probability: 0.05 }
  ]

  const random = Math.random()

  let selectedFish = null
  let cumulativeProbability = 0

  for (const fish of fishTypes) {
    cumulativeProbability += fish.probability

    if (random < cumulativeProbability) {
      selectedFish = fish
      break
    }
  }

  const fishValue = Math.floor(Math.random() * (selectedFish.max - selectedFish.min + 1)) + selectedFish.min

  const userBalance = userBalances.get(msg.author.id) || 0
  const newBalance = userBalance + fishValue
  userBalances.set(msg.author.id, newBalance)

  const fishingEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setDescription(`🎣 ¡Has pescado un ${selectedFish.name} y ganado ${fishValue} monedas! Tu nuevo saldo es **${newBalance} <:Coin:1232427012702994533>**.`)

  msg.channel.send({ embeds: [fishingEmbed] })
}

export default fishingCommand
