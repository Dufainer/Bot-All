import dotenv from 'dotenv'
import { client, userBalances, bankBalances, userInventory } from '../../config/economy.js'
import workCommand from './work.js'
import salaryCommand from './salary.js'
import betCommand from './bet.js'
import depositCommand from './deposit.js'
import withdrawCommand from './withdraw.js'
import transferCommand from './pay.js'
import helpCommand from './help.js'
import robCommand from './rob.js'
import adminGiveCommand from './adminGive.js'
import fishingCommand from './fishing.js'
import lotteryCommand from './lottery.js'
import raceHorses from './horseRace.js'
import { storeItems } from '../../data/Economia.js'
dotenv.config()

const prefixes = ['$', '!', '/']

client.on('ready', () => {
  console.log(`Conectado como ${client.user.tag}!`)
})

client.on('messageCreate', (msg) => {
  const args = msg.content.split(' ').slice(1)

  for (const prefix of prefixes) {
    if (msg.content.startsWith(`${prefix}work`)) {
      workCommand(msg, userBalances)
      break
    } else if (msg.content.startsWith(`${prefix}salary`) || msg.content.startsWith(`${prefix}sal`)) {
      salaryCommand(msg, args, userBalances, bankBalances)
      break
    } else if (msg.content.startsWith(`${prefix}bet`)) {
      betCommand(msg, args, userBalances)
      break
    } else if (msg.content.startsWith(`${prefix}deposit`) || msg.content.startsWith(`${prefix}dep`)) {
      depositCommand(msg, args, userBalances, bankBalances)
      break
    } else if (msg.content.startsWith(`${prefix}withdraw`) || msg.content.startsWith(`${prefix}with`)) {
      withdrawCommand(msg, args, userBalances, bankBalances)
      break
    } else if (msg.content.startsWith(`${prefix}pay`)) {
      transferCommand(msg, args, userBalances, bankBalances)
      break
    } else if (msg.content.startsWith(`${prefix}help`)) {
      helpCommand(msg)
      break
    } else if (msg.content.startsWith(`${prefix}rob`)) {
      robCommand(msg, args, userBalances, bankBalances)
      break
    } else if (msg.content.startsWith(`${prefix}give`)) {
      adminGiveCommand(msg, args, userBalances)
      break
    } else if (msg.content.startsWith(`${prefix}lottery`) || msg.content.startsWith(`${prefix}lot`)) {
      lotteryCommand(msg, args, userBalances)
      break
    } else if (msg.content.startsWith(`${prefix}fish`)) {
      fishingCommand(msg, userBalances)
      break
    } else if (msg.content.startsWith(`${prefix}hr`)) {
      raceHorses(msg, userBalances, userInventory)
      break
    }
  }
})
