import { useCallback, useEffect, useState } from 'react'
import { read, write } from '../utils/storage.js'
import { todayISO } from '../utils/dates.js'
import { CARDS } from '../data/cards.js'

const KEY = 'wallet'
const LEGACY_DEFAULT_RATIO = 0.005

function migrateRatios(cards) {
  let changed = false
  const next = cards.map(uc => {
    if (uc.pointsToMyrRatio !== LEGACY_DEFAULT_RATIO) return uc
    const card = CARDS.find(c => c.id === uc.cardId)
    if (!card?.defaultPointsToMyrRatio) return uc
    changed = true
    return { ...uc, pointsToMyrRatio: card.defaultPointsToMyrRatio }
  })
  if (changed) write(KEY, next)
  return next
}

/**
 * @typedef {Object} UserCard
 * @property {string} id
 * @property {string} cardId
 * @property {string|null} last4
 * @property {string|null} nickname
 * @property {string} annualFeeRenewalDate
 * @property {number} pointsBalance
 * @property {string} pointsLastUpdated
 * @property {string|null} pointsExpiryDate
 * @property {"calendar_year"|"card_anniversary"|"rolling_12m"|"none"|"other"} pointsExpiryType
 * @property {string} pointsExpiryNotes
 * @property {number} pointsToMyrRatio
 * @property {Array<{perkId:string, periodStart:string, used:number, logs:Array<{date:string,note:string}>}>} perkUsage
 * @property {Array<{type:string, name:string, claimsThisYear:number, notes:string}>} insuranceUsage
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string|null} syncedAt
 * @property {"manual"|"email_parse"} pointsSource
 * @property {string|null} lastStatementEmail
 * @property {string|null} statementParseSource
 */

function loadAll() {
  return migrateRatios(read(KEY, []))
}

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'uc-' + Math.random().toString(36).slice(2, 10)
}

export function useWallet() {
  const [cards, setCards] = useState(loadAll)

  useEffect(() => {
    const onStorage = () => setCards(loadAll())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next) => {
    write(KEY, next)
    setCards(next)
  }, [])

  const addCard = useCallback((userCard) => {
    const withId = {
      id: userCard.id || genId(),
      createdAt: userCard.createdAt || todayISO(),
      isActive: true,
      syncedAt: null,
      pointsSource: 'manual',
      lastStatementEmail: null,
      statementParseSource: null,
      perkUsage: userCard.perkUsage || [],
      insuranceUsage: userCard.insuranceUsage || [],
      ...userCard,
    }
    persist([...loadAll(), withId])
    return withId
  }, [persist])

  const updateCard = useCallback((id, patch) => {
    persist(loadAll().map(c => c.id === id ? { ...c, ...patch } : c))
  }, [persist])

  const removeCard = useCallback((id, { hard = false } = {}) => {
    const next = hard
      ? loadAll().filter(c => c.id !== id)
      : loadAll().map(c => c.id === id ? { ...c, isActive: false } : c)
    persist(next)
  }, [persist])

  const updatePoints = useCallback((id, balance) => {
    persist(loadAll().map(c => c.id === id
      ? { ...c, pointsBalance: balance, pointsLastUpdated: todayISO() }
      : c))
  }, [persist])

  const logPerkUse = useCallback((id, perkId, date, note) => {
    persist(loadAll().map(c => {
      if (c.id !== id) return c
      const existing = c.perkUsage.find(p => p.perkId === perkId)
      if (existing) {
        return {
          ...c,
          perkUsage: c.perkUsage.map(p => p.perkId === perkId
            ? { ...p, used: p.used + 1, logs: [...p.logs, { date, note }] }
            : p)
        }
      }
      return {
        ...c,
        perkUsage: [...c.perkUsage, {
          perkId,
          periodStart: todayISO(),
          used: 1,
          logs: [{ date, note }]
        }]
      }
    }))
  }, [persist])

  const undoLastPerkLog = useCallback((id, perkId) => {
    persist(loadAll().map(c => {
      if (c.id !== id) return c
      return {
        ...c,
        perkUsage: c.perkUsage.map(p => p.perkId === perkId
          ? { ...p, used: Math.max(0, p.used - 1), logs: p.logs.slice(0, -1) }
          : p)
      }
    }))
  }, [persist])

  const setPerkUsed = useCallback((id, perkId, used, periodStart) => {
    persist(loadAll().map(c => {
      if (c.id !== id) return c
      const existing = c.perkUsage.find(p => p.perkId === perkId)
      if (existing) {
        return {
          ...c,
          perkUsage: c.perkUsage.map(p => p.perkId === perkId
            ? { ...p, used, periodStart: periodStart || p.periodStart }
            : p)
        }
      }
      return {
        ...c,
        perkUsage: [...c.perkUsage, {
          perkId,
          periodStart: periodStart || todayISO(),
          used,
          logs: []
        }]
      }
    }))
  }, [persist])

  const updateInsuranceUsage = useCallback((id, type, patch) => {
    persist(loadAll().map(c => {
      if (c.id !== id) return c
      const existing = c.insuranceUsage.find(u => u.type === type)
      if (existing) {
        return {
          ...c,
          insuranceUsage: c.insuranceUsage.map(u => u.type === type ? { ...u, ...patch } : u)
        }
      }
      return {
        ...c,
        insuranceUsage: [...c.insuranceUsage, { type, name: patch.name || type, claimsThisYear: 0, notes: '', ...patch }]
      }
    }))
  }, [persist])

  return {
    cards: cards.filter(c => c.isActive !== false),
    allCards: cards,
    addCard,
    updateCard,
    removeCard,
    updatePoints,
    logPerkUse,
    undoLastPerkLog,
    setPerkUsed,
    updateInsuranceUsage,
  }
}

export function useUserCard(id) {
  const { cards } = useWallet()
  return cards.find(c => c.id === id)
}
