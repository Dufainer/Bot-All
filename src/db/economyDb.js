import sqlite3pkg from 'sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sqlite3 = sqlite3pkg.verbose()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../data/economy.sqlite')

const db = new sqlite3.Database(dbPath)

// Promisified helpers
function dbGet (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
  })
}

function dbRun (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this) })
  })
}

function dbAll (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  })
}

// Run multiple statements atomically in a transaction
function dbTransaction (fn) {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        await dbRun('BEGIN')
        const result = await fn()
        await dbRun('COMMIT')
        resolve(result)
      } catch (err) {
        db.run('ROLLBACK')
        reject(err)
      }
    })
  })
}

/** Create all tables and set PRAGMA — must be awaited before any other DB call */
export async function initDb () {
  await dbRun('PRAGMA journal_mode = WAL')
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id     TEXT    PRIMARY KEY,
      wallet INTEGER NOT NULL DEFAULT 0,
      bank   INTEGER NOT NULL DEFAULT 0
    )
  `)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS inventory (
      user_id  TEXT    NOT NULL,
      item_id  INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      PRIMARY KEY (user_id, item_id)
    )
  `)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS store_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      price        INTEGER NOT NULL DEFAULT 0,
      category     TEXT    NOT NULL DEFAULT 'Misc',
      role_id      TEXT,
      speed        TEXT,
      win_chance   REAL,
      betting_odds TEXT,
      active       INTEGER NOT NULL DEFAULT 1
    )
  `)
}

async function ensureUser (userId) {
  await dbRun('INSERT OR IGNORE INTO users (id) VALUES (?)', [userId])
}

// --- Users ---

export async function getUser (userId) {
  await ensureUser(userId)
  return dbGet('SELECT wallet, bank FROM users WHERE id = ?', [userId])
}

export async function getWallet (userId) {
  await ensureUser(userId)
  const row = await dbGet('SELECT wallet FROM users WHERE id = ?', [userId])
  return row ? row.wallet : 0
}

export async function setWallet (userId, amount) {
  await ensureUser(userId)
  await dbRun('UPDATE users SET wallet = ? WHERE id = ?', [amount, userId])
}

export async function addToWallet (userId, delta) {
  await ensureUser(userId)
  await dbRun('UPDATE users SET wallet = wallet + ? WHERE id = ?', [delta, userId])
}

export async function getBank (userId) {
  await ensureUser(userId)
  const row = await dbGet('SELECT bank FROM users WHERE id = ?', [userId])
  return row ? row.bank : 0
}

export async function setBank (userId, amount) {
  await ensureUser(userId)
  await dbRun('UPDATE users SET bank = ? WHERE id = ?', [amount, userId])
}

export async function addToBank (userId, delta) {
  await ensureUser(userId)
  await dbRun('UPDATE users SET bank = bank + ? WHERE id = ?', [delta, userId])
}

// Atomic wallet → bank transfer. Returns false if insufficient funds.
export async function transferWalletToBank (userId, amount) {
  await ensureUser(userId)
  return dbTransaction(async () => {
    const row = await dbGet('SELECT wallet FROM users WHERE id = ?', [userId])
    if (!row || row.wallet < amount) return false
    await dbRun(
      'UPDATE users SET wallet = wallet - ?, bank = bank + ? WHERE id = ?',
      [amount, amount, userId]
    )
    return true
  })
}

// Atomic bank → wallet transfer. Returns false if insufficient funds.
export async function transferBankToWallet (userId, amount) {
  await ensureUser(userId)
  return dbTransaction(async () => {
    const row = await dbGet('SELECT bank FROM users WHERE id = ?', [userId])
    if (!row || row.bank < amount) return false
    await dbRun(
      'UPDATE users SET bank = bank - ?, wallet = wallet + ? WHERE id = ?',
      [amount, amount, userId]
    )
    return true
  })
}

// Atomic pay: transfer from sender's wallet to recipient. Returns false if insufficient funds.
export async function payUser (fromId, toId, amount) {
  await ensureUser(fromId)
  await ensureUser(toId)
  return dbTransaction(async () => {
    const row = await dbGet('SELECT wallet FROM users WHERE id = ?', [fromId])
    if (!row || row.wallet < amount) return false
    await dbRun('UPDATE users SET wallet = wallet - ? WHERE id = ?', [amount, fromId])
    await dbRun('UPDATE users SET wallet = wallet + ? WHERE id = ?', [amount, toId])
    return true
  })
}

// Atomic rob: steal all wallet coins from target. Returns stolen amount (0 if nothing to steal).
export async function robUser (thiefId, targetId) {
  await ensureUser(thiefId)
  await ensureUser(targetId)
  return dbTransaction(async () => {
    const row = await dbGet('SELECT wallet FROM users WHERE id = ?', [targetId])
    const stolen = row ? row.wallet : 0
    if (stolen === 0) return 0
    await dbRun('UPDATE users SET wallet = 0 WHERE id = ?', [targetId])
    await dbRun('UPDATE users SET wallet = wallet + ? WHERE id = ?', [stolen, thiefId])
    return stolen
  })
}

// Atomic bet: apply delta (+win / -loss). Returns new balance.
export async function betWallet (userId, delta) {
  await ensureUser(userId)
  return dbTransaction(async () => {
    const row = await dbGet('SELECT wallet FROM users WHERE id = ?', [userId])
    const newBalance = (row ? row.wallet : 0) + delta
    await dbRun('UPDATE users SET wallet = ? WHERE id = ?', [newBalance, userId])
    return newBalance
  })
}

// --- Inventory ---

export async function getInventory (userId) {
  return dbAll(
    'SELECT item_id AS itemId, quantity FROM inventory WHERE user_id = ?',
    [userId]
  )
}

export async function addItemToInventoryDb (userId, itemId, delta = 1) {
  return dbTransaction(async () => {
    const row = await dbGet(
      'SELECT quantity FROM inventory WHERE user_id = ? AND item_id = ?',
      [userId, itemId]
    )
    const newQty = (row ? row.quantity : 0) + delta
    if (newQty <= 0) {
      await dbRun('DELETE FROM inventory WHERE user_id = ? AND item_id = ?', [userId, itemId])
    } else if (row) {
      await dbRun(
        'UPDATE inventory SET quantity = ? WHERE user_id = ? AND item_id = ?',
        [newQty, userId, itemId]
      )
    } else {
      await dbRun(
        'INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, ?)',
        [userId, itemId, newQty]
      )
    }
  })
}

export async function userHasItem (userId, itemId) {
  const row = await dbGet(
    'SELECT 1 FROM inventory WHERE user_id = ? AND item_id = ?',
    [userId, itemId]
  )
  return !!row
}

// --- Admin operations ---

/** Zero wallet + bank and clear all inventory for one user */
export async function resetUser (userId) {
  return dbTransaction(async () => {
    await dbRun('UPDATE users SET wallet = 0, bank = 0 WHERE id = ?', [userId])
    await dbRun('DELETE FROM inventory WHERE user_id = ?', [userId])
  })
}

/** Delete every user record and every inventory row */
export async function wipeAll () {
  return dbTransaction(async () => {
    await dbRun('DELETE FROM users')
    await dbRun('DELETE FROM inventory')
  })
}

/** Top N users ordered by wallet + bank descending */
export async function getRichList (limit = 10) {
  return dbAll(
    'SELECT id, wallet, bank, (wallet + bank) AS total FROM users ORDER BY total DESC LIMIT ?',
    [limit]
  )
}

/** Aggregate stats: user count + total coins in circulation */
export async function getEconStats () {
  return dbGet(
    'SELECT COUNT(*) AS userCount, COALESCE(SUM(wallet),0) AS totalWallet, COALESCE(SUM(bank),0) AS totalBank FROM users'
  )
}

// --- Store items ---

function rowToItem (r) {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    category: r.category,
    roleId: r.role_id ?? null,
    speed: r.speed ?? null,
    winChance: r.win_chance ?? null,
    bettingOdds: r.betting_odds ?? null
  }
}

/** Seed store items from a static array — only runs when table is empty */
export async function seedStoreItems (items) {
  const { n } = await dbGet('SELECT COUNT(*) AS n FROM store_items')
  if (n > 0) return
  for (const item of items) {
    await dbRun(
      'INSERT INTO store_items (id, name, price, category, speed, win_chance, betting_odds) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item.id, item.name, item.price, item.category, item.speed ?? null, item.winChance ?? null, item.bettingOdds ?? null]
    )
  }
}

export async function getStoreItems () {
  const rows = await dbAll('SELECT * FROM store_items WHERE active = 1 ORDER BY id ASC')
  return rows.map(rowToItem)
}

export async function getStoreItemById (id) {
  const row = await dbGet('SELECT * FROM store_items WHERE id = ? AND active = 1', [id])
  return row ? rowToItem(row) : null
}

export async function createStoreItem ({ name, price, category, roleId, speed, winChance, bettingOdds }) {
  const result = await dbRun(
    'INSERT INTO store_items (name, price, category, role_id, speed, win_chance, betting_odds) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, price, category ?? 'Misc', roleId ?? null, speed ?? null, winChance ?? null, bettingOdds ?? null]
  )
  return result.lastID
}

export async function updateStoreItem (id, fields) {
  const colMap = {
    name: 'name',
    price: 'price',
    category: 'category',
    roleId: 'role_id',
    speed: 'speed',
    winChance: 'win_chance',
    bettingOdds: 'betting_odds'
  }
  const sets = []
  const vals = []
  for (const [k, v] of Object.entries(fields)) {
    const col = colMap[k]
    if (col) { sets.push(`${col} = ?`); vals.push(v) }
  }
  if (!sets.length) return
  vals.push(id)
  await dbRun(`UPDATE store_items SET ${sets.join(', ')} WHERE id = ?`, vals)
}

export async function softDeleteStoreItem (id) {
  await dbRun('UPDATE store_items SET active = 0 WHERE id = ?', [id])
}

export default db
