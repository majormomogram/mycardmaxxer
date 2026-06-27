import { useWallet } from '../../hooks/useWallet.js'

export default function InsuranceUsageView({ card, userCard }) {
  const { updateInsuranceUsage } = useWallet()

  if (card.insurance.length === 0) {
    return <div className="text-sm text-gray-500 italic">No insurance coverage on file for this card.</div>
  }

  return (
    <div className="space-y-3">
      {card.insurance.map((ins, i) => {
        const usage = userCard.insuranceUsage.find(u => u.type === ins.type && u.name === ins.name)
          || userCard.insuranceUsage.find(u => u.type === ins.type)
          || { claimsThisYear: 0, notes: '' }
        return (
          <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-white">{ins.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{ins.description}</div>
                {ins.conditions && <div className="text-[11px] text-gray-500 italic mt-0.5">{ins.conditions}</div>}
              </div>
              {ins.coverageAmount != null && (
                <div className="text-xs text-gray-300 whitespace-nowrap">
                  Up to {ins.currency} {ins.coverageAmount.toLocaleString('en-MY')}
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-[120px_1fr] gap-3 items-start">
              <div>
                <div className="text-[11px] text-gray-500 mb-1">Claims this year</div>
                <input
                  type="number"
                  min={0}
                  value={usage.claimsThisYear}
                  onChange={e => updateInsuranceUsage(userCard.id, ins.type, {
                    name: ins.name,
                    claimsThisYear: Number(e.target.value) || 0,
                    notes: usage.notes,
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 mb-1">Notes</div>
                <input
                  placeholder="e.g. RM500 baggage claim in Mar"
                  value={usage.notes}
                  onChange={e => updateInsuranceUsage(userCard.id, ins.type, {
                    name: ins.name,
                    claimsThisYear: usage.claimsThisYear,
                    notes: e.target.value,
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                />
              </div>
            </div>
          </div>
        )
      })}
      <div className="text-[11px] text-gray-500 italic">
        Informational only. Coverage subject to cardmember agreement.
      </div>
    </div>
  )
}
