import { EmbedBuilder } from 'discord.js'
import fetch from 'node-fetch'

async function nekoCommand (msg) {
  if (!msg.content.startsWith('$a')) return
  try {
    const response = await fetch('https://nekos.pro/api/neko')
    const data = await response.json()

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('Personaje Aleatorio')
      .setImage(data.url)
      .setFooter('ID del personaje: ' + data.id)

    msg.channel.send({ embeds: [embed] })
  } catch (error) {
    console.error('Error al obtener el personaje aleatorio:', error)
    msg.reply('Hubo un error al obtener el personaje aleatorio. Por favor, inténtalo de nuevo más tarde.')
  }
}

export default nekoCommand
