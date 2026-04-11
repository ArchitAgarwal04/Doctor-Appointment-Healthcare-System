const statusMap = {
  booked:    'badge-booked',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  'no-show': 'badge-no-show',
}

export default function Badge({ status, children, className = '' }) {
  const cls = status ? (statusMap[status] || 'badge-booked') : ''
  return (
    <span className={`badge ${cls} ${className}`}>
      {status && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />}
      {children || status}
    </span>
  )
}
