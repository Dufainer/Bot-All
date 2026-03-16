import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { storeService } from '../../services/StoreService.js'
import { cfg } from '../../config/messages.js'

/**
 * Build an inventory embed page.
 * @param {object[]} items   - enriched inventory items with quantity
 * @param {number}   page    - 0 = misc, 1 = horses
 * @param {string}   tag     - username for footer
 * @param {string}   avatar  - user avatar URL
 * @returns {{ embed: EmbedBuilder, row: ActionRowBuilder|null }}
 */
export function buildInventoryEmbed (items, page, tag, avatar) {
  const misc   = items.filter(i => i.category !== 'Horse')
  const horses = items.filter(i => i.category === 'Horse')
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  // Determine which pages exist
  const pages = []
  if (misc.length)   pages.push('misc')
  if (horses.length) pages.push('horses')

  // Clamp page to valid range
  const safePage       = Math.min(page, pages.length - 1)
  const currentCategory = pages[safePage]

  let embed
  if (currentCategory === 'misc') {
    embed = new EmbedBuilder()
      .setColor(cfg.colors.inventory)
      .setTitle(cfg.inventory.title)
      .addFields({
        name: `${cfg.inventory.miscHeader} — ${misc.length} type${misc.length !== 1 ? 's' : ''}`,
        value: misc.map(i => `**${i.name}** × ${i.quantity}`).join('\n'),
        inline: false
      })
      .setThumbnail(avatar)
      .setFooter({ text: `${totalItems} item${totalItems !== 1 ? 's' : ''} total  ·  ${tag}${pages.length > 1 ? `  ·  Page ${safePage + 1} / ${pages.length}` : ''}` })
  } else {
    embed = new EmbedBuilder()
      .setColor(cfg.colors.inventory)
      .setTitle(cfg.inventory.title)
      .addFields({
        name: `${cfg.inventory.horsesHeader} — ${horses.length} type${horses.length !== 1 ? 's' : ''}`,
        value: horses.map(i =>
          `**${i.name}** × ${i.quantity}  ·  ⚡ ${i.speed}  ·  🎲 ${Math.round(i.winChance * 100)}% win`
        ).join('\n'),
        inline: false
      })
      .setThumbnail(avatar)
      .setFooter({ text: `${totalItems} item${totalItems !== 1 ? 's' : ''} total  ·  ${tag}${pages.length > 1 ? `  ·  Page ${safePage + 1} / ${pages.length}` : ''}` })
  }

  // Build navigation row only when both categories are present
  let row = null
  if (pages.length > 1) {
    row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('inv:misc')
        .setLabel(cfg.inventory.btnMisc)
        .setStyle(currentCategory === 'misc'   ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === 'misc'),
      new ButtonBuilder()
        .setCustomId('inv:horses')
        .setLabel(cfg.inventory.btnHorses)
        .setStyle(currentCategory === 'horses' ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(currentCategory === 'horses')
    )
  }

  return { embed, row }
}

export default new Command({
  name: 'inventory',
  aliases: ['inv'],
  description: 'View your inventory',
  category: 'store',
  cooldown: 5,

  async execute (ctx) {
    const items = await storeService.getInventory(ctx.author.id)

    if (!items.length) {
      return ctx.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(cfg.colors.empty)
            .setTitle(cfg.inventory.title)
            .setDescription(cfg.inventory.emptyDescription)
            .setThumbnail(ctx.author.displayAvatarURL())
        ]
      })
    }

    const { embed, row } = buildInventoryEmbed(
      items, 0, ctx.author.username, ctx.author.displayAvatarURL()
    )
    ctx.channel.send({ embeds: [embed], components: row ? [row] : [] })
  },

  fromInteraction: () => []
})
