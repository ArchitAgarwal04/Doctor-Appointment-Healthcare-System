import { useEffect, useState } from 'react'
import { Bell, Calendar, CheckCheck } from 'lucide-react'
import * as api from '../../api'
import Spinner from '../../components/ui/Spinner'

export default function PatientNotifications() {
  const [notes, setNotes]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.getNotifications().then(setNotes).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">Reminders about your upcoming appointments</p>
        </div>
        {notes.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <CheckCheck size={13} /> {notes.length} active
          </span>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-slate-500">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p>You're all caught up!</p>
          <p className="text-sm mt-1">No upcoming appointments to remind you about</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n, i) => (
            <div key={i} className="glass-light rounded-xl px-5 py-4 flex items-start gap-4 hover:border-brand-500/25 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                <Calendar size={15} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {n.time ? new Date(n.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : n.date}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow flex-shrink-0 mt-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
