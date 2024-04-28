// import dotenv from "dotenv";
// dotenv.config();
// import { client } from "../../config/economy.js";
// import nekoCommand from "./aComand.js";

// const prefixes = ["$", "!", "/"];

// // Evento que se ejecuta cuando el bot está listo
// client.on("ready", () => {
//   console.log(`Conectado como ${client.user.tag}!`);
// });

// // Evento que se ejecuta cuando se recibe un mensaje
// client.on("messageCreate", (msg) => {
//   const args = msg.content.split(" ").slice(1);

//   for (const prefix of prefixes) {
//     if (msg.content.startsWith(`${prefix}a`)) {
//         nekoCommand(msg, args);
//       break;
//     }
//   }
// });
