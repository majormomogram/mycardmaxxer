import { Link } from 'react-router-dom'
import { BANKS } from '../../constants/banks.js'
import { daysUntil, colorForCountdown, fmtShortDate } from '../../utils/dates.js'
import { rewardTypeOf, cashbackEarnedThisPeriod, formatMyr } from '../../utils/points.js'
import { useBenefitProgress } from '../../hooks/useBenefitProgress.js'

export default function WalletCardTile({ card, userCard }) {
  const bank = BANKS[card.bankId] || { gradient: 'linear-gradient(135deg, #1f2937, #374151)' }
  const rewardType = rewardTypeOf(card)
  const { getProgress } = useBenefitProgress()

  const afDays = daysUntil(userCard.annualFeeRenewalDate)
  const ptsExpiryDays = daysUntil(userCard.pointsExpiryDate)
  const ptsStale = daysUntil(userCard.pointsLastUpdated)
  const ptsStaleDays = ptsStale != null ? Math.abs(ptsStale) : null

  const perks = card.perks.filter(p => p.quantity < 999)

  const isCashback = rewardType === 'cashback'
  const cashbackThisMonth = isCashback ? cashbackEarnedThisPeriod(card, userCard, getProgress) : 0
  const feeWaiverBenefit = card.benefits.find(b =>
    b.thresholdType === 'unlock_requirement' && b.resetCadence === 'card_anniversary'
  )
  const feeWaiverProgress = feeWaiverBenefit
    ? getProgress(userCard.id, feeWaiverBenefit, userCard.annualFeeRenewalDate)
    : null

  return (
    <Link
      to={`/wallet/${userCard.id}`}
      className="block rounded-2xl overflow-hidden text-white shadow-lg hover:scale-[1.01] transition-transform"
      style={{ background: bank.gradient }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider opacity-75">{card.bank}</div>
            <div className="text-lg font-semibold leading-tight">
              {userCard.nickname || card.cardName}
            </div>
            {userCard.last4 && (
              <div className="text-xs opacity-60 font-mono mt-0.5">•••• {userCard.last4}</div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">{card.network}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-70">{rewardType}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {isCashback ? (
            <>
              <Stat
                label="Cashback this month"
                value={formatMyr(cashbackThisMonth)}
                sub={cashbackThisMonth > 0 ? 'earned' : 'no spend logged'}
                tone={cashbackThisMonth > 0 ? 'green' : 'gray'}
              />
              <Stat
                label="Annual fee renews"
                value={afDays != null ? `${afDays}d` : '—'}
                sub={fmtShortDate(userCard.annualFeeRenewalDate)}
                tone={colorForCountdown(afDays)}
              />
              {feeWaiverBenefit && feeWaiverProgress && (
                <FeeWaiverProgress benefit={feeWaiverBenefit} progress={feeWaiverProgress} />
              )}
              <Stat
                label="Perks tracked"
                value={`${userCard.perkUsage?.length || 0}`}
                sub={perks.length ? `of ${perks.length}` : 'none'}
              />
            </>
          ) : (
            <>
              <Stat
                label="Points"
                value={userCard.pointsBalance.toLocaleString()}
                sub={ptsStaleDays != null ? `${ptsStaleDays}d ago` : 'never updated'}
                warn={ptsStaleDays != null && ptsStaleDays > 45}
              />
              <Stat
                label="Points expiry"
                value={ptsExpiryDays != null ? `${ptsExpiryDays}d` : '—'}
                sub={fmtShortDate(userCard.pointsExpiryDate)}
                tone={colorForCountdown(ptsExpiryDays)}
              />
              <Stat
                label="Annual fee"
                value={afDays != null ? `${afDays}d` : '—'}
                sub={fmtShortDate(userCard.annualFeeRenewalDate)}
                tone={colorForCountdown(afDays)}
              />
              <Stat
                label="Perks tracked"
                value={`${userCard.perkUsage?.length || 0}`}
                sub={perks.length ? `of ${perks.length}` : 'none'}
              />
            </>
          )}
        </div>

        {perks.length > 0 && userCard.perkUsage?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/15 space-y-1.5">
            {perks.slice(0, 3).map(perk => {
              const usage = userCard.perkUsage.find(u => u.perkId === perk.id)
              if (!usage) return null
              const pct = Math.min(100, (usage.used / perk.quantity) * 100)
              return (
                <div key={perk.id}>
                  <div className="flex justify-between text-[11px] opacity-90 mb-0.5">
                    <span className="truncate pr-2">{perk.name}</span>
                    <span className="whitespace-nowrap">{usage.used}/{perk.quantity}</span>
                  </div>
                  <div className="h-1 bg-white/15 rounded-full overflow-hidden">
                    <div className="h-full bg-white/70" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {perks.length > 3 && (
              <div className="text-[10px] opacity-60">+{perks.length - 3} more</div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

function Stat({ label, value, sub, tone, warn }) {
  const toneColors = {
    red: 'text-red-300',
    amber: 'text-amber-300',
    green: 'text-emerald-300',
    gray: 'text-white',
  }
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider opacity-60">{label}</div>
      <div className={`text-lg font-bold leading-tight ${toneColors[tone] || 'text-white'} ${warn ? 'text-amber-300' : ''}`}>
        {value}
      </div>
      <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>
    </div>
  )
}

function FeeWaiverProgress({ benefit, progress }) {
  const pct = Math.min(100, (progress.amount / benefit.threshold) * 100)
  const reached = progress.amount >= benefit.threshold
  return (
    <div className="col-span-2">
      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">AF waiver YTD</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-base font-bold ${reached ? 'text-emerald-300' : 'text-white'}`}>
          {formatMyr(progress.amount)}
        </span>
        <span className="text-[11px] opacity-60">of {formatMyr(benefit.threshold)}</span>
      </div>
      <div className="h-1 bg-white/15 rounded-full overflow-hidden mt-1">
        <div className={`h-full ${reached ? 'bg-emerald-300' : 'bg-white/70'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
