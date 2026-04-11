import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

/**
 * ConfirmDialog - A reusable confirmation dialog component 
 * to replace native window.confirm() which can silently fail.
 */
export default function ConfirmDialog({ open, title, message, confirmText = 'Confirm', confirmClass = 'btn-danger', onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="glass rounded-2xl w-full max-w-sm shadow-card animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">{title}</h3>
              <p className="text-sm text-slate-400 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={onCancel} className="btn-secondary btn-sm">
              <X size={14} /> No, Keep It
            </button>
            <button onClick={onConfirm} className={`${confirmClass} btn-sm`} id="confirm-dialog-yes">
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * useConfirm - Hook to manage confirmation dialog state.
 * Usage:
 *   const { confirmProps, requestConfirm } = useConfirm()
 *   await requestConfirm({ title, message })
 */
export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '', resolve: null })

  const requestConfirm = ({ title, message }) =>
    new Promise(resolve => setState({ open: true, title, message, resolve }))

  const handleConfirm = () => {
    state.resolve(true)
    setState(s => ({ ...s, open: false }))
  }

  const handleCancel = () => {
    state.resolve(false)
    setState(s => ({ ...s, open: false }))
  }

  return {
    confirmProps: {
      open: state.open,
      title: state.title,
      message: state.message,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    requestConfirm,
  }
}
