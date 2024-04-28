import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js'

import { storeItems } from '../../data/Economia.js'

async function storeCommand (msg, args) {
  if (!args.length) {
    let page = 1

    const totalPages = Math.ceil(storeItems.length / 5)

    const startIndex = (page - 1) * 5
    const endIndex = Math.min(startIndex + 5, storeItems.length)

    const fields = storeItems
      .slice(startIndex, endIndex)
      .map((item, index) => ({
        name: `\`${startIndex + index + 1}\`: ${item.name}`,
        value: `Precio: ${item.price} <:Coin:1232427012702994533>`
      }))

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('Tienda')
      .setDescription(
        '¡Bienvenido a la tienda! Aquí puedes comprar diferentes ítems para mejorar tu experiencia en el universo.'
      )
      .addFields(fields)
      .setImage(
        'https://cdn.discordapp.com/attachments/1227025952924635147/1227027324151795863/athena_store.png'
      )
      .setFooter({ text: `Página ${page}/${totalPages}` })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`previous_${page}`)
        .setLabel('Anterior')
        .setStyle('Secondary'),
      new ButtonBuilder()
        .setCustomId(`next_${page}`)
        .setLabel('Siguiente')
        .setStyle('Secondary')
    )

    const message = await msg.channel.send({
      embeds: [embed],
      components: [row]
    })

    const filter = (interaction) => interaction.user.id === msg.author.id
    const collector = message.createMessageComponentCollector({
      filter,
      time: 60000
    })

    collector.on('collect', async (interaction) => {
      if (interaction.customId.startsWith('previous')) {
        page = Math.max(page - 1, 1)
      } else if (interaction.customId.startsWith('next')) {
        page = Math.min(page + 1, totalPages)
      }

      const newStartIndex = (page - 1) * 5
      const newEndIndex = Math.min(newStartIndex + 5, storeItems.length)
      const newFields = storeItems
        .slice(newStartIndex, newEndIndex)
        .map((item, index) => ({
          name: `\`${newStartIndex + index + 1}\`: ${item.name}`,
          value: `Precio: ${item.price} <:Coin:1232427012702994533>`
        }))

      const newEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('Tienda')
        .setDescription(
          '¡Bienvenido a la tienda! Aquí puedes comprar diferentes ítems para mejorar tu experiencia de pesca.'
        )
        .addFields(newFields)
        .setImage(
          'https://cdn.discordapp.com/attachments/1227025952924635147/1227027324151795863/athena_store.png'
        )
        .setFooter({ text: `Página ${page}/${totalPages}` })

      await interaction.update({ embeds: [newEmbed] })
    })

    collector.on('end', () => message.edit({ components: [] }))
  }
}

export { storeCommand }
