import { useAuth } from '../hooks/useAuth'
import DarkModeToggle from './DarkModeToggle'
import Icon from './ui/Icon'
import Logo from './ui/Logo'

const Header = () => {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl transition-all dark:border-white/5 dark:bg-slate-950/70">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div className="flex items-center gap-4">
          <Logo className="md:hidden" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Workspace
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h2>
            <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
              Craft, refine, and publish on-brand content in seconds.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <DarkModeToggle />
          <button
            type="button"
            onClick={signOut}
            className="btn-ghost px-4 py-2 text-sm"
          >
            <Icon name="logout" className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
