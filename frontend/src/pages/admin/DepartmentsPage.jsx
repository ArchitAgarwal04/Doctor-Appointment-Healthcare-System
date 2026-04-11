import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import * as api from '../../api'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function DepartmentsPage() {
  const [depts, setDepts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null) // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm]     = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const load = () => api.getDepartments().then(setDepts).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ name: '', description: '' }); setSelected(null); setModal('create') }
  const openEdit   = (d) => { setForm({ name: d.name, description: d.description }); setSelected(d); setModal('edit') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.createDepartment(form)
        toast.success('Department created')
      } else {
        await api.updateDepartment(selected.id, form)
        toast.success('Department updated')
      }
      closeModal()
      load()
    } catch (err) {
      toast.error(err?.detail || 'Failed to save department')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return
    try {
      await api.deleteDepartment(id)
      toast.success('Department deleted')
      load()
    } catch (err) {
      toast.error(err?.detail || 'Cannot delete department')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-slate-400 text-sm mt-1">Manage hospital departments</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="create-dept-btn">
          <Plus size={16} /> New Department
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts.map(d => (
          <div key={d.id} className="glass-light rounded-xl p-5 hover:border-brand-500/30 transition-all duration-200 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                <Building2 size={18} className="text-brand-400" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(d)} className="btn-ghost btn-sm p-1.5" id={`edit-dept-${d.id}`}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(d.id)} className="btn-ghost btn-sm p-1.5 text-rose-400 hover:bg-rose-500/10" id={`del-dept-${d.id}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-slate-200">{d.name}</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description || 'No description'}</p>
          </div>
        ))}
        {depts.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500">No departments yet. Create one!</div>
        )}
      </div>

      <Modal open={!!modal} onClose={closeModal} title={modal === 'create' ? 'New Department' : 'Edit Department'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="input-label">Department Name</label>
            <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Cardiology" />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input resize-none h-24" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : (modal === 'create' ? 'Create' : 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
