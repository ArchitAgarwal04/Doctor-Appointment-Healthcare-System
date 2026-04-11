import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Heart, Shield, Clock, ChevronRight, Stethoscope } from 'lucide-react'
import Spinner from './ui/Spinner'

const features = [
  { icon: Stethoscope, text: 'Search doctors by specialisation' },
  { icon: Clock,       text: 'Book & manage appointments easily' },
  { icon: Shield,      text: 'Secure RBAC-based access control' },
  { icon: Heart,       text: 'View prescriptions & visit history' },
]

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const isLogin = mode === 'login'
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password })
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        await register({ name: form.name, email: form.email, password: form.password, role: 'patient' })
        toast.success('Account created! Please log in.')
        navigate('/login')
      }
    } catch (err) {
      toast.error(err?.detail || (isLogin ? 'Login failed' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-navy-900">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1a3a 100%)' }}>
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-lg shadow-glow">🏥</div>
            <span className="text-xl font-bold text-gradient">MediBook</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Healthcare at<br />
            <span className="text-gradient">your fingertips</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Book appointments, manage schedules, and access your health records — all in one place.
          </p>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-brand-400" />
                </div>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-slate-600">
          © 2024 MediBook Healthcare System
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <span className="text-2xl">🏥</span>
            <span className="font-bold text-gradient text-xl">MediBook</span>
          </div>

          <div className="glass rounded-2xl p-8 shadow-card">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isLogin ? 'Enter your credentials to continue.' : 'Join MediBook as a patient today.'}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="input-label">Full Name</label>
                  <input id="name" name="name" type="text" required className="input"
                    placeholder="Jane Doe" value={form.name} onChange={handle} />
                </div>
              )}
              <div>
                <label className="input-label">Email Address</label>
                <input id="email" name="email" type="email" required className="input"
                  placeholder="you@example.com" value={form.email} onChange={handle} />
              </div>
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPw ? 'text' : 'password'} required className="input pr-10"
                    placeholder="••••••••" value={form.password} onChange={handle} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} id="auth-submit"
                className="btn-primary w-full py-3 mt-2 text-base rounded-xl font-semibold shadow-glow">
                {loading ? <Spinner size="sm" /> : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {isLogin ? (
                <>Don't have an account?{' '}
                  <Link to="/register" id="go-register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign up</Link>
                </>
              ) : (
                <>Already have an account?{' '}
                  <Link to="/login" id="go-login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
                </>
              )}
            </div>

            {isLogin && (
              <div className="mt-6 p-4 rounded-xl bg-navy-800/60 border border-slate-700/50">
                <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">Demo Credentials</p>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between"><span>🔐 Admin:</span><span className="font-mono">admin@clinic.com / admin123</span></div>
                  <div className="flex justify-between"><span>👨‍⚕️ Doctor:</span><span className="font-mono">dr.smith@clinic.com / doctor123</span></div>
                  <div className="flex justify-between"><span>🧑‍💼 Patient:</span><span className="font-mono">patient@clinic.com / patient123</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
