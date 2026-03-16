import 'dotenv/config'
import { REST, Routes, SlashCommandBuilder } from 'discord.js'


const commands = [
  new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work a random job and earn coins'),

  new SlashCommandBuilder()
    .setName('salary')
    .setDescription('View your wallet & bank balance')
    .addUserOption(o => o.setName('user').setDescription('Target user (optional)')),

  new SlashCommandBuilder()
    .setName('bet')
    .setDescription('Bet on a roulette spin')
    .addStringOption(o => o.setName('amount').setDescription('Amount or "all"').setRequired(true))
    .addStringOption(o => o.setName('type').setDescription('red · black · low · high · 0-36').setRequired(true)),

  new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Move coins from wallet to bank')
    .addStringOption(o => o.setName('amount').setDescription('Amount or "all"').setRequired(true)),

  new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Move coins from bank to wallet')
    .addStringOption(o => o.setName('amount').setDescription('Amount or "all"').setRequired(true)),

  new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Send coins to another user')
    .addUserOption(o => o.setName('user').setDescription('Recipient').setRequired(true))
    .addStringOption(o => o.setName('amount').setDescription('Amount or "all"').setRequired(true)),

  new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Steal all wallet coins from a user')
    .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true)),

  // Single /admin command — action dropdown + optional user / amount / item
  new SlashCommandBuilder()
    .setName('admin')
    .setDescription('(Admin) Economy management')
    .addStringOption(o => o
      .setName('action')
      .setDescription('Action to perform')
      .setRequired(true)
      .addChoices(
        { name: 'give — Add coins to wallet', value: 'give' },
        { name: 'take — Remove coins from wallet', value: 'take' },
        { name: 'setwallet — Set wallet to exact value', value: 'setwallet' },
        { name: 'setbank — Set bank to exact value', value: 'setbank' },
        { name: 'reset — Zero wallet + bank + inventory', value: 'reset' },
        { name: 'wipe — Wipe entire server economy', value: 'wipe' },
        { name: 'richlist — Top 10 richest users', value: 'richlist' },
        { name: 'lookup — View full user balance', value: 'lookup' },
        { name: 'econstat — Global economy stats', value: 'econstat' },
        { name: 'additem — Give an item to a user', value: 'additem' },
        { name: 'removeitem — Remove an item from a user', value: 'removeitem' }
      ))
    .addUserOption(o => o.setName('user').setDescription('Target user'))
    .addIntegerOption(o => o.setName('amount').setDescription('Coin amount').setMinValue(0))
    .addStringOption(o => o.setName('item').setDescription('Item to add/remove').setAutocomplete(true)),

  new SlashCommandBuilder()
    .setName('lottery')
    .setDescription('Buy a lottery ticket and pick a number 000–999')
    .addIntegerOption(o => o.setName('number').setDescription('Your pick (0–999)').setMinValue(0).setMaxValue(999)),

  new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Go fishing and earn coins'),

  new SlashCommandBuilder()
    .setName('hr')
    .setDescription('Race your horse and bet on it winning')
    .addStringOption(o => o
      .setName('horse')
      .setDescription('Choose one of your horses')
      .setRequired(true)
      .setAutocomplete(true))
    .addIntegerOption(o => o.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder()
    .setName('store')
    .setDescription('Browse the item shop'),

  new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory'),

  // /buy — autocomplete (dynamic, picks up items added via /adminstore)
  new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Purchase an item from the shop')
    .addStringOption(o => o
      .setName('item')
      .setDescription('Item to purchase')
      .setRequired(true)
      .setAutocomplete(true)),

  new SlashCommandBuilder()
    .setName('stable')
    .setDescription('View your horse stable'),

  new SlashCommandBuilder()
    .setName('use')
    .setDescription('Use a role item from your inventory')
    .addStringOption(o => o
      .setName('item')
      .setDescription('Item to use')
      .setRequired(true)
      .setAutocomplete(true)),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  // /adminstore — manage store items dynamically
  new SlashCommandBuilder()
    .setName('adminstore')
    .setDescription('(Admin) Manage store items')
    .addStringOption(o => o
      .setName('action')
      .setDescription('Action to perform')
      .setRequired(true)
      .addChoices(
        { name: 'list — Show all items', value: 'list' },
        { name: 'create — Add a misc item', value: 'create' },
        { name: 'createhorse — Add a horse', value: 'createhorse' },
        { name: 'edit — Edit an item field', value: 'edit' },
        { name: 'setrole — Assign role reward to item', value: 'setrole' },
        { name: 'clearrole — Remove role reward', value: 'clearrole' },
        { name: 'delete — Remove item from store', value: 'delete' }
      ))
    .addStringOption(o => o.setName('item').setDescription('Item ID (autocomplete)').setAutocomplete(true))
    .addStringOption(o => o.setName('name').setDescription('Item name'))
    .addIntegerOption(o => o.setName('price').setDescription('Price in coins').setMinValue(0))
    .addStringOption(o => o.setName('speed').setDescription('Horse speed (e.g. 40km/h)'))
    .addNumberOption(o => o.setName('winchance').setDescription('Horse win chance 0–100 (%)').setMinValue(0).setMaxValue(100))
    .addStringOption(o => o.setName('odds').setDescription('Horse betting odds (e.g. 2:1)'))
    .addStringOption(o => o
      .setName('field')
      .setDescription('Field to edit')
      .addChoices(
        { name: 'name', value: 'name' },
        { name: 'price', value: 'price' },
        { name: 'speed', value: 'speed' },
        { name: 'winchance', value: 'winchance' },
        { name: 'odds', value: 'odds' },
        { name: 'category', value: 'category' }
      ))
    .addStringOption(o => o.setName('value').setDescription('New value for the edited field'))
    .addRoleOption(o => o.setName('role').setDescription('Role reward to assign')),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Display a user's avatar")
    .addUserOption(o => o.setName('user').setDescription('Target user (optional)'))
]

const rest = new REST().setToken(process.env.CLIENT_TOKEN)

const route = process.env.GUILD_ID
  ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
  : Routes.applicationCommands(process.env.CLIENT_ID)

const scope = process.env.GUILD_ID
  ? `guild ${process.env.GUILD_ID} (instant)`
  : 'globally (up to 1h propagation)'

console.log(`Registering ${commands.length} slash commands ${scope}...`)

rest.put(route, { body: commands.map(c => c.toJSON()) })
  .then(() => console.log(`✅ Slash commands registered ${scope}.`))
  .catch(console.error)
