const BASE_URL = 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    let err
    try { err = await res.json() } catch { err = { detail: `HTTP ${res.status}` } }
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const getMe          = ()      => request('/me')
export const loginUser      = (data)  => request('/login', { method: 'POST', body: JSON.stringify(data) })
export const registerUser   = (data)  => request('/register', { method: 'POST', body: JSON.stringify(data) })

// ─── Departments ───────────────────────────────────────────────────────────────
export const getDepartments       = ()           => request('/departments')
export const createDepartment     = (data)       => request('/departments', { method: 'POST', body: JSON.stringify(data) })
export const updateDepartment     = (id, data)   => request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteDepartment     = (id)         => request(`/departments/${id}`, { method: 'DELETE' })

// ─── Doctors ───────────────────────────────────────────────────────────────────
export const getDoctors         = (params = {}) => {
  const q = new URLSearchParams()
  if (params.department_id) q.set('department_id', params.department_id)
  if (params.specialization) q.set('specialization', params.specialization)
  return request(`/doctors?${q}`)
}
export const getDoctor          = (id)         => request(`/doctors/${id}`)
export const createDoctor       = (data)       => request('/admin/doctors', { method: 'POST', body: JSON.stringify(data) })
export const updateDoctor       = (id, data)   => request(`/admin/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteDoctor       = (id)         => request(`/admin/doctors/${id}`, { method: 'DELETE' })

// ─── Schedules ─────────────────────────────────────────────────────────────────
export const getMySchedules     = ()           => request('/schedules')
export const addSchedule        = (data)       => request('/schedules', { method: 'POST', body: JSON.stringify(data) })
export const deleteSchedule     = (id)         => request(`/schedules/${id}`, { method: 'DELETE' })
export const getAvailableSlots  = (doctorId)   => request(`/available-slots/${doctorId}`)

// ─── Appointments ──────────────────────────────────────────────────────────────
export const bookAppointment        = (data)       => request('/book', { method: 'POST', body: JSON.stringify(data) })
export const getPatientHistory      = ()           => request('/appointments/history')
export const getDoctorAppointments  = ()           => request('/appointments/doctor')
export const getAdminAppointments   = (status)     => request(`/admin/appointments${status ? `?status=${status}` : ''}`)
export const cancelAppointment      = (id)         => request(`/appointments/${id}/cancel`, { method: 'PATCH' })
export const updateAppointmentStatus = (id, status) => request(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })

// ─── Prescriptions ─────────────────────────────────────────────────────────────
export const createPrescription     = (data)   => request('/prescriptions', { method: 'POST', body: JSON.stringify(data) })
export const getPatientPrescriptions = ()      => request('/patient/prescriptions')
export const getDoctorPrescriptions  = ()      => request('/doctor/prescriptions')

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const getAdminStats  = ()   => request('/admin/stats')
export const getTopDoctors  = ()   => request('/reports/top-doctors')
export const getNotifications = () => request('/notifications')
