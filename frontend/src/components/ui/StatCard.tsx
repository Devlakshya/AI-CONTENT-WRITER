import Icon, { IconName } from './Icon'
import Sparkline from './Sparkline'

type Accent = 'brand' | 'violet' | 'emerald' | 'amber' | 'sky'

const accents: Record<Accent, { icon: string; glow: string; stroke: string; fill: string }> = {
  brand: {
    icon: 'bg-brand-500/12 text-brand-600 dark:text-brand-300',
    glow: 'from-brand-500/20',
    stroke: '#6366f1',
    fill: 'rgba(99,102,241,0.28)',
  },
  violet: {
    icon: 'bg-accent-500/12 text-accent-600 dark:text-accent-400',
    glow: 'from-accent-500/20',
    stroke: '#a855f7',
    fill: 'rgba(168,85,247,0.28)',
  },
  emerald: {
    icon: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    glow: 'from-emerald-500/20',
    stroke: '#10b981',
    fill: 'rgba(16,185,129,0.28)',
  },
  amber: {
    icon: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    glow: 'from-amber-500/20',
    stroke: '#f59e0b',
    fill: 'rgba(245,158,11,0.28)',
  },
  sky: {
    icon: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
    glow: 'from-sky-500/20',
    stroke: '#0ea5e9',
    fill: 'rgba(14,165,233,0.28)',
  },
}

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: IconName
  accent?: Accent
  data?: number[]
}

const StatCard = ({ label, value, hint, icon, accent = 'brand', data }: StatCardProps) => {
  const style = accents[accent]
  return (
    <div className="surface-card group p-5">
      <div className={`pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b ${style.glow} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      {data && data.length > 1 && (
        <div className="relative mt-4 opacity-80 transition-opacity group-hover:opacity-100">
          <Sparkline data={data} stroke={style.stroke} fillFrom={style.fill} className="h-10 w-full" height={40} />
        </div>
      )}
    </div>
  )
}

export default StatCard
