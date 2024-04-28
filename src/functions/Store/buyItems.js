import { EmbedBuilder } from 'discord.js'
import { addItemToInventory } from './inventory.js'
import { storeItems } from '../../data/Economia.js'

export async function buyItem (msg, itemId, userBalances, userInventory) {
  const selectedItem = storeItems.find((item) => item.id === itemId)

  if (!selectedItem) {
    msg.reply('El ítem especificado no existe en la tienda.')
    return
  }

  const userBalance = userBalances.get(msg.author.id) || 0

  if (userBalance < selectedItem.price) {
    msg.reply(
      'No tienes suficientes <:Coin:1232427012702994533> para comprar este ítem.'
    )
    return
  }

  userBalances.set(msg.author.id, userBalance - selectedItem.price)

  addItemToInventory(msg.author.id, selectedItem.id, userInventory)

  const purchaseEmbed = new EmbedBuilder()

  purchaseEmbed.setColor('#00FF00')
  purchaseEmbed.setTitle('¡Compra exitosa!')
  purchaseEmbed.setDescription(
      `Has comprado ${selectedItem.name} por ${selectedItem.price} monedas. ¡Disfruta de tu compra!`
  )
  purchaseEmbed.setThumbnail(
    'https://cdn.discordapp.com/attachments/1227025952924635147/1227029093476991116/athena_ty.png'
  )

  msg.channel.send({ embeds: [purchaseEmbed] })
}
