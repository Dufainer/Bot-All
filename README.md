# Orbital-Bot

A feature-rich Discord economy bot built with **discord.js v14**, **SQLite**, and a clean OOP architecture. All visual content — messages, emojis, colors, jobs, fish types, lottery config — is fully customizable through a single JSON file.

---

## Features

- 🪙 **Economy system** — wallet, bank, deposit, withdraw, pay, rob
- 🎮 **Games** — fishing, roulette betting, lottery, horse racing
- 🏪 **Store** — paginated shop with misc items and horses
- 🎒 **Inventory** — paginated view with category tabs
- 🐎 **Stable** — manage and view owned horses
- 🎭 **Role items** — buy items that grant Discord roles, usable from inventory
- 🛠️ **Admin panel** — full economy management (give, take, reset, wipe, richlist…)
- 🏬 **Dynamic store management** — add, edit, and delete store items live via `/adminstore`
- ✏️ **100% configurable visuals** — every message, emoji, color, and game value lives in `config/messages.json`
- ⚡ **Slash commands + prefix commands** — supports both `$`, `!`, `h` prefixes and `/` slash

---

## Commands

### 🪙 Economy
| Command | Description |
|---|---|
| `work` | Earn coins from a random job *(30s cooldown)* |
| `salary [@user]` | View wallet & bank balance |
| `deposit <amount>` | Move coins from wallet → bank |
| `withdraw <amount>` | Move coins from bank → wallet |
| `pay <@user> <amount>` | Send coins to another user |
| `rob <@user>` | Steal all wallet coins from a user |
| `bet <amount> <red\|black\|low\|high\|0-36>` | Roulette spin |

### 🎮 Games
| Command | Description |
|---|---|
| `fish` | Go fishing *(15s cooldown)* |
| `lottery [000–999]` | Buy a lottery ticket and pick a number |
| `hr <horse> <bet>` | Race one of your horses and bet on it |

### 🏪 Store
| Command | Description |
|---|---|
| `store` | Browse all shop items (paginated) |
| `buy <item ID>` | Purchase an item |
| `inventory` | View your items |
| `use <item ID>` | Use a role item — grants its Discord role and removes it from inventory |
| `stable` | View your horses and their stats |

### 🔧 Utility
| Command | Description |
|---|---|
| `avatar [@user]` | Display a user's avatar |
| `help` | Show all commands |

### 🛡️ Admin (`adminOnly`)
| Command | Description |
|---|---|
| `admin give <@user> <amount>` | Add coins to wallet |
| `admin take <@user> <amount>` | Remove coins from wallet |
| `admin setwallet <@user> <amount>` | Set exact wallet value |
| `admin setbank <@user> <amount>` | Set exact bank value |
| `admin reset <@user>` | Zero wallet + bank + inventory |
| `admin wipe` | Wipe the entire server economy |
| `admin richlist` | Top 10 richest users |
| `admin lookup <@user>` | Full user balance |
| `admin econstat` | Global economy stats |
| `admin additem <@user> <item-id>` | Give item to a user |
| `admin removeitem <@user> <item-id>` | Remove item from a user |
| `adminstore list` | Show all store items |
| `adminstore create` | Add a new misc item |
| `adminstore createhorse` | Add a new horse |
| `adminstore edit` | Edit an item field |
| `adminstore setrole` | Assign a role reward to an item |
| `adminstore clearrole` | Remove a role reward |
| `adminstore delete` | Remove an item from the store |

> Admin commands are restricted to the **server owner**.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Dufainer/Bot-All.git
cd Bot-All
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
CLIENT_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_guild_id  # optional, for instant slash command registration
```

### 4. Register slash commands

```bash
npm run deploy
```

### 5. Start the bot

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

---

## Customization

All visual content is stored in **`config/messages.json`**. You can freely edit:

- 💬 All messages and embed text
- 🎨 Embed colors (hex)
- 🪙 Coin emoji
- 💼 Work jobs (name, min/max pay) — add, edit or delete
- 🐟 Fish types (name, payout range, probability) — add, edit or delete
- 🎟️ Lottery ticket price and prize pool
- 😀 Emoji maps for fish, roulette colors, etc.

```json
{
  "coin": "<:Coin:1234567890>",
  "colors": {
    "success": "#22C55E",
    "error":   "#EF4444"
  },
  "workJobs": [
    { "name": "selling shooting stars", "minPay": 50, "maxPay": 100 }
  ],
  "fishTypes": [
    { "name": "Sardine", "min": 5, "max": 15, "probability": 0.40 }
  ],
  "lottery": {
    "ticketPrice": 100,
    "prizes": [10000, 5000, 1000]
  }
}
```

> `{variable}` placeholders in strings are replaced at runtime. Numbers are automatically formatted with commas.

---

## Project Structure

```
Orbital-Bot/
├── config/
│   └── messages.json        # All visual content — edit here
├── src/
│   ├── commands/
│   │   ├── economy/         # work, bet, fish, lottery, race, salary…
│   │   ├── store/           # store, buy, use, inventory, stable
│   │   └── utility/         # avatar, help
│   ├── core/
│   │   ├── Command.js       # Base command class
│   │   └── CommandHandler.js# Auto-loader, dispatcher, context factory
│   ├── services/
│   │   ├── EconomyService.js# Economy logic
│   │   └── StoreService.js  # Store & inventory logic
│   ├── db/
│   │   └── economyDb.js     # SQLite layer (all queries)
│   ├── data/
│   │   └── gameData.js      # Game constants sourced from config
│   ├── i18n/
│   │   └── en.js            # MSGS/COIN API backed by messages.json
│   ├── middleware/
│   │   └── rateLimiter.js   # Per-user cooldown enforcement
│   ├── utils/
│   │   ├── cache.js         # In-memory cache (node-cache)
│   │   ├── logger.js        # Winston logger
│   │   └── validators.js    # Input validation helpers
│   └── config/
│       ├── client.js        # Discord.js client instance
│       └── messages.js      # JSON loader + t() template helper
├── deploy.js                # Slash command registration script
├── index.js                 # Entry point
└── .env.example             # Environment variable template
```

---

## Requirements

- Node.js **18+**
- A Discord bot application with the following intents enabled:
  - `Guilds`
  - `Guild Messages`
  - `Message Content`
  - `Guild Members`
- Bot permissions: `Send Messages`, `Embed Links`, `Manage Roles` *(for role items)*

---

## License

MIT
