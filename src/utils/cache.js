import NodeCache from 'node-cache'

/** Short-lived user balance cache (30s TTL) — invalidated on every write */
export const userCache = new NodeCache({ stdTTL: 30, checkperiod: 15, useClones: false })

/** Long-lived store items cache (1h TTL) — items rarely change */
export const storeCache = new NodeCache({ stdTTL: 3600, checkperiod: 600, useClones: false })
