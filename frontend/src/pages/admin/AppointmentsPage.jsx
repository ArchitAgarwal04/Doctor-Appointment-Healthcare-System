import { useEffect, useState } from 'react'
import * as api from '../../api'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'

const STATUSES = ['', 'booked', 'completed', 'cancelled', 'no-show']

export default function AdminAppointmentsPage() {
  const [appts, setAppts]     = useState([])
  const [filter, setFilter]   = useState('')
  const [loading, setLoading] = useState(true)

  const load = (status) => {
    setLoading(true)
    api.getAdminAppointments(status).then(setAppts).finally(() => setLoading(false))
  }
  useEffect(() => { load('') }, [])

  const handleFilter = (s) => { setFilter(s); load(s) }

  const updateStatus = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status)
      toast.success('Status updated')
      load(filter)
    } catch (err) { toast.error(err?.detail || 'Failed') }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">All Appointments</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor and manage all appointments across the system</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button key={s || 'all'} onClick={() => handleFilter(s)}
            className={`btn-sm btn ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            id={`filter-${s || 'all'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-800/60 text-xs text-slate-500">{appts.length} appointment{appts.length !== 1 ? 's' : ''}</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>{['#', 'Patient', 'Doctor', 'Date', 'Time Slot', 'Status', 'Actions'].map(h => (
                  <th key={h} className="table-cell text-left">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {appts.length === 0 ? (
                  <tr><td colSpan={7} className="table-cell py-10 text-center text-slate-500">No appointments found</td></tr>
                ) : appts.map(a => (
                  <tr key={a.id} className="table-row">
                    <td className="table-cell text-slate-600 font-mono text-xs">#{a.id}</td>
                    <td className="table-cell font-medium text-slate-200">{a.patient_name}</td>
                    <td className="table-cell text-slate-400">{a.doctor_name}</td>
                    <td className="table-cell text-slate-400">{a.date}</td>
                    <td className="table-cell text-slate-400">{a.time_slot}</td>
                    <td className="table-cell"><Badge status={a.status} /></td>
                    <td className="table-cell">
                      <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)}
                        className="bg-navy-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:ring-1 focus:ring-brand-500 outline-none"
                        id={`status-select-${a.id}`}>
                        {['booked','completed','cancelled','no-show'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
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
