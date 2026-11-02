import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Icon, { IconName } from './ui/Icon'

const items: Array<{ name: string; path: string; icon: IconName }> = [
  { name: 'Home', path: '/', icon: 'dashboard' },
  { name: 'Create', path: '/generate', icon: 'sparkles' },
  { name: 'History', path: '/history', icon: 'history' },
  { name: 'Billing', path: '/billing', icon: 'card' },
  { name: 'Profile', path: '/profile', icon: 'user' },
]

const MobileNav = () => {
  const { user } = useAuth()
  const navItems = user?.is_admin
    ? [...items, { name: 'Admin', path: '/admin', icon: 'shield' as IconName }]
    : items

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/85 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/85 md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `group flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow'
                      : 'bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-white/5'
                  }`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav
