import { useEffect, useState } from 'react'
import { Search, Stethoscope, Calendar, X, ChevronRight } from 'lucide-react'
import * as api from '../../api'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function FindDoctorsPage() {
  const [doctors, setDoctors]   = useState([])
  const [depts, setDepts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deptFilter, setDeptFilter] = useState('')

  const [bookModal, setBookModal] = useState(null) // doctor obj
  const [slots, setSlots]         = useState({ available: [] })
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selected, setSelected]   = useState(null) // { date, time_slot }
  const [booking, setBooking]     = useState(false)

  useEffect(() => {
    Promise.all([api.getDoctors(), api.getDepartments()])
      .then(([d, deps]) => { setDoctors(d); setDepts(deps) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase())
    const matchDept   = !deptFilter || String(d.department_id) === deptFilter
    return matchSearch && matchDept
  })

  const openBook = async (doc) => {
    setBookModal(doc); setSelected(null); setSlotsLoading(true)
    try {
      const data = await api.getAvailableSlots(doc.id)
      setSlots(data)
    } catch { setSlots({ available: [] }) }
    finally { setSlotsLoading(false) }
  }

  // Group available slots by date
  const groupedSlots = slots.available?.reduce((acc, s) => {
    const d = String(s.date); if (!acc[d]) acc[d] = []; acc[d].push(s); return acc
  }, {}) || {}

  const handleBook = async () => {
    if (!selected) return
    setBooking(true)
    try {
      await api.bookAppointment({ doctor_id: bookModal.id, date: selected.date, time_slot: selected.time_slot })
      toast.success('Appointment booked successfully!')
      setBookModal(null)
    } catch (err) { toast.error(err?.detail || 'Booking failed') }
    finally { setBooking(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Find Doctors</h1>
        <p className="text-slate-400 text-sm mt-1">Search by name, specialisation, or department</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search doctors or specialisation…"
            value={search} onChange={e => setSearch(e.target.value)} id="doctor-search" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>
        <select className="input sm:w-52" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} id="dept-filter">
          <option value="">All Departments</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <p className="text-xs text-slate-500">{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Doctor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="glass-light rounded-xl p-5 flex flex-col gap-4 hover:border-brand-500/30 transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-glow">
                {doc.name[0]}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-200 truncate">{doc.name}</h3>
                {doc.department && <p className="text-xs text-slate-500 truncate">{doc.department}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope size={14} className="text-accent-400 flex-shrink-0" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400 border border-accent-500/25">{doc.specialization}</span>
            </div>
            {doc.bio && <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{doc.bio}</p>}
            <button onClick={() => openBook(doc)} id={`book-${doc.id}`}
              className="btn-primary w-full mt-auto">
              <Calendar size={15} /> Book Appointment
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-500">
            <Stethoscope size={48} className="mx-auto mb-4 opacity-30" />
            <p>No doctors match your search</p>
          </div>
        )}
      </div>

      {/* Book Modal */}
      <Modal open={!!bookModal} onClose={() => setBookModal(null)} title={`Book with ${bookModal?.name}`} size="lg">
        {slotsLoading ? (
          <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-800 border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {bookModal?.name[0]}
              </div>
              <div>
                <p className="font-medium text-slate-200">{bookModal?.name}</p>
                <p className="text-xs text-slate-500">{bookModal?.specialization} · {bookModal?.department}</p>
              </div>
            </div>

            {Object.keys(groupedSlots).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                <p>No available slots at this time</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {Object.entries(groupedSlots).sort(([a],[b]) => a.localeCompare(b)).map(([date, dateSlots]) => (
                  <div key={date}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
                      {new Date(date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dateSlots.map(s => {
                        const isSelected = selected?.date === date && selected?.time_slot === s.time_slot
                        return (
                          <button key={s.id} onClick={() => setSelected({ date, time_slot: s.time_slot })}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                              isSelected
                                ? 'bg-brand-600 text-white shadow-glow border border-brand-400'
                                : 'bg-navy-800 text-slate-300 border border-slate-700 hover:border-brand-500/50 hover:text-brand-300'
                            }`}
                            id={`slot-${s.id}`}>
                            {s.time_slot}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selected && (
              <div className="p-3 rounded-lg bg-brand-600/10 border border-brand-500/30 text-sm text-brand-300">
                Selected: <strong>{selected.date}</strong> at <strong>{selected.time_slot}</strong>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setBookModal(null)} className="btn-secondary">Cancel</button>
              <button disabled={!selected || booking} onClick={handleBook} className="btn-primary" id="confirm-book">
                {booking ? <Spinner size="sm" /> : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
