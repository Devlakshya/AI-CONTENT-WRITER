import Icon from './ui/Icon'

interface UsageMeterProps {
  generation_count: number
  limit: number
  remaining: number
  month?: string
}

const UsageMeter = ({ generation_count, limit, remaining, month }: UsageMeterProps) => {
  const safeLimit = Math.max(limit || 0, 1)
  const used = Math.max(generation_count || 0, 0)
  const progress = Math.min((used / safeLimit) * 100, 100)
  const isHigh = progress >= 80

  return (
    <div className="surface-panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Usage</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {month ? `Billing cycle ${month}` : 'Current billing cycle'}
          </p>
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            isHigh ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-brand-500/12 text-brand-600 dark:text-brand-300'
          }`}
        >
          <Icon name="zap" className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <p className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          {used}
          <span className="ml-1 text-base font-medium text-slate-400 dark:text-slate-500">/ {limit}</span>
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isHigh
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {isHigh ? 'Near limit' : 'Healthy'}
        </span>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isHigh
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : 'bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {remaining > 0 ? `${remaining} generations remaining this month.` : 'Monthly quota reached — upgrade to keep creating.'}
      </p>
    </div>
  )
}

export default UsageMeter
