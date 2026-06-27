export const DEFAULT_POINTS_TO_MYR = 0.005

/**
 * Estimated MYR return per RM1 spent.
 */
export function effectiveReturn(benefit, pointsToMyrRatio = DEFAULT_POINTS_TO_MYR) {
  if (!benefit) return 0
  if (benefit.type === 'cashback' && benefit.unit === 'percent') {
    return benefit.rate / 100
  }
  if (benefit.type === 'points' && benefit.unit === 'points_per_rm') {
    return benefit.rate * pointsToMyrRatio
  }
  return 0
}

export function formatRate(benefit) {
  if (!benefit) return ''
  if (benefit.type === 'cashback') return `${benefit.rate}% cashback`
  if (benefit.type === 'points') return `${benefit.rate}× points`
  return ''
}

export function formatMyr(n) {
  if (n == null) return '—'
  return `RM ${n.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`
}

/**
 * Classify a card by its reward proposition. Derived from benefits — no schema field needed.
 * @returns {"cashback"|"points"|"hybrid"}
 */
export function rewardTypeOf(card) {
  if (!card) return 'cashback'
  const hasPoints = card.benefits.some(b => b.type === 'points' && b.rate > 0)
  const hasCashback = card.benefits.some(b => b.type === 'cashback' && b.rate > 0)
  if (hasPoints && hasCashback) return 'hybrid'
  if (hasPoints) return 'points'
  return 'cashback'
}

/**
 * Sum cashback earned across all cap-tracked benefits for the current period.
 * Uses the spend amount in BenefitProgress: earned = min(amount * rate%, cashbackCap).
 * Ignores unlock_requirement trackers (no cashback themselves).
 */
export function cashbackEarnedThisPeriod(card, userCard, getProgress) {
  if (!card || !userCard) return 0
  let total = 0
  for (const b of card.benefits) {
    if (b.type !== 'cashback' || b.rate <= 0) continue
    if (b.thresholdType !== 'max_benefit_cap') continue
    if (b.trackingUnit !== 'myr') continue
    const { amount } = getProgress(userCard.id, b, userCard.annualFeeRenewalDate)
    const earned = amount * (b.rate / 100)
    const capped = b.cashbackCap != null ? Math.min(earned, b.cashbackCap) : earned
    total += capped
  }
  return total
}
