import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Icon, { IconName } from './ui/Icon'
import Logo from './ui/Logo'

const navigation: Array<{ name: string; path: string; icon: IconName; badge?: string }> = [
  { name: 'Overview', path: '/', icon: 'dashboard' },
  { name: 'Generate', path: '/generate', icon: 'sparkles', badge: 'AI' },
  { name: 'History', path: '/history', icon: 'history' },
  { name: 'Billing', path: '/billing', icon: 'card' },
  { name: 'Pricing', path: '/pricing', icon: 'pricing' },
  { name: 'Profile', path: '/profile', icon: 'user' },
]

const Sidebar = () => {
  const { user } = useAuth()
  const isAdmin = user?.is_admin

  return (
    <aside className="sticky top-0 hidden h-screen w-[19rem] flex-col overflow-y-auto border-r border-white/60 bg-white/70 px-6 py-7 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70 md:flex">
      <Logo />
      <nav className="mt-8 flex-1 space-y-1.5">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
          Navigate
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600/90 via-brand-500/90 to-accent-500/80 text-white shadow-glow'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-900/5 text-slate-500 group-hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:group-hover:text-white'
                  }`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.12)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <p className="mb-3 mt-6 px-2 text-xs font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
              Admin
            </p>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-card dark:from-white dark:to-slate-100 dark:text-slate-950'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isActive
                        ? 'bg-white/10 text-white dark:bg-slate-950/5 dark:text-slate-950'
                        : 'bg-slate-900/5 text-slate-500 group-hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:group-hover:text-white'
                    }`}
                  >
                    <Icon name="shield" className="h-4 w-4" />
                  </span>
                  <span className="flex-1">Admin</span>
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>
      <div className="surface-subtle mt-6 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            <Icon name="rocket" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Ship faster with AI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Local-first & production ready</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
