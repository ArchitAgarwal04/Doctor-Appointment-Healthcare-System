import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import * as api from '../../api'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function DoctorAppointmentsPage() {
  const [appts, setAppts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [prescModal, setPrescModal] = useState(null) // appointment obj
  const [prescForm, setPrescForm]   = useState({ medications: '', notes: '' })
  const [saving, setSaving]   = useState(false)

  const load = () => api.getDoctorAppointments().then(setAppts).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openPresc = (a) => { setPrescForm({ medications: '', notes: '' }); setPrescModal(a) }

  const submitPresc = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.createPrescription({ appointment_id: prescModal.id, ...prescForm })
      toast.success('Prescription written & appointment marked completed')
      setPrescModal(null)
      load()
    } catch (err) { toast.error(err?.detail || 'Failed') }
    finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => {
    try { await api.updateAppointmentStatus(id, status); toast.success('Status updated'); load() }
    catch (err) { toast.error(err?.detail || 'Failed') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">My Appointments</h1>
        <p className="text-slate-400 text-sm mt-1">All patient appointments assigned to you</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-800/60 text-xs text-slate-500">{appts.length} appointments</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>{['Patient', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                <th key={h} className="table-cell text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {appts.length === 0 ? (
                <tr><td colSpan={5} className="table-cell text-center py-12 text-slate-500">No appointments yet</td></tr>
              ) : appts.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {a.patient_name?.[0]}
                      </div>
                      <span className="font-medium text-slate-200">{a.patient_name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-slate-400">{a.date}</td>
                  <td className="table-cell text-accent-400 font-medium">{a.time_slot}</td>
                  <td className="table-cell"><Badge status={a.status} /></td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      {a.status === 'booked' && (
                        <>
                          <button onClick={() => openPresc(a)} className="btn-success btn-sm" id={`prescribe-${a.id}`}>
                            <FileText size={13} /> Prescribe
                          </button>
                          <button onClick={() => updateStatus(a.id, 'no-show')} className="btn-ghost btn-sm text-amber-400" id={`noshow-${a.id}`}>
                            No-show
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!prescModal} onClose={() => setPrescModal(null)} title={`Write Prescription — ${prescModal?.patient_name}`}>
        <form onSubmit={submitPresc} className="space-y-4">
          <div className="p-3 rounded-lg bg-navy-800 border border-slate-700/50 text-sm">
            <span className="text-slate-500">Appointment:</span>{' '}
            <span className="text-slate-300">{prescModal?.date} at {prescModal?.time_slot}</span>
          </div>
          <div>
            <label className="input-label">Medications</label>
            <textarea className="input resize-none h-24" required
              placeholder="e.g. Paracetamol 500mg — twice daily after meals"
              value={prescForm.medications} onChange={e => setPrescForm(f => ({ ...f, medications: e.target.value }))} />
          </div>
          <div>
            <label className="input-label">Clinical Notes</label>
            <textarea className="input resize-none h-24"
              placeholder="Diagnosis, observations, follow-up instructions…"
              value={prescForm.notes} onChange={e => setPrescForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setPrescModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : 'Submit Prescription'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
