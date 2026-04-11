import { useEffect, useState } from 'react'
import { Plus, Trash2, CalendarDays, Clock } from 'lucide-react'
import * as api from '../../api'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

const TIME_SLOTS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM']

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm] = useState({ date: '', time_slot: TIME_SLOTS[1] })

  const load = () => api.getMySchedules().then(setSchedules).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.addSchedule(form)
      toast.success('Slot added')
      setModal(false)
      load()
    } catch (err) { toast.error(err?.detail || 'Failed to add slot') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this schedule slot?')) return
    try { await api.deleteSchedule(id); toast.success('Slot removed'); load() }
    catch (err) { toast.error(err?.detail || 'Failed') }
  }

  // Group schedules by date
  const grouped = schedules.reduce((acc, s) => {
    const d = s.date; if (!acc[d]) acc[d] = []; acc[d].push(s); return acc
  }, {})

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Schedule</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your available appointment slots</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary" id="add-slot-btn">
          <Plus size={16} /> Add Slot
        </button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-slate-500">
          <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">No schedule slots yet</p>
          <p className="text-sm mt-1">Add your first available slot to start accepting appointments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => (
            <div key={date} className="glass rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800/60 flex items-center gap-2">
                <CalendarDays size={15} className="text-brand-400" />
                <span className="font-semibold text-slate-200">
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                </span>
                <span className="ml-auto text-xs text-slate-600">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {slots.sort((a, b) => a.time_slot.localeCompare(b.time_slot)).map(s => (
                  <div key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-600/15 border border-brand-500/30 text-brand-300 text-sm group">
                    <Clock size={13} />
                    <span>{s.time_slot}</span>
                    <button onClick={() => handleDelete(s.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-300 ml-1"
                      id={`del-slot-${s.id}`}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Schedule Slot">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="input-label">Date</label>
            <input type="date" className="input" required
              min={new Date().toISOString().split('T')[0]}
              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="input-label">Time Slot</label>
            <select className="input" value={form.time_slot} onChange={e => setForm(f => ({ ...f, time_slot: e.target.value }))}>
              {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : 'Add Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
