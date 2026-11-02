import { useDarkMode } from '../hooks/useDarkMode'
import Icon from './ui/Icon'

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode()

  return (
    <button
      type="button"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={darkMode}
      onClick={toggleDarkMode}
      className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/60 hover:text-brand-600 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-brand-400/50 dark:hover:text-brand-300"
    >
      <Icon
        name={darkMode ? 'sun' : 'moon'}
        className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12"
      />
    </button>
  )
}

export default DarkModeToggle
