import { BillingOverview } from '../types'
import Icon from './ui/Icon'

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  trialing: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  cancel_at_period_end: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  canceled: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}

const SubscriptionStatus = ({ subscription }: { subscription: BillingOverview['subscription'] }) => {
  const statusClass = statusStyles[subscription.status] ?? 'bg-slate-500/15 text-slate-600 dark:text-slate-300'
  const isPro = subscription.plan_name?.toLowerCase() === 'pro'

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 p-6 text-white shadow-card">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-brand-500/40 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-52 w-52 rounded-full bg-accent-500/30 blur-3xl" />
      </div>
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Subscription</p>
            <h3 className="mt-2 font-display text-2xl font-bold">
              {isPro ? 'Pro plan' : 'Free plan'}
            </h3>
            <p className="mt-1 text-sm text-white/60">
              {isPro ? 'Unlimited generations and priority support.' : '20 generations every month, no card required.'}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}>
            {subscription.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Renewal</p>
            <p className="mt-1 text-sm font-medium">
              {subscription.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Not scheduled'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Billing account</p>
            <p className="mt-1 truncate text-sm font-medium">
              {subscription.stripe_customer_id ?? 'Local workspace'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <Icon name="lock" className="h-3.5 w-3.5" />
          Payments secured by Stripe when configured
        </div>
      </div>
    </div>
  )
}

export default SubscriptionStatus
