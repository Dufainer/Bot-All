import { EmbedBuilder } from 'discord.js'
import { workMsj } from '../../data/Economia.js'

function workCommand (msg, userBalances) {
  const jobs = workMsj

  const randomJob = jobs[Math.floor(Math.random() * jobs.length)]

  const salario =
    Math.floor(Math.random() * (randomJob.maxPay - randomJob.minPay + 1)) +
    randomJob.minPay

  const currentBalance = userBalances.get(msg.author.id) || 0

  userBalances.set(msg.author.id, currentBalance + salario)

  const embed = new EmbedBuilder()

  const img = 'Null'

  embed.setColor('#FFD700')
  embed.setTitle('✨Misión completada✨')
  embed.setDescription(
    `**Has trabajado ${randomJob.name} y has ganado ${salario} <:Coin:1232427012702994533>**`
  )
  embed.setFooter({
    text: `${msg.author.username}`,
    iconURL: `${msg.author.displayAvatarURL()}`
  })

  msg.channel.send({ embeds: [embed] })
}

export default workCommand
