export default function StatCard({ label, value, icon: Icon, color = 'indigo', trend }) {
  const colorMap = {
    indigo:  { card: 'stat-indigo',  icon: 'text-brand-400',   bg: 'bg-brand-600/20' },
    cyan:    { card: 'stat-cyan',    icon: 'text-accent-400',  bg: 'bg-accent-500/20' },
    emerald: { card: 'stat-emerald', icon: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    amber:   { card: 'stat-amber',   icon: 'text-amber-400',   bg: 'bg-amber-500/20' },
    rose:    { card: 'stat-rose',    icon: 'text-rose-400',    bg: 'bg-rose-500/20' },
  }
  const { card, icon, bg } = colorMap[color] || colorMap.indigo

  return (
    <div className={`${card} rounded-xl p-5 flex items-center gap-4 transition-transform duration-200 hover:-translate-y-0.5`}>
      <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={icon} />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value ?? '—'}</p>
        {trend && <p className="text-xs text-slate-500 mt-0.5">{trend}</p>}
      </div>
    </div>
  )
}
