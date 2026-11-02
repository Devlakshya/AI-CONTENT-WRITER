import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { createCheckoutSession, fetchPricingPlans } from '../services/billingService'
import { useToast } from '../hooks/useToast'

const planFeatures: Record<string, string[]> = {
  Free: [
    '20 AI generations per month',
    'Six content formats',
    'Draft history & favorites',
    'Local-first generation',
  ],
  Pro: [
    'Unlimited AI generations',
    'Priority generation queue',
    'All content formats & tones',
    'Priority support',
    'Everything in Free',
  ],
}

const PricingPage = () => {
  const { addToast } = useToast()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const plansQuery = useQuery({ queryKey: ['billing', 'plans'], queryFn: fetchPricingPlans, retry: 1 })

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const { url } = await createCheckoutSession()
      window.location.href = url
    } catch (error: any) {
      addToast(error?.response?.data?.detail || error.message || 'Failed to start checkout', 'error')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const plans = plansQuery.data ?? []

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Plans"
          title="Simple pricing that scales"
          description="Start free with everything you need to ship content. Upgrade when you need unlimited output."
          actions={
            <Link to="/billing" className="btn-ghost">
              <Icon name="card" className="h-4 w-4" />
              Current plan
            </Link>
          }
        />

        {plansQuery.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="surface-panel space-y-4 p-7">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-28 w-full" />
              </div>
            ))}
          </div>
        ) : plansQuery.isError ? (
          <EmptyState
            icon="alert"
            title="Plans unavailable"
            description="We could not load pricing right now. Check the API connection and try again."
            action={
              <button type="button" onClick={() => plansQuery.refetch()} className="btn-primary text-xs">
                <Icon name="refresh" className="h-4 w-4" />
                Retry
              </button>
            }
          />
        ) : plans.length === 0 ? (
          <EmptyState
            icon="card"
            title="No plans configured"
            description="The workspace has not published any plans yet."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {plans.map((plan) => {
              const isPro = plan.name.toLowerCase() === 'pro'
              const features = planFeatures[plan.name] ?? [
                plan.unlimited ? 'Unlimited AI generations' : `${plan.monthly_limit ?? 0} generations per month`,
              ]
              return (
                <div
                  key={plan.name}
                  className={`surface-card p-7 ${
                    isPro ? 'border-brand-300/70 shadow-glow dark:border-brand-400/30' : ''
                  }`}
                >
                  {isPro && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500" />
                      <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        Most popular
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isPro
                          ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white'
                          : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      <Icon name={isPro ? 'rocket' : 'layers'} className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end gap-1">
                    <p className="font-display text-5xl font-bold text-slate-900 dark:text-white">
                      {plan.price === 0 ? '$0' : `$${plan.price}`}
                    </p>
                    <span className="mb-2 text-sm font-medium text-slate-400">/month</span>
                  </div>

                  <div className="mt-6 space-y-2.5">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                          <Icon name="check" className="h-3 w-3" />
                        </span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-7">
                    {isPro ? (
                      <button onClick={handleCheckout} disabled={checkoutLoading} className="btn-primary w-full py-3">
                        <Icon name="rocket" className="h-4 w-4" />
                        {checkoutLoading ? 'Starting checkout…' : 'Upgrade to Pro'}
                      </button>
                    ) : (
                      <Link to="/generate" className="btn-ghost w-full py-3">
                        <Icon name="sparkles" className="h-4 w-4" />
                        Start creating free
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: 'shield' as const, title: 'Secure by default', description: 'Local generation keeps your drafts private.' },
            { icon: 'refresh' as const, title: 'Cancel anytime', description: 'No lock-in — manage everything via Stripe.' },
            { icon: 'users' as const, title: 'Built for teams', description: 'Consistent voice across every content format.' },
          ].map((item) => (
            <div key={item.title} className="surface-subtle flex items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Icon name={item.icon} className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default PricingPage
