import { storeCommand } from './store.js'
import { inventoryCommand } from '../Store/inventory.js'
import { client, userBalances, bankBalances, userInventory } from '../../config/economy.js'
import { storeItems } from '../../data/Economia.js'
import { buyItem } from './buyItems.js'
import { stableCommand } from './horseStable.js'
const prefixes = ['$', '!', '/']

client.on('ready', () => {
  console.log(`Conectado como ${client.user.tag}!`)
})

client.on('messageCreate', (msg) => {
  const args = msg.content.split(' ').slice(1)

  for (const prefix of prefixes) {
    if (msg.content.startsWith(`${prefix}store`)) {
      storeCommand(msg, args, userBalances, userInventory)
      break
    } else if (msg.content.startsWith(`${prefix}inventory`) || msg.content.startsWith(`${prefix}inv`)) {
      inventoryCommand(msg, userBalances, userInventory)
      break
    } else if (msg.content.startsWith(`${prefix}buy`)) {
      const itemId = parseInt(args[0])
      buyItem(msg, itemId, userBalances, userInventory)
      break
    } else if (msg.content.startsWith(`${prefix}stable`) || msg.content.startsWith(`${prefix}st`)) {
      stableCommand(msg, userBalances, userInventory)
      break
    }
  }
})
