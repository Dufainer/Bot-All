import { cfg, t } from '../config/messages.js'

/** Discord custom emoji for coins */
export const COIN = cfg.coin

export const MSGS = {
  errors: cfg.errors,

  cooldown: (seconds) => t(cfg.cooldown, { seconds }),

  deposit: {
    success: (amount, bank) => t(cfg.deposit.success, { amount, bank, coin: COIN })
  },

  withdraw: {
    success: (amount, wallet) => t(cfg.withdraw.success, { amount, wallet, coin: COIN })
  },

  pay: {
    success: (amount, targetId, newBalance) => t(cfg.pay.success, { amount, targetId, newBalance, coin: COIN }),
    selfPay: cfg.pay.selfPay
  },

  rob: {
    success: (stolen, targetId) => t(cfg.rob.success, { stolen, targetId, coin: COIN }),
    empty:   cfg.rob.empty,
    selfRob: cfg.rob.selfRob
  },

  give: {
    success: (amount, targetId) => t(cfg.give.success, { amount, targetId, coin: COIN })
  },

  buy: {
    notFound:  cfg.buy.notFound,
    noBalance: (price) => t(cfg.buy.noBalance, { price, coin: COIN }),
    success:   (name, price) => t(cfg.buy.success, { name, price, coin: COIN })
  },

  admin: {
    give:        (amount, targetId)             => t(cfg.admin.give,        { amount, targetId, coin: COIN }),
    take:        (amount, targetId, remaining)  => t(cfg.admin.take,        { amount, targetId, remaining, coin: COIN }),
    setwallet:   (amount, targetId)             => t(cfg.admin.setwallet,   { amount, targetId, coin: COIN }),
    setbank:     (amount, targetId)             => t(cfg.admin.setbank,     { amount, targetId, coin: COIN }),
    reset:       (targetId)                     => t(cfg.admin.reset,       { targetId }),
    wipe:        cfg.admin.wipe,
    richlistTitle: cfg.admin.richlistTitle,
    richlistLine:  (rank, id, total) => t(cfg.admin.richlistLine, { rank, id, total, coin: COIN }),
    richlistEmpty: cfg.admin.richlistEmpty,
    lookupTitle:   (id)                         => t(cfg.admin.lookupTitle, { id }),
    lookupDesc:    (wallet, bank, total)         => t(cfg.admin.lookupDesc,  { wallet, bank, total, coin: COIN }),
    econstatTitle: cfg.admin.econstatTitle,
    econstatDesc:  (users, wallet, bank, total)  => t(cfg.admin.econstatDesc, { users, wallet, bank, total, coin: COIN }),
    itemAdded:        (itemName, targetId) => t(cfg.admin.itemAdded,        { itemName, targetId }),
    itemRemoved:      (itemName, targetId) => t(cfg.admin.itemRemoved,      { itemName, targetId }),
    itemNotFound:      cfg.admin.itemNotFound,
    itemNotInInventory:cfg.admin.itemNotInInventory,
    unknownSub:        cfg.admin.unknownSub,
    usage:             cfg.admin.usage
  }
}
