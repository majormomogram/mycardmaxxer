import { useCallback, useEffect, useState } from 'react'
import { read, write } from '../utils/storage.js'
import { periodKey, todayISO } from '../utils/dates.js'

const KEY = 'benefit_progress'

/**
 * @typedef {Object} BenefitProgress
 * @property {string} userCardId
 * @property {string} benefitId
 * @property {string} periodKey
 * @property {number} amount
 * @property {string} updatedAt
 */

function loadAll() {
  return read(KEY, [])
}

function rowKey(userCardId, benefitId, pkey) {
  return `${userCardId}|${benefitId}|${pkey}`
}

export function useBenefitProgress() {
  const [rows, setRows] = useState(loadAll)

  useEffect(() => {
    const onStorage = () => setRows(loadAll())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next) => {
    write(KEY, next)
    setRows(next)
  }, [])

  const getProgress = useCallback((userCardId, benefit, anniversaryISO) => {
    const pkey = periodKey(benefit.resetCadence, anniversaryISO)
    const row = loadAll().find(r =>
      r.userCardId === userCardId && r.benefitId === benefit.id && r.periodKey === pkey
    )
    return { amount: row?.amount ?? 0, periodKey: pkey, updatedAt: row?.updatedAt ?? null }
  }, [])

  const setProgress = useCallback((userCardId, benefit, anniversaryISO, amount, breakdown) => {
    const pkey = periodKey(benefit.resetCadence, anniversaryISO)
    const all = loadAll()
    const idx = all.findIndex(r =>
      r.userCardId === userCardId && r.benefitId === benefit.id && r.periodKey === pkey
    )
    const prev = idx >= 0 ? all[idx] : null
    const next = {
      userCardId,
      benefitId: benefit.id,
      periodKey: pkey,
      amount,
      breakdown: breakdown !== undefined ? breakdown : prev?.breakdown,
      updatedAt: todayISO()
    }
    const updated = idx >= 0
      ? all.map((r, i) => i === idx ? next : r)
      : [...all, next]
    persist(updated)
  }, [persist])

  /**
   * Set the monthly breakdown for a benefit. The aggregate `amount` is derived from the sum.
   * breakdown is an object keyed by "YYYY-MM" → number.
   */
  const setBreakdown = useCallback((userCardId, benefit, anniversaryISO, breakdown) => {
    const sum = Object.values(breakdown).reduce((s, v) => s + (Number(v) || 0), 0)
    setProgress(userCardId, benefit, anniversaryISO, sum, breakdown)
  }, [setProgress])

  const getBreakdown = useCallback((userCardId, benefit, anniversaryISO) => {
    const pkey = periodKey(benefit.resetCadence, anniversaryISO)
    const row = loadAll().find(r =>
      r.userCardId === userCardId && r.benefitId === benefit.id && r.periodKey === pkey
    )
    return row?.breakdown || {}
  }, [])

  return { rows, getProgress, setProgress, setBreakdown, getBreakdown }
}
