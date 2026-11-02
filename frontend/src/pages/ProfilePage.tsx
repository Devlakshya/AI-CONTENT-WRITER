import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'
import { useAuth } from '../hooks/useAuth'
import { fetchContents } from '../services/contentService'
import { fetchBillingOverview } from '../services/billingService'

const initials = (name?: string) =>
  (name || 'Lumen')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const ProfilePage = () => {
  const { user } = useAuth()
  const contentsQuery = useQuery({ queryKey: ['contents'], queryFn: fetchContents, retry: 1 })
  const billingQuery = useQuery({ queryKey: ['billing', 'overview'], queryFn: fetchBillingOverview, retry: 0 })

  const stats = useMemo(() => {
    const contents = contentsQuery.data ?? []
    const words = contents.reduce((total, item) => {
      const text = item.generated_content || ''
      return total + (text.trim() ? text.trim().split(/\s+/).length : 0)
    }, 0)
    return {
      total: contents.length,
      favorites: contents.filter((item) => item.favorite).length,
      words,
    }
  }, [contentsQuery.data])

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  const planName = billingQuery.data?.subscription.plan_name ?? 'free'
  const isPro = planName.toLowerCase() === 'pro'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Account"
          title="Profile & preferences"
          description="Your identity inside the workspace, plus plan details and content totals."
          actions={
            <Link to="/billing" className="btn-ghost">
              <Icon name="card" className="h-4 w-4" />
              Manage plan
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <section className="surface-panel overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500">
              <div className="absolute inset-0 bg-grid opacity-25" />
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            </div>
            <div className="relative px-6 pb-6">
              <div className="-mt-10 flex items-end justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-slate-900 to-brand-800 font-display text-2xl font-bold text-white shadow-card dark:border-slate-950">
                  {initials(user?.name)}
                </div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
                {user?.name ?? 'Workspace member'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  {user?.is_admin ? 'Administrator' : 'Content creator'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  {planName} plan
                </span>
              </div>
            </div>
          </section>

          <section className="surface-panel p-6">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Account details</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Information tied to your workspace account.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Full name', value: user?.name ?? '—', icon: 'user' as const },
                { label: 'Email address', value: user?.email ?? '—', icon: 'mail' as const },
                { label: 'Role', value: user?.is_admin ? 'Administrator' : 'Content creator', icon: 'shield' as const },
                { label: 'Member since', value: memberSince, icon: 'clock' as const },
                { label: 'Account ID', value: user?.id ? `#${user.id}` : '—', icon: 'layers' as const },
                { label: 'Status', value: user?.is_active ? 'Active' : 'Inactive', icon: 'checkCircle' as const },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/70 bg-white/50 p-4 dark:border-white/5 dark:bg-slate-950/40"
                >
                  <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Icon name={item.icon} className="h-3.5 w-3.5" />
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 truncate text-sm font-semibold text-slate-900 dark:text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-slate-200/80 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
              <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p>
                Credentials and sessions are stored locally for this workspace. Contact an administrator if you
                need your role updated.
              </p>
            </div>
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Drafts created', value: stats.total, icon: 'fileText' as const, accent: 'text-brand-600 dark:text-brand-300' },
            { label: 'Favorites', value: stats.favorites, icon: 'star' as const, accent: 'text-amber-600 dark:text-amber-400' },
            { label: 'Words written', value: stats.words.toLocaleString(), icon: 'pen' as const, accent: 'text-emerald-600 dark:text-emerald-400' },
          ].map((item) => (
            <div key={item.label} className="surface-card p-5">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 ${item.accent}`}>
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">{item.label}</p>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="surface-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <Icon name={isPro ? 'rocket' : 'card'} className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {isPro ? 'Pro plan' : 'Free plan'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {billingQuery.isError
                  ? 'Plan details unavailable right now.'
                  : isPro
                    ? 'Unlimited generations and priority support.'
                    : `${billingQuery.data?.usage.remaining ?? 20} generations remaining this month.`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/billing" className="btn-ghost text-xs">
              Billing overview
            </Link>
            <Link to="/pricing" className="btn-primary text-xs">
              {isPro ? 'Compare plans' : 'Upgrade to Pro'}
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
