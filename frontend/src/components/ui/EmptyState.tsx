import type { ReactNode } from 'react'
import Icon, { IconName } from './Icon'

interface EmptyStateProps {
  icon?: IconName
  title: string
  description?: string
  action?: ReactNode
  compact?: boolean
}

const EmptyState = ({ icon = 'sparkles', title, description, action, compact = false }: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 text-center dark:border-white/10 dark:bg-slate-900/40 ${
      compact ? 'px-6 py-10' : 'px-6 py-16'
    }`}
  >
    <span className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-500 dark:text-brand-300">
      <span className="absolute inset-0 animate-pulse-ring rounded-2xl" />
      <Icon name={icon} className="h-6 w-6" />
    </span>
    <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)

export default EmptyState
