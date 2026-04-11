import { useEffect, useState } from 'react'
import { Bell, Calendar } from 'lucide-react'
import * as api from '../../api'
import Spinner from '../../components/ui/Spinner'

export default function DoctorNotifications() {
  const [notes, setNotes]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.getNotifications().then(setNotes).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">Your upcoming patient appointments</p>
      </div>

      {notes.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-slate-500">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p>No upcoming appointments — you're all clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n, i) => (
            <div key={i} className="glass-light rounded-xl px-5 py-4 flex items-start gap-4 hover:border-brand-500/25 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={16} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200">{n.message}</p>
                <p className="text-xs text-slate-500 mt-1">{n.date}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
