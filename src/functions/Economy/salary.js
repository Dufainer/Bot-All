import { EmbedBuilder } from 'discord.js'

function salaryCommand (msg, args, userBalances, bankBalances) {
  let targetUserId = msg.author.id

  if (args.length > 0) {
    const mention = args[0]
    targetUserId = mention.replace('<@', '').replace('>', '').replace('!', '').replace('@', '')
  }

  const userBalance = userBalances.get(targetUserId) || 0
  const bankBalance = bankBalances.get(targetUserId) || 0
  const totalBalance = userBalance + bankBalance

  const user = msg.client.users.cache.get(targetUserId)
  const bankOwner = (targetUserId === msg.author.id) ? 'Your' : `${user ? user.username : 'Unknown user'}'s`

  const embed = new EmbedBuilder()

  embed.setColor('#FFD700')
  embed.setTitle(`${bankOwner} Wallet`)
  embed.setDescription(`💰: ${userBalance}<:Coin:1232427012702994533> 💲🏦: ${bankBalance}<:Coin:1232427012702994533> 💲Total: ${totalBalance}<:Coin:1232427012702994533> 💲`)

  msg.channel.send({ embeds: [embed] })
}

export default salaryCommand
