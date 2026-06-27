export default function ProgressBar({ value, max, color = 'blue', height = 8 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  }
  return (
    <div className="w-full bg-gray-800 rounded-full overflow-hidden" style={{ height }}>
      <div className={`${colors[color]} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}
