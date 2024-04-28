import { Constants, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js'
import { storeItems } from '../../data/Economia.js'

function addItemToInventory (userId, itemId, userInventory) {
  if (!userInventory.has(userId)) {
    userInventory.set(userId, new Map())
  }

  const items = userInventory.get(userId)
  items.set(itemId, (items.get(itemId) || 0) + 1)
}

async function stableCommand (msg, userBalances, userInventory) {
  // Obtener el ID del usuario
  const userId = msg.author.id

  // Verificar si el usuario tiene un establo
  if (!userInventory.has(userId) || userInventory.get(userId).size === 0) {
    const emptyStableEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Establo Cósmico Vacío')
      .setDescription('Tu establo cósmico está vacío. Parece que necesitas algunos caballos cósmicos.')

    return msg.channel.send({ embeds: [emptyStableEmbed] })
  }

  // Obtener los caballos del usuario y crear un array de descripciones de caballos
  const items = userInventory.get(userId)
  const horseEntries = Array.from(items.entries()).filter(([itemId]) => {
    const item = storeItems.find(i => i.id === itemId)
    return item.category === 'Caballo'
  })
  const horsesPerPage = 10 // Número de caballos por página
  const totalPages = Math.ceil(horseEntries.length / horsesPerPage)

  let currentPage = 1
  let startIndex = (currentPage - 1) * horsesPerPage
  let endIndex = startIndex + horsesPerPage
  let currentPageHorses = horseEntries.slice(startIndex, endIndex)

  const horseDescriptions = currentPageHorses.map(([itemId, quantity]) => {
    const horse = storeItems.find(i => i.id === itemId)
    return `**${horse.name}**: ${quantity}x, Velocidad: ${horse.speed}, Probabilidad de Muerte: ${horse.deathProbability}, Cuotas de Apuesta: ${horse.bettingOdds}`
  })

  // Crear el embed con la información del establo
  let stableEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('Establo Cósmico')
    .setDescription('Aquí están tus majestuosos caballos cósmicos:')
    .setThumbnail('https://cdn.discordapp.com/attachments/1227025952924635147/1227038525627564033/b3ea5f68-0e1c-4848-95b9-4dff1c4ce09f-removebg-preview.png')
    .addFields({
      name: 'Caballos Cósmicos',
      value: horseDescriptions.join('\n')
    })
    .setFooter({ text: `Página ${currentPage}/${totalPages}` })

  // Crear botones de paginación
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

  // Enviar el embed con los botones
  const message = await msg.channel.send({ embeds: [stableEmbed], components: [row] })

  // Agregar eventos de recolección de reacciones para la navegación entre páginas
  const filter = (interaction) => interaction.user.id === userId
  const collector = message.createMessageComponentCollector({ filter, time: 60000 })

  collector.on('collect', async (interaction) => {
    if (interaction.customId.startsWith('previous')) {
      currentPage = Math.max(currentPage - 1, 1)
    } else if (interaction.customId.startsWith('next')) {
      currentPage = Math.min(currentPage + 1, totalPages)
    }

    startIndex = (currentPage - 1) * horsesPerPage
    endIndex = startIndex + horsesPerPage
    currentPageHorses = horseEntries.slice(startIndex, endIndex)

    const updatedHorseDescriptions = currentPageHorses.map(([itemId, quantity]) => {
      const horse = storeItems.find(i => i.id === itemId)
      return `**${horse.name}**: ${quantity}x, Velocidad: ${horse.speed}, Probabilidad de Muerte: ${horse.deathProbability}, Cuotas de Apuesta: ${horse.bettingOdds}`
    })

    // Crear un nuevo embed con la información del establo actualizada
    stableEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Establo Cósmico')
      .setDescription('Aquí están tus majestuosos caballos cósmicos:')
      .setThumbnail('https://cdn.discordapp.com/attachments/1227025952924635147/1227038525627564033/b3ea5f68-0e1c-4848-95b9-4dff1c4ce09f-removebg-preview.png')
      .addFields({
        name: 'Caballos Cósmicos',
        value: updatedHorseDescriptions.join('\n')
      })
      .setFooter({ text: `Página ${currentPage}/${totalPages}` })

    await interaction.update({ embeds: [stableEmbed], components: [row] })
  })

  collector.on('end', () => message.edit({ components: [] }))
}

export { addItemToInventory, stableCommand }
