import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import { Command } from '../../core/Command.js'
import { storeService } from '../../services/StoreService.js'
import { COIN } from '../../i18n/en.js'
import { cfg, t } from '../../config/messages.js'

export function buildStorePage (items, page) {
  const misc   = items.filter(i => i.category !== 'Horse')
  const horses = items.filter(i => i.category === 'Horse')

  if (page === 0) {
    return new EmbedBuilder()
      .setColor(cfg.colors.store)
      .setTitle(cfg.store.title)
      .setDescription(
        `${cfg.store.miscHeader} — ${misc.length} items\n\n` +
        misc.map(i =>
          `\`${String(i.id).padStart(2, '0')}\` **${i.name}** \u2014 ${i.price.toLocaleString()} ${COIN}`
        ).join('\n') +
        `\n\n${cfg.store.buyHint}`
      )
      .setImage(cfg.store.image)
      .setFooter({ text: t(cfg.store.miscFooter, { total: items.length }) })
  }

  return new EmbedBuilder()
    .setColor(cfg.colors.store)
    .setTitle(cfg.store.title)
    .setDescription(
      `${cfg.store.horsesHeader} — ${horses.length} available\n\n` +
      horses.map(i =>
        `\`${String(i.id).padStart(2, '0')}\` **${i.name}** \u2014 ${i.price.toLocaleString()} ${COIN}  ·  ⚡ ${i.speed}  ·  🎲 ${Math.round(i.winChance * 100)}% win`
      ).join('\n') +
      `\n\n${cfg.store.buyHorseHint}`
    )
    .setImage(cfg.store.image)
    .setFooter({ text: t(cfg.store.horsesFooter, { total: items.length }) })
}

export function buildStoreRow (page) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('store:0')
      .setLabel(cfg.store.btnMisc)
      .setStyle(page === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('store:1')
      .setLabel(cfg.store.btnHorses)
      .setStyle(page === 1 ? ButtonStyle.Primary : ButtonStyle.Secondary)
      .setDisabled(page === 1)
  )
}

export default new Command({
  name: 'store',
  aliases: ['shop'],
  description: 'Browse the item shop',
  category: 'store',
  cooldown: 3,

  async execute (ctx) {
    const items = await storeService.getItems()
    ctx.channel.send({
      embeds: [buildStorePage(items, 0)],
      components: [buildStoreRow(0)]
    })
  },

  fromInteraction: () => []
})
