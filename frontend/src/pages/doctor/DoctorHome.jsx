import { useEffect, useState } from 'react'
import { CalendarDays, Clock, Users, CheckCircle } from 'lucide-react'
import * as api from '../../api'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'

export default function DoctorHome() {
  const { user } = useAuth()
  const [appts, setAppts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDoctorAppointments().then(setAppts).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts    = appts.filter(a => a.date === today && a.status === 'booked')
  const upcomingAppts = appts.filter(a => a.date >= today && a.status === 'booked')
  const completedTotal = appts.filter(a => a.status === 'completed').length

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Good day, <span className="text-gradient">{user?.name}</span></h1>
        <p className="text-slate-400 text-sm mt-1">Here's your schedule overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Today's Patients"   value={todayAppts.length}    icon={Users}       color="cyan" />
        <StatCard label="Upcoming"           value={upcomingAppts.length} icon={CalendarDays} color="indigo" />
        <StatCard label="Completed (All time)" value={completedTotal}     icon={CheckCircle} color="emerald" />
      </div>

      {/* Today's appointments */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-accent-400" />
            <h3 className="font-semibold text-slate-200">Today's Schedule</h3>
          </div>
          <span className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        {todayAppts.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p>No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {todayAppts.map(a => (
              <div key={a.id} className="px-6 py-4 flex items-center gap-4 hover:bg-navy-700/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {a.patient_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200">{a.patient_name}</p>
                  <p className="text-xs text-slate-500">Appointment #{a.id}</p>
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

      {/* Upcoming (next 7 days) */}
      {upcomingAppts.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/60">
            <h3 className="font-semibold text-slate-200">Upcoming Appointments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>{['Patient', 'Date', 'Time Slot', 'Status'].map(h => (
                  <th key={h} className="table-cell text-left">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {upcomingAppts.slice(0, 10).map(a => (
                  <tr key={a.id} className="table-row">
                    <td className="table-cell font-medium text-slate-200">{a.patient_name}</td>
                    <td className="table-cell text-slate-400">{a.date}</td>
                    <td className="table-cell text-accent-400 font-medium">{a.time_slot}</td>
                    <td className="table-cell"><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
