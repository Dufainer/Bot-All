import { cfg } from '../config/messages.js'

export const WORK_JOBS = cfg.workJobs

export const FISH_TYPES = cfg.fishTypes

// Pre-computed cumulative probabilities — avoids re-calculation on every fish call
export const FISH_CUMULATIVE = cfg.fishTypes.reduce((acc, fish) => {
  acc.push((acc.at(-1) ?? 0) + fish.probability)
  return acc
}, [])

export const LOTTERY_TICKET_PRICE = cfg.lottery.ticketPrice
export const LOTTERY_PRIZES       = cfg.lottery.prizes

export const STORE_ITEMS = [
  { id: 1,  name: 'Coconut', price: 10000, category: 'Misc' },
  { id: 2,  name: 'Yox', price: 10000, category: 'Misc' },
  { id: 3,  name: 'Shark Fin', price: 15000, category: 'Misc' },
  // --- Horses (used in /hr and /stable) ---
  { id: 16, name: 'Apollo', price: 5000, category: 'Horse', bettingOdds: '3:1', speed: '30 km/h', winChance: 0.28 },
  { id: 17, name: 'Helios', price: 6000, category: 'Horse', bettingOdds: '2:1', speed: '35 km/h', winChance: 0.36 },
  { id: 18, name: 'Selene', price: 7000, category: 'Horse', bettingOdds: '1:1', speed: '40 km/h', winChance: 0.44 }
]
