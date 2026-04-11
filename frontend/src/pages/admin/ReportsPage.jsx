import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import * as api from '../../api'
import Spinner from '../../components/ui/Spinner'

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-4 py-3 text-sm shadow-card">
      <p className="font-semibold text-slate-200">{payload[0].payload.doctor_name}</p>
      <p className="text-brand-400">{payload[0].value} appointments</p>
      <p className="text-slate-500 text-xs">{payload[0].payload.specialization}</p>
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTopDoctors().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Analytics and insights about your healthcare system</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-slate-200 mb-1">Top Doctors by Appointments</h3>
        <p className="text-xs text-slate-500 mb-6">Most booked doctors across all departments</p>
        {data.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No appointment data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="doctor_name" tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={v => v.replace('Dr. ', '')} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="booked_count" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h3 className="font-semibold text-slate-200">Doctor Leaderboard</h3>
        </div>
        <div className="divide-y divide-slate-800/60">
          {data.map((d, i) => (
            <div key={d.doctor_id} className="px-6 py-4 flex items-center gap-4 hover:bg-navy-700/20 transition-colors">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${i === 0 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' :
                  i === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-500/40' :
                  i === 2 ? 'bg-orange-600/20 text-orange-300 border border-orange-500/40' :
                  'bg-navy-700 text-slate-500 border border-slate-700'}`}>
                {i + 1}
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {d.doctor_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-200">{d.doctor_name}</p>
                <p className="text-xs text-slate-500">{d.specialization} · {d.department || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gradient">{d.booked_count}</p>
                <p className="text-xs text-slate-500">appointments</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
