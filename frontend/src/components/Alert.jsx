import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Alert({ message }) {
  if (!message) return null

  const isError = message.toLowerCase().includes('error') || message.toLowerCase().includes('failed') || message.toLowerCase().includes('could not')
  const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('booked')

  return (
    <div className={`rounded-lg p-4 text-sm flex items-center gap-3 ${
      isError
        ? 'bg-red-50 border border-red-200 text-red-800'
        : isSuccess
        ? 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-blue-50 border border-blue-200 text-blue-800'
    }`}>
      {isError ? (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      ) : isSuccess ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      )}
      {message}
    </div>
  )
}
