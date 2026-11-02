import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import PublicLayout from '../layouts/PublicLayout'
import Logo from '../components/ui/Logo'
import Icon from '../components/ui/Icon'
import { isEmail, isRequired } from '../utils/validators'

interface AuthPageProps {
  initialMode?: 'login' | 'register'
}

const features = [
  { icon: 'sparkles' as const, title: 'Six content formats', description: 'Blogs, product copy, email, social, and SEO.' },
  { icon: 'server' as const, title: 'Runs locally', description: 'Your drafts never leave your machine.' },
  { icon: 'zap' as const, title: 'Instant workspace', description: 'Brief, generate, refine, and export in one flow.' },
]

const AuthPage = ({ initialMode = 'login' }: AuthPageProps) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { user, signIn, signUp, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/'

  useEffect(() => {
    if (!isLoading && user) {
      navigate(from, { replace: true })
    }
  }, [isLoading, user, navigate, from])

  const isFormValid = useMemo(() => {
    if (!isEmail(email)) return false
    if (mode === 'register') return isRequired(name) && password.length >= 8
    return password.length > 0
  }, [email, password, name, mode])

  const passwordScore = useMemo(() => {
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }, [password])

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode)
    setError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!isFormValid) {
      setError(
        mode === 'register'
          ? 'Enter your name, a valid email, and a password with at least 8 characters.'
          : 'Enter a valid email and your password.',
      )
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp({ name, email, password })
      }
    } catch (err) {
      const message = (err as any)?.response?.data?.detail
      setError(message || (err as Error).message || 'Unable to authenticate. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <div className="grid overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 shadow-soft backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70 lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-accent-600 p-10 text-white lg:flex lg:flex-col">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />
            <div className="absolute inset-0 bg-grid opacity-20" />
          </div>

          <div className="relative">
            <Logo className="[&_span]:text-white [&_span:last-child]:text-white/50" />
            <h1 className="mt-10 max-w-md font-display text-4xl font-bold leading-tight text-white">
              The fastest way to ship on-brand content.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Lumen AI turns a short brief into a polished first draft — with the structure, tone, and
              keywords your team needs.
            </p>
          </div>

          <div className="relative mt-10 space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon name={feature.icon} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="text-xs text-white/65">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-auto pt-10">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                    <Icon name="fileText" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/50">Live draft</p>
                    <p className="text-sm font-medium">Launch announcement</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
                  Ready
                </span>
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-white/25" />
                <div className="h-1.5 w-11/12 rounded-full bg-white/20" />
                <div className="h-1.5 w-3/4 rounded-full bg-white/15" />
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-white/50">
              <Icon name="lock" className="h-3.5 w-3.5" />
              Private by default · no third-party API keys required
            </p>
          </div>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
            <span className="pill">Secure</span>
          </div>

          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-500 dark:text-brand-300">
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Sign in to your studio' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login'
                ? 'Pick up where you left off and keep your content pipeline moving.'
                : 'Start generating publish-ready content in under a minute.'}
            </p>

            <div className="mt-6 flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/70 p-1 text-sm dark:border-white/10 dark:bg-white/5">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`flex-1 rounded-full px-4 py-2 font-medium transition-all duration-300 ${
                    mode === tab
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-white dark:text-slate-950'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                  onClick={() => switchMode(tab)}
                >
                  {tab === 'login' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Full name
                  <div className="relative mt-1.5">
                    <Icon name="user" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="input-surface pl-11"
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </div>
                </label>
              )}

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email address
                <div className="relative mt-1.5">
                  <Icon name="mail" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="input-surface pl-11"
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
                <div className="relative mt-1.5">
                  <Icon name="lock" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="input-surface px-11"
                    placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-4 w-4" />
                  </button>
                </div>
              </label>

              {mode === 'register' && password.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordScore >= step
                            ? passwordScore >= 3
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {passwordScore >= 3 ? 'Strong' : passwordScore >= 2 ? 'Fair' : 'Weak'}
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-2xl border border-rose-300/60 bg-rose-50/80 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                  <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isFormValid}
                className="btn-primary w-full py-3"
              >
                {submitting ? (
                  <>
                    <Icon name="refresh" className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Icon name={mode === 'login' ? 'logout' : 'user'} className="h-4 w-4 rotate-180" />
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'New to Lumen AI?' : 'Already have an account?'}{' '}
              <button
                type="button"
                className="font-semibold text-brand-600 underline-offset-4 hover:underline dark:text-brand-300"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Create an account' : 'Sign in instead'}
              </button>
            </p>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Icon name="shield" className="h-3.5 w-3.5" />
              Encrypted sessions · local-first generation
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

export default AuthPage
