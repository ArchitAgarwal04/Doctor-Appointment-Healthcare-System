import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Building2, Users, CalendarDays, FileText,
  BarChart2, Bell, Stethoscope, LogOut, ChevronLeft, ChevronRight,
  ClipboardList, Search
} from 'lucide-react'

const adminNav = [
  { to: '/dashboard',                icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/departments',    icon: Building2,       label: 'Departments' },
  { to: '/dashboard/admin/doctors',  icon: Users,           label: 'Doctors' },
  { to: '/dashboard/admin/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/dashboard/reports',        icon: BarChart2,       label: 'Reports' },
]

const doctorNav = [
  { to: '/dashboard',                   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/schedule',          icon: CalendarDays,    label: 'My Schedule' },
  { to: '/dashboard/doctor/appointments', icon: ClipboardList, label: 'Appointments' },
  { to: '/dashboard/doctor/notifications', icon: Bell,         label: 'Notifications' },
]

const patientNav = [
  { to: '/dashboard',                   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/find-doctors',      icon: Search,          label: 'Find Doctors' },
  { to: '/dashboard/my-appointments',   icon: CalendarDays,    label: 'My Appointments' },
  { to: '/dashboard/prescriptions',     icon: FileText,        label: 'Prescriptions' },
  { to: '/dashboard/patient/notifications', icon: Bell,        label: 'Notifications' },
]

const roleNavMap = { admin: adminNav, doctor: doctorNav, patient: patientNav }
const roleBadge  = { admin: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                      doctor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                      patient: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }

export default function Sidebar({ mobile = false, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = roleNavMap[user?.role] || []

  const handleLogout = () => { logout(); navigate('/login') }

  const width = collapsed && !mobile ? 'w-16' : 'w-64'

  return (
    <div className={`${width} h-full flex flex-col bg-navy-800/80 backdrop-blur-sm border-r border-slate-800 transition-all duration-300 relative`}>
      {/* Header */}
      <div className={`flex items-center ${collapsed && !mobile ? 'justify-center p-4' : 'gap-3 p-5'} border-b border-slate-800/60`}>
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-sm shadow-glow flex-shrink-0">🏥</div>
        {(!collapsed || mobile) && <span className="font-bold text-gradient text-lg">MediBook</span>}
        {!mobile && (
          <button onClick={() => setCollapsed(v => !v)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-navy-700">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* User info */}
      {(!collapsed || mobile) && (
        <div className="px-4 py-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-glow">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${roleBadge[user?.role] || ''} capitalize`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 no-scrollbar">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''} ${collapsed && !mobile ? 'justify-center px-2' : ''}`
            }>
            <Icon size={18} className="flex-shrink-0" />
            {(!collapsed || mobile) && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-800/60">
        <button onClick={handleLogout} id="sidebar-logout"
          className={`nav-item w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 ${collapsed && !mobile ? 'justify-center px-2' : ''}`}>
          <LogOut size={18} className="flex-shrink-0" />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )
}
