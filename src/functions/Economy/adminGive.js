function adminGiveCommand (msg, args, userBalances) {
  if (msg.author.id !== msg.guild.ownerId) {
    return msg.reply('❌ **You do not have permission to use this command.**')
  }

  const mention = args[0]
  const amount = parseInt(args[1])

  if (isNaN(amount) || amount <= 0) {
    return msg.reply('❌ **Invalid amount.**')
  }

  const targetUserId = mention.replace('<@', '').replace('>', '')
  const currentBalance = userBalances.get(targetUserId) || 0

  userBalances.set(targetUserId, currentBalance + amount)

  msg.reply(`:money_with_wings: **Successfully gave ${amount} coins to <@${targetUserId}>.**`)
}

export default adminGiveCommand
