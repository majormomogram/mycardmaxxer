import { BANKS } from '../../constants/banks.js'

export default function CardTile({ card, footer, onClick, compact = false }) {
  const bank = BANKS[card.bankId] || { gradient: 'linear-gradient(135deg, #1f2937, #374151)' }
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden text-white shadow-lg transition-transform ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{ background: bank.gradient, minHeight: compact ? 140 : 200 }}
    >
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4), transparent 40%)'
      }} />
      <div className="relative p-5 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-75">{card.bank}</div>
            <div className="text-lg font-semibold mt-1">{card.cardName}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">{card.network}</span>
            {card.dataConfidence === 'unverified' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-300/50">
                Unverified
              </span>
            )}
          </div>
        </div>
        <div className="mt-auto pt-4">
          {footer ?? (
            <div className="text-xs opacity-80">
              {card.annualFee === 0 ? 'Lifetime free' : `Annual fee RM${card.annualFee}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
