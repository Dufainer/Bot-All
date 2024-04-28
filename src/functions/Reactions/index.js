import { avatar } from './avatar.js'
import { client } from '../../config/economy.js'

const prefixes = ['h', '!', '/']

client.on('ready', () => {
  console.log(`Conectado como ${client.user.tag}!`)
})

// Evento que se ejecuta cuando se recibe un mensaje
client.on('messageCreate', (msg) => {
  const args = msg.content.split(' ').slice(1)

  for (const prefix of prefixes) {
    if (msg.content.startsWith(`${prefix}avatar`)) {
      avatar(msg, args)
      break
    }
  }
})
