require('dotenv').config();

// Importa la librería Discord.js
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// Evento que se ejecuta cuando el bot está listo
client.on('ready', () => {
	console.log(`Conectado como ${client.user.tag}!`);
});

// Evento que se ejecuta cuando se recibe un mensaje
client.on('messageCreate', msg => {
	if (msg.content.startsWith('/help') || msg.content.startsWith('/comandos')) {
		// Responde con la lista de comandos disponibles
		msg.reply(`¡Aquí tienes la lista de comandos:\n\n1. /hi: Saluda al usuario mencionándolo.\n2. Otro comando: Descripción del otro comando.`);
	}
});

// Inicia sesión con el token de tu bot
client.login(process.env.CLIENT_TOKEN);