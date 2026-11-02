import { Link } from 'react-router-dom'
import Icon from './Icon'

interface LogoProps {
  className?: string
  markOnly?: boolean
}

const Logo = ({ className = '', markOnly = false }: LogoProps) => (
  <Link to="/" className={`group flex items-center gap-3 ${className}`} aria-label="Lumen AI home">
    <div className="relative">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-brand-500/40 via-accent-500/40 to-sky-400/40 opacity-70 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 text-white shadow-glow">
        <Icon name="sparkles" className="h-5 w-5" />
      </div>
    </div>
    {!markOnly && (
      <div className="flex flex-col">
        <span className="font-display text-lg font-semibold leading-tight text-slate-900 dark:text-white">
          Lumen AI
        </span>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
          Content Studio
        </span>
      </div>
    )}
  </Link>
)

export default Logo
