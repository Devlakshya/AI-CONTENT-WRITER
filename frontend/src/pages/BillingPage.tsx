import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import SubscriptionStatus from '../components/SubscriptionStatus'
import UsageMeter from '../components/UsageMeter'
import { useToast } from '../hooks/useToast'
import {
  cancelSubscription,
  createCheckoutSession,
  createCustomerPortal,
  downgradeSubscription,
  fetchBillingOverview,
} from '../services/billingService'

const BillingPage = () => {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [actionLoading, setActionLoading] = useState(false)

  const overviewQuery = useQuery({ queryKey: ['billing', 'overview'], queryFn: fetchBillingOverview, retry: 1 })
  const overview = overviewQuery.data

  const checkoutStatus = searchParams.get('status')

  useEffect(() => {
    if (checkoutStatus === 'success') addToast('Subscription updated successfully', 'success')
    if (checkoutStatus === 'canceled') addToast('Checkout canceled — no changes made', 'info')
  }, [checkoutStatus, addToast])

  const refreshOverview = () => queryClient.invalidateQueries({ queryKey: ['billing', 'overview'] })

  const handleCheckout = async () => {
    setActionLoading(true)
    try {
      const { url } = await createCheckoutSession()
      window.location.href = url
    } catch (error: any) {
      addToast(error?.response?.data?.detail || error.message || 'Failed to start checkout', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCustomerPortal = async () => {
    setActionLoading(true)
    try {
      const { url } = await createCustomerPortal()
      window.location.href = url
    } catch (error: any) {
      addToast(error?.response?.data?.detail || error.message || 'Failed to open customer portal', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const updateSubscriptionState = async (action: () => Promise<unknown>, successMessage: string) => {
    setActionLoading(true)
    try {
      await action()
      addToast(successMessage, 'success')
      await refreshOverview()
    } catch (error: any) {
      addToast(error?.response?.data?.detail || error.message || 'Unable to update subscription', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const isPro = overview?.subscription.plan_name?.toLowerCase() === 'pro'
  const hasCustomer = Boolean(overview?.subscription.stripe_customer_id)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Account"
          title="Billing & usage"
          description="Track plan status and usage, then upgrade or manage your subscription whenever you need."
          actions={
            <Link to="/pricing" className="btn-ghost">
              <Icon name="pricing" className="h-4 w-4" />
              Compare plans
            </Link>
          }
        />

        {overviewQuery.isLoading ? (
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <div className="surface-panel p-6">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="mt-4 h-24 w-full" />
              </div>
              <div className="surface-panel p-6">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="mt-4 h-16 w-full" />
              </div>
            </div>
            <div className="surface-panel p-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="mt-4 h-10 w-full" />
              <Skeleton className="mt-2 h-10 w-full" />
            </div>
          </div>
        ) : overviewQuery.isError || !overview ? (
          <EmptyState
            icon="alert"
            title="Billing unavailable"
            description="We could not load your billing status. Check that the backend is running and try again."
            action={
              <button type="button" onClick={() => overviewQuery.refetch()} className="btn-primary text-xs">
                <Icon name="refresh" className="h-4 w-4" />
                Retry
              </button>
            }
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <SubscriptionStatus subscription={overview.subscription} />
              <UsageMeter {...overview.usage} />

              <div className="surface-panel p-6">
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Plan comparison</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Everything included in your workspace.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div
                    className={`rounded-2xl border p-4 ${
                      !isPro
                        ? 'border-brand-300/70 bg-brand-50/50 dark:border-brand-400/30 dark:bg-brand-500/5'
                        : 'border-slate-200/70 dark:border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-base font-semibold text-slate-900 dark:text-white">Free</p>
                      {!isPro && (
                        <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">$0</p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <li className="flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />20 generations / month</li>
                      <li className="flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />All content formats</li>
                      <li className="flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />Draft history & favorites</li>
                    </ul>
                  </div>
                  <div
                    className={`relative rounded-2xl border p-4 ${
                      isPro
                        ? 'border-brand-300/70 bg-brand-50/50 dark:border-brand-400/30 dark:bg-brand-500/5'
                        : 'border-slate-200/70 dark:border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-base font-semibold text-slate-900 dark:text-white">Pro</p>
                      {isPro ? (
                        <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                          Current
                        </span>
                      ) : (
                        <span className="rounded-full bg-gradient-to-r from-brand-600 to-accent-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      $20<span className="text-sm font-medium text-slate-400">/mo</span>
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <li className="flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />Unlimited generations</li>
                      <li className="flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />Priority support</li>
                      <li className="flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />Everything in Free</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel p-6">
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Actions</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage your subscription securely through Stripe.
                </p>
                <div className="mt-5 space-y-2.5">
                  {!isPro && (
                    <button onClick={handleCheckout} disabled={actionLoading} className="btn-primary w-full">
                      <Icon name="rocket" className="h-4 w-4" />
                      {actionLoading ? 'Processing…' : 'Upgrade to Pro'}
                    </button>
                  )}
                  <button onClick={handleCustomerPortal} disabled={actionLoading || !hasCustomer} className="btn-ghost w-full">
                    <Icon name="external" className="h-4 w-4" />
                    Open billing portal
                  </button>
                  <button
                    onClick={() => updateSubscriptionState(cancelSubscription, 'Subscription scheduled to cancel')}
                    disabled={actionLoading || !isPro}
                    className="w-full rounded-full border border-rose-200/80 px-5 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                  >
                    Cancel subscription
                  </button>
                  <button
                    onClick={() => updateSubscriptionState(downgradeSubscription, 'Subscription downgrade requested')}
                    disabled={actionLoading || !isPro}
                    className="w-full rounded-full border border-slate-200/80 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Downgrade to Free
                  </button>
                </div>
                {!hasCustomer && (
                  <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-100/70 px-3 py-2 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    The billing portal appears after your first Stripe checkout.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-dashed border-brand-300/60 bg-brand-50/40 p-5 dark:border-brand-400/20 dark:bg-brand-500/5">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
                  <Icon name="shield" className="h-4 w-4" />
                  <p className="text-sm font-semibold">Secure billing</p>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Payments are processed by Stripe. Lumen AI never stores card details.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default BillingPage
