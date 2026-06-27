import { daysUntil, fmtDate } from '../../utils/dates.js'
import { useCards } from '../../hooks/useCards.js'
import { rewardTypeOf } from '../../utils/points.js'

export default function AlertsPanel({ cards }) {
  const allCards = useCards()
  const alerts = collectAlerts(cards, allCards)
  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-sm flex items-center gap-2">
        <span>✓</span> All good — no expiring points or perks right now.
      </div>
    )
  }
  return (
    <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4">
      <div className="text-sm font-semibold text-amber-200 mb-2">⚠ Attention</div>
      <ul className="space-y-1.5">
        {alerts.map((a, i) => (
          <li key={i} className="text-sm text-gray-200 flex items-start gap-2">
            <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 ${
              a.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
            }`} />
            <span>
              <strong className="text-white">{a.title}</strong>{' '}
              <span className="text-gray-400">{a.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function collectAlerts(cards, allCards) {
  const out = []
  for (const uc of cards) {
    const card = allCards.find(c => c.id === uc.cardId)
    const isCashback = card ? rewardTypeOf(card) === 'cashback' : false
    const cardLabel = uc.nickname || card?.cardName || uc.cardId

    if (!isCashback && uc.pointsExpiryDate) {
      const d = daysUntil(uc.pointsExpiryDate)
      if (d != null && d < 60) {
        out.push({
          severity: d < 30 ? 'high' : 'low',
          title: `${cardLabel}: ${uc.pointsBalance.toLocaleString()} points`,
          detail: d < 0 ? `expired ${Math.abs(d)} days ago` : `expire in ${d} days (${fmtDate(uc.pointsExpiryDate)})`
        })
      }
    }
    if (uc.annualFeeRenewalDate) {
      const d = daysUntil(uc.annualFeeRenewalDate)
      if (d != null && d > 0 && d < 60) {
        out.push({
          severity: d < 30 ? 'high' : 'low',
          title: `${cardLabel}: annual fee renewal`,
          detail: `in ${d} days (${fmtDate(uc.annualFeeRenewalDate)})`
        })
      }
    }
    if (!isCashback && uc.pointsLastUpdated) {
      const d = daysUntil(uc.pointsLastUpdated)
      if (d != null && d < -45) {
        out.push({
          severity: 'low',
          title: `${cardLabel}: points stale`,
          detail: `last updated ${Math.abs(d)} days ago`
        })
      }
    }
  }
  return out
}
