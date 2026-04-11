import { useEffect, useState } from 'react'
import { FileText, Pill } from 'lucide-react'
import * as api from '../../api'
import Spinner from '../../components/ui/Spinner'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPatientPrescriptions().then(setPrescriptions).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">My Prescriptions</h1>
        <p className="text-slate-400 text-sm mt-1">All prescriptions from your consultations</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-slate-500">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p>No prescriptions yet</p>
          <p className="text-sm mt-1">Prescriptions will appear here after your appointments are completed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {prescriptions.map(p => (
            <div key={p.id} className="glass-light rounded-xl overflow-hidden hover:border-emerald-500/25 transition-all duration-200">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-800/60 bg-emerald-500/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-200 truncate">{p.doctor_name}</p>
                  <p className="text-xs text-slate-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                    {' · '}Appt #{p.appointment_id}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Pill size={13} className="text-brand-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medications</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-navy-800/60 rounded-lg px-3 py-2.5 border border-slate-800">
                    {p.medications || '—'}
                  </p>
                </div>
                {p.notes && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={13} className="text-slate-500" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clinical Notes</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line bg-navy-800/60 rounded-lg px-3 py-2.5 border border-slate-800">
                      {p.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
