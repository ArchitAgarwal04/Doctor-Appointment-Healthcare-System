import { useEffect, useState } from 'react'
import { Users, Stethoscope, CalendarDays, Building2 } from 'lucide-react'
import * as api from '../../api'
import StatCard from '../../components/ui/StatCard'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

export default function AdminHome() {
  const [stats, setStats]   = useState(null)
  const [appts, setAppts]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getAdminAppointments()])
      .then(([s, a]) => { setStats(s); setAppts(a.slice(0, 8)) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your healthcare system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Doctors"      value={stats?.total_doctors}      icon={Stethoscope} color="cyan" />
        <StatCard label="Total Patients"     value={stats?.total_patients}     icon={Users}       color="emerald" />
        <StatCard label="Total Appointments" value={stats?.total_appointments} icon={CalendarDays} color="indigo" />
        <StatCard label="Departments"        value={stats?.total_departments}  icon={Building2}   color="amber" />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200">Recent Appointments</h3>
          <span className="text-xs text-slate-500">{appts.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                {['Patient', 'Doctor', 'Date', 'Time Slot', 'Status'].map(h => (
                  <th key={h} className="table-cell text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appts.length === 0 ? (
                <tr><td colSpan={5} className="table-cell text-center text-slate-500 py-8">No appointments yet</td></tr>
              ) : appts.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="table-cell font-medium text-slate-200">{a.patient_name}</td>
                  <td className="table-cell text-slate-400">{a.doctor_name}</td>
                  <td className="table-cell text-slate-400">{a.date}</td>
                  <td className="table-cell text-slate-400">{a.time_slot}</td>
                  <td className="table-cell"><Badge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
