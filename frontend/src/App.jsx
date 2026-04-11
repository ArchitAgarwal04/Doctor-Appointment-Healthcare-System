import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import DashboardLayout from './components/layout/DashboardLayout'
import Spinner from './components/ui/Spinner'

// Admin pages
import AdminHome        from './pages/admin/AdminHome'
import DepartmentsPage  from './pages/admin/DepartmentsPage'
import AdminDoctorsPage from './pages/admin/DoctorsPage'
import AdminAppointmentsPage from './pages/admin/AppointmentsPage'
import ReportsPage      from './pages/admin/ReportsPage'

// Doctor pages
import DoctorHome     from './pages/doctor/DoctorHome'
import SchedulePage   from './pages/doctor/SchedulePage'
import DoctorAppointmentsPage from './pages/doctor/AppointmentsPage'
import DoctorNotifications from './pages/doctor/NotificationsPage'

// Patient pages
import PatientHome    from './pages/patient/PatientHome'
import FindDoctors    from './pages/patient/FindDoctorsPage'
import MyAppointments from './pages/patient/MyAppointmentsPage'
import Prescriptions  from './pages/patient/PrescriptionsPage'
import PatientNotifications from './pages/patient/NotificationsPage'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-navy-900">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">🏥</div>
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Loading MediBook…</p>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" />} />

      {/* Admin */}
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardLayout /></PrivateRoute>
      }>
        {/* Admin routes */}
        <Route index element={
          user?.role === 'admin'   ? <AdminHome /> :
          user?.role === 'doctor'  ? <DoctorHome /> :
          <PatientHome />
        }/>
        <Route path="departments"         element={<PrivateRoute roles={['admin']}><DepartmentsPage /></PrivateRoute>} />
        <Route path="admin/doctors"       element={<PrivateRoute roles={['admin']}><AdminDoctorsPage /></PrivateRoute>} />
        <Route path="admin/appointments"  element={<PrivateRoute roles={['admin']}><AdminAppointmentsPage /></PrivateRoute>} />
        <Route path="reports"             element={<PrivateRoute roles={['admin']}><ReportsPage /></PrivateRoute>} />

        {/* Doctor routes */}
        <Route path="schedule"            element={<PrivateRoute roles={['doctor']}><SchedulePage /></PrivateRoute>} />
        <Route path="doctor/appointments" element={<PrivateRoute roles={['doctor']}><DoctorAppointmentsPage /></PrivateRoute>} />
        <Route path="doctor/notifications"element={<PrivateRoute roles={['doctor']}><DoctorNotifications /></PrivateRoute>} />

        {/* Patient routes */}
        <Route path="find-doctors"              element={<PrivateRoute roles={['patient']}><FindDoctors /></PrivateRoute>} />
        <Route path="my-appointments"           element={<PrivateRoute roles={['patient']}><MyAppointments /></PrivateRoute>} />
        <Route path="prescriptions"             element={<PrivateRoute roles={['patient']}><Prescriptions /></PrivateRoute>} />
        <Route path="patient/notifications"     element={<PrivateRoute roles={['patient']}><PatientNotifications /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
