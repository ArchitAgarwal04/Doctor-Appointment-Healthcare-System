import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react'
import * as api from '../../api'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function AdminDoctorsPage() {
  const [doctors, setDoctors]   = useState([])
  const [depts, setDepts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', department_id: '', bio: '' })

  const load = async () => {
    const [d, deps] = await Promise.all([api.getDoctors(), api.getDepartments()])
    setDoctors(d); setDepts(deps)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', specialization: '', department_id: '', bio: '' })
    setSelected(null); setModal('create')
  }
  const openEdit = (d) => {
    setForm({ name: d.name, email: d.email, password: '', specialization: d.specialization, department_id: d.department_id || '', bio: d.bio || '' })
    setSelected(d); setModal('edit')
  }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, department_id: form.department_id ? Number(form.department_id) : null }
      if (modal === 'create') { await api.createDoctor(payload); toast.success('Doctor added') }
      else { await api.updateDoctor(selected.id, payload); toast.success('Doctor updated') }
      closeModal(); load()
    } catch (err) { toast.error(err?.detail || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this doctor?')) return
    try { await api.deleteDoctor(id); toast.success('Doctor removed'); load() }
    catch (err) { toast.error(err?.detail || 'Failed to delete') }
  }

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Doctors</h1>
          <p className="text-slate-400 text-sm mt-1">Manage doctor accounts and profiles</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="add-doctor-btn"><Plus size={16} /> Add Doctor</button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>{['Doctor', 'Specialization', 'Department', 'Actions'].map(h => (
                <th key={h} className="table-cell text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr><td colSpan={4} className="table-cell text-center py-10 text-slate-500">No doctors found</td></tr>
              ) : doctors.map(d => (
                <tr key={d.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-brand-600 flex items-center justify-center text-white font-bold text-xs">
                        {d.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{d.name}</p>
                        <p className="text-xs text-slate-500">{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">{d.specialization}</span>
                  </td>
                  <td className="table-cell text-slate-400">{d.department || '—'}</td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="btn-ghost btn-sm" id={`edit-doc-${d.id}`}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(d.id)} className="btn-ghost btn-sm text-rose-400 hover:bg-rose-500/10" id={`del-doc-${d.id}`}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!modal} onClose={closeModal} title={modal === 'create' ? 'Add New Doctor' : 'Edit Doctor'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div><label className="input-label">Full Name</label>
            <input name="name" className="input" required value={form.name} onChange={handle} placeholder="Dr. Jane Smith" /></div>
          <div><label className="input-label">Email</label>
            <input name="email" type="email" className="input" required={modal === 'create'} value={form.email} onChange={handle} placeholder="dr@clinic.com" /></div>
          {modal === 'create' && (
            <div><label className="input-label">Password</label>
              <input name="password" type="password" className="input" required value={form.password} onChange={handle} placeholder="••••••••" /></div>
          )}
          <div><label className="input-label">Specialization</label>
            <input name="specialization" className="input" required value={form.specialization} onChange={handle} placeholder="e.g. Cardiology" /></div>
          <div><label className="input-label">Department</label>
            <select name="department_id" className="input" value={form.department_id} onChange={handle}>
              <option value="">None</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          <div className="col-span-2"><label className="input-label">Bio</label>
            <textarea name="bio" className="input resize-none h-20" value={form.bio} onChange={handle} placeholder="Brief professional bio…" /></div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : (modal === 'create' ? 'Add Doctor' : 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
