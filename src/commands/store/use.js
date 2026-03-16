import { EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { storeService } from '../../services/StoreService.js'
import { cfg, t } from '../../config/messages.js'

export default new Command({
  name: 'use',
  description: 'Use a role item from your inventory',
  category: 'store',
  cooldown: 5,

  async execute (ctx, args) {
    const itemId = parseInt(args[0], 10)
    if (isNaN(itemId) || itemId <= 0) {
      return ctx.reply(cfg.use.usageHint)
    }

    let item
    try {
      item = await storeService.useItem(ctx.author.id, itemId)
    } catch (e) {
      if (e.message === 'ITEM_NOT_FOUND')   return ctx.reply(cfg.use.notFound)
      if (e.message === 'NOT_IN_INVENTORY') return ctx.reply(cfg.use.notOwned)
      if (e.message === 'NO_ROLE')          return ctx.reply(cfg.use.noRole)
      throw e
    }

    // Assign the role
    let roleAssigned = false
    if (ctx.guild) {
      try {
        const member = await ctx.guild.members.fetch(ctx.author.id)
        await member.roles.add(item.roleId)
        roleAssigned = true
      } catch {
        // Bot may lack Manage Roles — still consumed, just warn
      }
    }

    ctx.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(cfg.colors.success)
          .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
          .setTitle(cfg.use.title)
          .setDescription(t(cfg.use.description, { name: item.name }))
          .addFields(
            { name: cfg.use.fieldRole,   value: `<@&${item.roleId}>`, inline: true },
            { name: cfg.use.fieldStatus, value: roleAssigned ? cfg.use.statusGranted : cfg.use.statusFailed, inline: true }
          )
          .setTimestamp()
      ]
    })
  },

  fromInteraction (opts) {
    return [opts.getString('item')]
  }
})
