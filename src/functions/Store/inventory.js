import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js'
import { storeItems } from '../../data/Economia.js'

function addItemToInventory (userId, itemId, userInventory) {
  if (!userInventory.has(userId)) {
    userInventory.set(userId, new Map())
  }

  const items = userInventory.get(userId)
  items.set(itemId, (items.get(itemId) || 0) + 1)
}

async function inventoryCommand (msg, userInventory) {
  const userId = msg.author.id

  if (!userInventory.has(userId) || userInventory.get(userId).size === 0) {
    const emptyInventoryEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Inventario Vacío')
      .setDescription('Tu inventario está vacío.')

    return msg.channel.send({ embeds: [emptyInventoryEmbed] })
  }

  const items = userInventory.get(userId)
  const itemEntries = Array.from(items.entries())
  const itemsPerPage = 10
  const totalPages = Math.ceil(itemEntries.length / itemsPerPage)

  let currentPage = 1
  let startIndex = (currentPage - 1) * itemsPerPage
  let endIndex = startIndex + itemsPerPage
  let currentPageItems = itemEntries.slice(startIndex, endIndex)

  const itemDescriptions = currentPageItems.map(([itemId, quantity]) => {
    const item = storeItems.find((i) => i.id === itemId)
    return `**${item.name}**: ${quantity}x`
  })

  let inventoryEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('Inventario')
    .setDescription('Aquí están los ítems que posees:')
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/1227025952924635147/1227038525627564033/b3ea5f68-0e1c-4848-95b9-4dff1c4ce09f-removebg-preview.png'
    )
    .addFields({
      name: 'Ítems',
      value: itemDescriptions.join('\n')
    })
    .setFooter({ text: `Página ${currentPage}/${totalPages}` })

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`previous_${currentPage}`)
      .setLabel('Anterior')
      .setStyle('Secondary'),
    new ButtonBuilder()
      .setCustomId(`next_${currentPage}`)
      .setLabel('Siguiente')
      .setStyle('Secondary')
  )

  const message = await msg.channel.send({
    embeds: [inventoryEmbed],
    components: [row]
  })

  const filter = (interaction) => interaction.user.id === userId
  const collector = message.createMessageComponentCollector({
    filter,
    time: 60000
  })

  collector.on('collect', async (interaction) => {
    if (interaction.customId.startsWith('previous')) {
      currentPage = Math.max(currentPage - 1, 1)
    } else if (interaction.customId.startsWith('next')) {
      currentPage = Math.min(currentPage + 1, totalPages)
    }

    startIndex = (currentPage - 1) * itemsPerPage
    endIndex = startIndex + itemsPerPage
    currentPageItems = itemEntries.slice(startIndex, endIndex)

    const updatedItemDescriptions = currentPageItems.map(
      ([itemId, quantity]) => {
        const item = storeItems.find((i) => i.id === itemId)
        return `**${item.name}**: ${quantity}x`
      }
    )
    inventoryEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Inventario')
      .setDescription('Aquí están los ítems que posees:')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1227025952924635147/1227038525627564033/b3ea5f68-0e1c-4848-95b9-4dff1c4ce09f-removebg-preview.png'
      )
      .addFields({
        name: 'Ítems',
        value: updatedItemDescriptions.join('\n')
      })
      .setFooter({ text: `Página ${currentPage}/${totalPages}` })

    await interaction.update({ embeds: [inventoryEmbed], components: [row] })
  })

  collector.on('end', () => message.edit({ components: [] }))
}

export { addItemToInventory, inventoryCommand }
