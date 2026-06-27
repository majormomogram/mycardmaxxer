import { differenceInDays, format, addYears, parseISO, isAfter, startOfMonth, addMonths } from 'date-fns'

export function daysUntil(isoDate) {
  if (!isoDate) return null
  return differenceInDays(parseISO(isoDate), new Date())
}

export function colorForCountdown(days) {
  if (days == null) return 'gray'
  if (days < 0) return 'red'
  if (days < 30) return 'red'
  if (days < 60) return 'amber'
  return 'green'
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return format(parseISO(iso), 'd MMM yyyy')
}

export function fmtShortDate(iso) {
  if (!iso) return '—'
  return format(parseISO(iso), 'd MMM')
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Generate the period key for a given reset cadence.
 * @param {"monthly"|"annual"|"card_anniversary"|"never"} cadence
 * @param {string|null} anniversaryISO - card annual fee renewal date
 */
export function periodKey(cadence, anniversaryISO = null, ref = new Date()) {
  if (cadence === 'never') return 'all-time'
  if (cadence === 'monthly') return format(ref, 'yyyy-MM')
  if (cadence === 'annual') return format(ref, 'yyyy')
  if (cadence === 'card_anniversary') {
    if (!anniversaryISO) return format(ref, 'yyyy')
    const anniv = parseISO(anniversaryISO)
    let cardYearStart = new Date(ref.getFullYear(), anniv.getMonth(), anniv.getDate())
    if (isAfter(cardYearStart, ref)) {
      cardYearStart = new Date(ref.getFullYear() - 1, anniv.getMonth(), anniv.getDate())
    }
    return `${format(cardYearStart, 'yyyy-MM-dd')}-anniv`
  }
  return 'unknown'
}

/**
 * Twelve months of the current card year, anchored to the AF anniversary date.
 * Returns [{ key: "2026-07", label: "Jul 26", isCurrent: bool, isFuture: bool }]
 */
export function cardYearMonths(anniversaryISO, ref = new Date()) {
  if (!anniversaryISO) {
    const startCal = startOfMonth(new Date(ref.getFullYear(), 0, 1))
    return Array.from({ length: 12 }, (_, i) => {
      const m = addMonths(startCal, i)
      return {
        key: format(m, 'yyyy-MM'),
        label: format(m, 'MMM yy'),
        isCurrent: format(m, 'yyyy-MM') === format(ref, 'yyyy-MM'),
        isFuture: m > ref,
      }
    })
  }
  const anniv = parseISO(anniversaryISO)
  let cardYearStart = new Date(ref.getFullYear(), anniv.getMonth(), 1)
  const refMonth = new Date(ref.getFullYear(), ref.getMonth(), 1)
  if (cardYearStart > refMonth) {
    cardYearStart = new Date(ref.getFullYear() - 1, anniv.getMonth(), 1)
  }
  return Array.from({ length: 12 }, (_, i) => {
    const m = addMonths(cardYearStart, i)
    return {
      key: format(m, 'yyyy-MM'),
      label: format(m, 'MMM yy'),
      isCurrent: format(m, 'yyyy-MM') === format(ref, 'yyyy-MM'),
      isFuture: m > refMonth,
    }
  })
}

/**
 * Human-readable label for when the current period ends.
 */
export function periodEndLabel(cadence, anniversaryISO = null, ref = new Date()) {
  if (cadence === 'never') return 'No reset'
  if (cadence === 'monthly') {
    const next = startOfMonth(new Date(ref.getFullYear(), ref.getMonth() + 1, 1))
    return `Resets ${format(next, 'd MMM')}`
  }
  if (cadence === 'annual') {
    return `Resets 1 Jan ${ref.getFullYear() + 1}`
  }
  if (cadence === 'card_anniversary') {
    if (!anniversaryISO) return 'Resets on card anniversary'
    const anniv = parseISO(anniversaryISO)
    let next = new Date(ref.getFullYear(), anniv.getMonth(), anniv.getDate())
    if (!isAfter(next, ref)) next = addYears(next, 1)
    return `Resets ${format(next, 'd MMM yyyy')}`
  }
  return ''
}
