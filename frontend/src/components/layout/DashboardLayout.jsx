import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const roleTitle = { admin: '🔐 Admin Portal', doctor: '👨‍⚕️ Doctor Portal', patient: '🧑‍💼 Patient Portal' }

  return (
    <div className="flex h-screen overflow-hidden bg-navy-900">
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 h-full w-64 flex-shrink-0 animate-slide-in">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-800/60 bg-navy-800/40 backdrop-blur-sm flex-shrink-0">
          <button className="md:hidden text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => setMobileOpen(v => !v)} id="mobile-menu-toggle">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex-1">
            <p className="text-xs text-slate-500 uppercase tracking-widest">{roleTitle[user?.role]}</p>
            <h2 className="text-sm font-semibold text-slate-300">Welcome back, <span className="text-white">{user?.name}</span></h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white font-bold text-xs shadow-glow">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
