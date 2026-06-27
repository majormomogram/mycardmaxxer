import { useState } from 'react'
import { useBenefitProgress } from '../../hooks/useBenefitProgress.js'
import { categoryById } from '../../data/categories.js'
import { periodEndLabel, cardYearMonths } from '../../utils/dates.js'
import { formatMyr } from '../../utils/points.js'
import ProgressBar from '../shared/ProgressBar.jsx'

export default function BenefitProgressList({ card, userCard }) {
  const { getProgress, setProgress, getBreakdown, setBreakdown } = useBenefitProgress()
  const tracked = card.benefits.filter(b => b.trackingUnit != null)

  if (tracked.length === 0) {
    return <div className="text-sm text-gray-500 italic">No trackable benefits on this card.</div>
  }

  return (
    <div className="space-y-3">
      {tracked.map(benefit => (
        <ProgressRow
          key={benefit.id}
          benefit={benefit}
          userCard={userCard}
          getProgress={getProgress}
          setProgress={setProgress}
          getBreakdown={getBreakdown}
          setBreakdown={setBreakdown}
        />
      ))}
    </div>
  )
}

function ProgressRow({ benefit, userCard, getProgress, setProgress, getBreakdown, setBreakdown }) {
  const { amount, updatedAt } = getProgress(userCard.id, benefit, userCard.annualFeeRenewalDate)
  const cat = categoryById(benefit.category)
  const isUnlock = benefit.thresholdType === 'unlock_requirement'
  const isCap = benefit.thresholdType === 'max_benefit_cap'
  const isCount = benefit.trackingUnit === 'transactions'
  const isAnnual = benefit.resetCadence === 'card_anniversary' || benefit.resetCadence === 'annual'
  const supportsBreakdown = isAnnual && benefit.trackingUnit === 'myr'
  const reached = benefit.threshold != null && amount >= benefit.threshold

  const [expanded, setExpanded] = useState(false)

  let label = ''
  let color = 'blue'
  if (isUnlock) {
    if (reached) {
      label = `✓ Unlocked (${isCount ? amount : formatMyr(amount)} of ${isCount ? benefit.threshold : formatMyr(benefit.threshold)})`
      color = 'green'
    } else {
      const remain = benefit.threshold - amount
      label = isCount
        ? `${amount} of ${benefit.threshold} — ${remain} more to unlock`
        : `${formatMyr(amount)} of ${formatMyr(benefit.threshold)} — ${formatMyr(remain)} more to unlock`
      color = amount / benefit.threshold > 0.66 ? 'amber' : 'blue'
    }
  } else if (isCap) {
    if (reached) {
      label = `Cap hit — additional spend earns base rate only`
      color = 'red'
    } else {
      const remain = benefit.threshold - amount
      label = `${formatMyr(amount)} of ${formatMyr(benefit.threshold)} cap — ${formatMyr(remain)} left at full rate`
      color = amount / benefit.threshold > 0.66 ? 'amber' : 'green'
    }
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>{cat.icon}</span> {cat.label} · {periodEndLabel(benefit.resetCadence, userCard.annualFeeRenewalDate)}
          </div>
          <div className="text-sm font-semibold text-white mt-0.5">
            {benefit.rate > 0 && `${benefit.rate}${benefit.unit === 'percent' ? '%' : '×'} ${benefit.type}`}
            {benefit.rate === 0 && (isUnlock ? 'Unlock requirement' : 'Spend tracker')}
          </div>
          {benefit.conditions && (
            <div className="text-[11px] text-gray-500 mt-1">{benefit.conditions}</div>
          )}
        </div>
        {!supportsBreakdown && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{isCount ? '×' : 'RM'}</span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={e => setProgress(userCard.id, benefit, userCard.annualFeeRenewalDate, Number(e.target.value) || 0)}
              className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm text-right focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
        {supportsBreakdown && (
          <div className="text-right">
            <div className="text-base font-semibold text-white">{formatMyr(amount)}</div>
            <div className="text-[10px] text-gray-500">total YTD</div>
          </div>
        )}
      </div>
      <div className="mt-3">
        <ProgressBar value={amount} max={benefit.threshold || 1} color={color} />
        <div className={`mt-1.5 text-xs ${reached ? 'text-emerald-400' : 'text-gray-400'}`}>
          {label}
          {updatedAt && <span className="text-gray-600"> · updated {updatedAt}</span>}
        </div>
      </div>
      {supportsBreakdown && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-blue-300 hover:text-blue-200"
          >
            {expanded ? '− Hide' : '+ Show'} monthly breakdown
          </button>
          {expanded && (
            <MonthlyBreakdown
              benefit={benefit}
              userCard={userCard}
              getBreakdown={getBreakdown}
              setBreakdown={setBreakdown}
            />
          )}
        </div>
      )}
    </div>
  )
}

function MonthlyBreakdown({ benefit, userCard, getBreakdown, setBreakdown }) {
  const months = cardYearMonths(userCard.annualFeeRenewalDate)
  const breakdown = getBreakdown(userCard.id, benefit, userCard.annualFeeRenewalDate)

  const onChange = (mkey, value) => {
    const next = { ...breakdown, [mkey]: Number(value) || 0 }
    setBreakdown(userCard.id, benefit, userCard.annualFeeRenewalDate, next)
  }

  return (
    <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-2">
      {months.map(m => {
        const v = breakdown[m.key] ?? 0
        return (
          <label key={m.key} className={`block ${m.isFuture ? 'opacity-40' : ''}`}>
            <div className={`text-[10px] uppercase tracking-wider mb-1 ${m.isCurrent ? 'text-emerald-300' : 'text-gray-500'}`}>
              {m.label}{m.isCurrent ? ' · now' : ''}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500">RM</span>
              <input
                type="number"
                min={0}
                value={v || ''}
                placeholder="0"
                onChange={e => onChange(m.key, e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-1.5 py-1 text-white text-xs text-right focus:outline-none focus:border-blue-500"
              />
            </div>
          </label>
        )
      })}
    </div>
  )
}
