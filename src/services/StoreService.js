import { STORE_ITEMS } from '../data/gameData.js'
import * as db from '../db/economyDb.js'
import { storeCache, userCache } from '../utils/cache.js'

class StoreService {
  /** Seed the store_items table from gameData if it's empty (run once at startup) */
  async init () {
    await db.seedStoreItems(STORE_ITEMS)
  }

  /** Invalidate store cache after any mutation */
  invalidateStore () {
    storeCache.flushAll()
  }

  // ── Read ────────────────────────────────────────────────────────────────

  async getItems () {
    const cached = storeCache.get('all')
    if (cached) return cached
    const items = await db.getStoreItems()
    storeCache.set('all', items)
    return items
  }

  async getItem (id) {
    const items = await this.getItems()
    return items.find(i => i.id === id) ?? null
  }

  // ── User actions ────────────────────────────────────────────────────────

  /**
   * Purchase an item for a user.
   * @throws {Error} 'ITEM_NOT_FOUND' | 'INSUFFICIENT_FUNDS'
   * @returns {object} the purchased item
   */
  async buy (userId, itemId) {
    const item = await this.getItem(itemId)
    if (!item) throw new Error('ITEM_NOT_FOUND')

    const { wallet } = await db.getUser(userId)
    if (wallet < item.price) throw new Error('INSUFFICIENT_FUNDS')

    await db.setWallet(userId, wallet - item.price)
    await db.addItemToInventoryDb(userId, item.id, 1)
    userCache.del(userId)

    return item
  }

  /** Get a user's full inventory enriched with item metadata */
  async getInventory (userId) {
    const rawItems = await db.getInventory(userId)
    const allItems = await this.getItems()
    return rawItems
      .map(({ itemId, quantity }) => {
        const meta = allItems.find(i => i.id === itemId)
        return meta ? { ...meta, quantity } : null
      })
      .filter(Boolean)
  }

  /** Get only Horse-category items from a user's inventory */
  async getHorses (userId) {
    const inv = await this.getInventory(userId)
    return inv.filter(i => i.category === 'Horse')
  }

  // ── Admin user inventory ────────────────────────────────────────────────

  async adminAddItem (userId, itemId) {
    const item = await this.getItem(itemId)
    if (!item) throw new Error('ITEM_NOT_FOUND')
    await db.addItemToInventoryDb(userId, itemId, 1)
    return item
  }

  /**
   * Use a role item from inventory: removes 1 from inventory, returns the item.
   * @throws {Error} 'ITEM_NOT_FOUND' | 'NOT_IN_INVENTORY' | 'NO_ROLE'
   */
  async useItem (userId, itemId) {
    const item = await this.getItem(itemId)
    if (!item) throw new Error('ITEM_NOT_FOUND')
    if (!item.roleId) throw new Error('NO_ROLE')

    const has = await db.userHasItem(userId, itemId)
    if (!has) throw new Error('NOT_IN_INVENTORY')

    await db.addItemToInventoryDb(userId, itemId, -1)
    return item
  }

  async adminRemoveItem (userId, itemId) {
    const item = await this.getItem(itemId)
    if (!item) throw new Error('ITEM_NOT_FOUND')
    const has = await db.userHasItem(userId, itemId)
    if (!has) throw new Error('ITEM_NOT_IN_INVENTORY')
    await db.addItemToInventoryDb(userId, itemId, -1)
    return item
  }

  // ── Admin store management ──────────────────────────────────────────────

  /** Create a new misc or horse item in the store. Returns the new item ID. */
  async createItem ({ name, price, category, roleId, speed, winChance, bettingOdds }) {
    const id = await db.createStoreItem({ name, price, category: category ?? 'Misc', roleId, speed, winChance, bettingOdds })
    this.invalidateStore()
    return id
  }

  /** Update one or more fields of an existing item. */
  async editItem (id, fields) {
    await db.updateStoreItem(id, fields)
    this.invalidateStore()
  }

  /** Soft-delete an item from the store. */
  async deleteItem (id) {
    await db.softDeleteStoreItem(id)
    this.invalidateStore()
  }
}

export const storeService = new StoreService()
