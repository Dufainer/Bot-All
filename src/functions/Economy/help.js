import { EmbedBuilder } from 'discord.js'

function helpCommand (msg) {
  const helpEmbed = new EmbedBuilder()
    .setTitle('Lista de Comandos:')
    .setDescription('A continuación se muestra la lista de comandos disponibles:')
    .setColor('#3498DB')
    .addFields(
      { name: '/work, $work, !work', value: 'Gana dinero trabajando.', inline: false },
      { name: '/sal, $sal, !sal [@usuario]', value: 'Consulta tu salario o el salario de otro usuario.', inline: false },
      { name: '/bet, $bet, !bet [cantidad]', value: 'Apuesta una cantidad de dinero.', inline: false },
      { name: '/dep, $dep, !dep [cantidad/todo]', value: 'Deposita dinero en tu banco.', inline: false },
      { name: '/with, $with, !with [cantidad]', value: 'Retira dinero de tu banco.', inline: false },
      { name: '/pay, $pay, !pay [@usuario] [cantidad]', value: 'Paga a otro usuario.', inline: false },
      { name: '/store, $store, !store', value: 'Accede a la tienda para comprar artículos.', inline: false },
      { name: '/help, $help, !help', value: 'Muestra este mensaje de ayuda.', inline: false },
      { name: '/rob, $rob, !rob [@usuario]', value: 'Intenta robar a otro usuario.', inline: false },
      { name: '/lot, $lot, !lot [número]', value: 'Participa en la lotería eligiendo un número entre 000 y 999. Puedes ganar hasta 10000 monedas.', inline: false },
      { name: '/fish, $fish, !fish', value: 'Pesca y gana monedas.', inline: false },
      { name: '/inv, $inv, !inv', value: 'Muestra los ítems en tu inventario.', inline: false }
    )

  msg.channel.send({ embeds: [helpEmbed] })
}

export default helpCommand
