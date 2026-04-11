import { useEffect, useState } from 'react'
import { CalendarDays, FileText, Search, Bell } from 'lucide-react'
import * as api from '../../api'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function PatientHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appts, setAppts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPatientHistory().then(setAppts).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming   = appts.filter(a => a.date >= today && a.status === 'booked')
  const completed  = appts.filter(a => a.status === 'completed')
  const cancelled  = appts.filter(a => a.status === 'cancelled')

  const quickLinks = [
    { label: 'Find a Doctor',       icon: Search,      path: '/dashboard/find-doctors',    color: 'indigo' },
    { label: 'My Appointments',     icon: CalendarDays, path: '/dashboard/my-appointments', color: 'cyan' },
    { label: 'View Prescriptions',  icon: FileText,    path: '/dashboard/prescriptions',   color: 'emerald' },
    { label: 'Notifications',       icon: Bell,        path: '/dashboard/patient/notifications', color: 'amber' },
  ]

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, <span className="text-gradient">{user?.name}</span></h1>
        <p className="text-slate-400 text-sm mt-1">Your health dashboard at a glance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Upcoming"  value={upcoming.length}  icon={CalendarDays} color="indigo" />
        <StatCard label="Completed" value={completed.length} icon={FileText}     color="emerald" />
        <StatCard label="Cancelled" value={cancelled.length} icon={CalendarDays} color="rose" />
        <StatCard label="Total"     value={appts.length}     icon={CalendarDays} color="cyan" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickLinks.map(({ label, icon: Icon, path, color }) => {
          const cmap = {
            indigo:  'from-brand-600/30 to-brand-800/20 border-brand-500/30 text-brand-300',
            cyan:    'from-accent-500/25 to-accent-700/15 border-accent-500/30 text-accent-400',
            emerald: 'from-emerald-600/25 to-emerald-800/15 border-emerald-500/30 text-emerald-400',
            amber:   'from-amber-500/25 to-amber-700/15 border-amber-500/30 text-amber-400',
          }
          return (
            <button key={label} onClick={() => navigate(path)} id={`quick-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border bg-gradient-to-b ${cmap[color]} hover:-translate-y-1 transition-all duration-200 cursor-pointer text-center`}>
              <Icon size={22} />
              <span className="text-sm font-medium text-slate-200">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Upcoming appointments */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200">Upcoming Appointments</h3>
          <button onClick={() => navigate('/dashboard/my-appointments')} className="btn-ghost btn-sm text-brand-400">View All →</button>
        </div>
        {upcoming.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-500">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p>No upcoming appointments.</p>
            <button onClick={() => navigate('/dashboard/find-doctors')} className="btn-primary mt-4 btn-sm">Book Now</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {upcoming.slice(0, 5).map(a => (
              <div key={a.id} className="px-6 py-4 flex items-center gap-4 hover:bg-navy-700/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {a.doctor_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200">{a.doctor_name}</p>
                  <p className="text-xs text-slate-500">{a.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-accent-400">{a.time_slot}</p>
                  <Badge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
