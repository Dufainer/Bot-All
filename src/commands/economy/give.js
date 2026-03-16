import { Command } from '../../core/Command.js'
import { economyService } from '../../services/EconomyService.js'
import { parseMention } from '../../utils/validators.js'
import { MSGS } from '../../i18n/en.js'

export default new Command({
  name: 'give',
  aliases: ['admin-give'],
  description: '(Admin) Give coins to a user',
  category: 'economy',
  cooldown: 3,
  adminOnly: true,

  async execute (ctx, args) {
    const mention = args[0]
    const amount = parseInt(args[1], 10)

    if (!mention || isNaN(amount) || amount <= 0) {
      return ctx.reply('❌ Usage: `give <@user> <amount>`')
    }

    const targetId = parseMention(mention)
    await economyService.adminGive(targetId, amount)
    ctx.reply(MSGS.give.success(amount, targetId))
  },

  fromInteraction (opts) {
    const user = opts.getUser('user')
    return [`<@${user.id}>`, String(opts.getInteger('amount'))]
  }
})
