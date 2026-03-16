import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { storeService } from '../../services/StoreService.js'
import { MSGS } from '../../i18n/en.js'
import { cfg } from '../../config/messages.js'

export default new Command({
  name: 'buy',
  description: 'Purchase an item from the shop',
  category: 'store',
  cooldown: 5,

  async execute (ctx, args) {
    const itemId = parseInt(args[0], 10)
    if (isNaN(itemId) || itemId <= 0) {
      return ctx.reply('❌ Usage: `buy <item ID>`')
    }

    let item
    try {
      item = await storeService.buy(ctx.author.id, itemId)
    } catch (e) {
      if (e.message === 'ITEM_NOT_FOUND') return ctx.reply(MSGS.buy.notFound)
      if (e.message === 'INSUFFICIENT_FUNDS') {
        const shopItem = await storeService.getItem(itemId)
        return ctx.reply(MSGS.buy.noBalance(shopItem?.price ?? 0))
      }
      throw e
    }

    // Assign role reward if the item has one configured
    if (item.roleId && ctx.guild) {
      try {
        const member = await ctx.guild.members.fetch(ctx.author.id)
        await member.roles.add(item.roleId)
      } catch {
        // Silently ignore — bot may lack Manage Roles permission
      }
    }

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(cfg.colors.success)
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setTitle(cfg.buy.title)
          .setDescription(MSGS.buy.success(item.name, item.price))
          .addFields(
            item.roleId
              ? [{ name: cfg.buy.roleRewardLabel, value: `<@&${item.roleId}>`, inline: true }]
              : []
          )
          .setThumbnail(cfg.buy.thumbnail)
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    return [opts.getString('item')]
  }
})
