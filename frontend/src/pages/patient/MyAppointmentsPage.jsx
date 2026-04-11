import { useEffect, useState } from 'react'
import { CalendarDays, XCircle } from 'lucide-react'
import * as api from '../../api'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog, { useConfirm } from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function MyAppointmentsPage() {
  const [appts, setAppts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [cancelling, setCancelling] = useState(null)
  const { confirmProps, requestConfirm } = useConfirm()

  const load = () => api.getPatientHistory().then(setAppts).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    const ok = await requestConfirm({
      title: 'Cancel Appointment?',
      message: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
    })
    if (!ok) return
    setCancelling(id)
    try {
      await api.cancelAppointment(id)
      toast.success('Appointment cancelled')
      load()
    } catch (err) {
      toast.error(err?.detail || 'Cannot cancel appointment')
    } finally {
      setCancelling(null)
    }
  }

  const filtered = appts.filter(a => filter === 'all' || a.status === filter)

  const tabs = [
    { key: 'all',       label: 'All' },
    { key: 'booked',    label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <ConfirmDialog {...confirmProps} confirmText="Yes, Cancel It" confirmClass="btn-danger" />

      <div>
        <h1 className="text-2xl font-bold text-white">My Appointments</h1>
        <p className="text-slate-400 text-sm mt-1">Track all your scheduled and past consultations</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} id={`tab-${t.key}`}
            className={`btn btn-sm ${filter === t.key ? 'btn-primary' : 'btn-secondary'}`}>
            {t.label}
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${filter === t.key ? 'bg-white/20' : 'bg-slate-700'}`}>
              {appts.filter(a => t.key === 'all' ? true : a.status === t.key).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-slate-500">
          <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
          <p>No {filter !== 'all' ? filter : ''} appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="glass-light rounded-xl px-5 py-4 flex items-center gap-4 hover:border-slate-700 transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {a.doctor_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200">{a.doctor_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {a.date} · {a.time_slot} · <span className="font-mono">#{a.id}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge status={a.status} />
                {a.status === 'booked' && (
                  <button onClick={() => handleCancel(a.id)} disabled={cancelling === a.id}
                    className="btn-danger btn-sm" id={`cancel-appt-${a.id}`}>
                    {cancelling === a.id ? <Spinner size="sm" /> : <><XCircle size={13} /> Cancel</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
