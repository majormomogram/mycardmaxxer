import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../../hooks/useWallet.js'
import { useCards } from '../../hooks/useCards.js'
import { useBenefitProgress } from '../../hooks/useBenefitProgress.js'
import { todayISO, fmtDate } from '../../utils/dates.js'
import { rewardTypeOf, cashbackEarnedThisPeriod, formatMyr } from '../../utils/points.js'
import { format, addDays } from 'date-fns'

export default function MonthlyCheckIn() {
  const { cards: userCards, updatePoints } = useWallet()
  const allCards = useCards()
  const { getProgress, setProgress } = useBenefitProgress()
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState(() => {
    const d = {}
    for (const uc of userCards) {
      d[uc.id] = { points: uc.pointsBalance, benefits: {} }
      const card = allCards.find(c => c.id === uc.cardId)
      if (card) {
        for (const b of card.benefits.filter(b => b.trackingUnit != null)) {
          const { amount } = getProgress(uc.id, b, uc.annualFeeRenewalDate)
          d[uc.id].benefits[b.id] = amount
        }
      }
    }
    return d
  })
  const [done, setDone] = useState(false)

  if (userCards.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No cards in wallet to check in.</p>
        <Link to="/wallet" className="text-blue-400 text-sm">Back</Link>
      </div>
    )
  }

  const saveAll = () => {
    let updated = 0
    for (const uc of userCards) {
      const d = drafts[uc.id]
      const card = allCards.find(c => c.id === uc.cardId)
      const isCashback = rewardTypeOf(card) === 'cashback'
      if (!isCashback && d.points !== uc.pointsBalance) {
        updatePoints(uc.id, d.points)
        updated++
      }
      if (!card) continue
      for (const b of card.benefits.filter(b => b.trackingUnit != null)) {
        const newAmt = d.benefits[b.id] ?? 0
        const { amount } = getProgress(uc.id, b, uc.annualFeeRenewalDate)
        if (newAmt !== amount) {
          setProgress(uc.id, b, uc.annualFeeRenewalDate, newAmt)
        }
      }
    }
    setDone({ updated, nextDate: format(addDays(new Date(), 30), 'd MMM yyyy') })
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-white mb-2">Check-in complete</h2>
        <p className="text-sm text-gray-400 mb-1">Updated {done.updated} card{done.updated === 1 ? '' : 's'}.</p>
        <p className="text-xs text-gray-500 mb-6">Suggested next check-in: {done.nextDate}</p>
        <button onClick={() => navigate('/wallet')} className="bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100">
          Back to wallet
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Link to="/wallet" className="text-sm text-gray-400 hover:text-white">← Cancel</Link>
      <header className="mt-3 mb-6">
        <h1 className="text-3xl font-bold text-white">Monthly check-in</h1>
        <p className="text-sm text-gray-400 mt-1">Update points balance and benefit progress for each card. Pre-filled with last values.</p>
      </header>

      <div className="space-y-4">
        {userCards.map(uc => {
          const card = allCards.find(c => c.id === uc.cardId)
          if (!card) return null
          const tracked = card.benefits.filter(b => b.trackingUnit != null)
          const isCashback = rewardTypeOf(card) === 'cashback'
          const cashbackThisMonth = isCashback
            ? cashbackEarnedThisPeriod(card, uc, (ucId, b, anniv) => ({
                amount: drafts[ucId]?.benefits?.[b.id] ?? 0
              }))
            : 0
          return (
            <div key={uc.id} className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-white">{uc.nickname || card.cardName}</div>
                  <div className="text-xs text-gray-500">{card.bank}{uc.last4 ? ` · •••• ${uc.last4}` : ''}</div>
                </div>
                <div className="text-[11px] text-gray-500">
                  {isCashback
                    ? <>Cashback so far: <span className="text-emerald-300">{formatMyr(cashbackThisMonth)}</span></>
                    : <>Last points update: {uc.pointsLastUpdated ? fmtDate(uc.pointsLastUpdated) : 'never'}</>
                  }
                </div>
              </div>

              {!isCashback && (
                <label className="block mb-3">
                  <div className="text-xs text-gray-400 mb-1">Points balance</div>
                  <input
                    type="number"
                    value={drafts[uc.id].points}
                    onChange={e => setDrafts(d => ({ ...d, [uc.id]: { ...d[uc.id], points: Number(e.target.value) || 0 } }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </label>
              )}

              {tracked.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <div className="text-xs text-gray-400 mb-1">Benefit progress this period</div>
                  {tracked.map(b => (
                    <div key={b.id} className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-300 flex-1 truncate">
                        {b.category} {b.conditions ? '·' : ''} <span className="text-gray-500">{b.thresholdType === 'unlock_requirement' ? 'unlock' : 'cap'} {b.threshold}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-500">{b.trackingUnit === 'transactions' ? '×' : 'RM'}</span>
                        <input
                          type="number"
                          min={0}
                          value={drafts[uc.id].benefits[b.id] ?? 0}
                          onChange={e => setDrafts(d => ({
                            ...d,
                            [uc.id]: { ...d[uc.id], benefits: { ...d[uc.id].benefits, [b.id]: Number(e.target.value) || 0 } }
                          }))}
                          className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="sticky bottom-0 mt-6 -mx-8 px-8 py-4 bg-gradient-to-t from-[#0a0a0f] to-transparent">
        <button onClick={saveAll} className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100">
          Save all updates
        </button>
      </div>
    </div>
  )
}
