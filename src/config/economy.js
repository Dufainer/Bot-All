// Importa la librería Discord.js
import { Client, GatewayIntentBits } from 'discord.js'
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
})

// Base de datos simulada para almacenar saldos de usuarios y saldos del banco
const userBalances = new Map()
const bankBalances = new Map()
const pendingTransfers = new Map()
const userInventory = new Map()

export { client, userBalances, bankBalances, pendingTransfers, userInventory }
