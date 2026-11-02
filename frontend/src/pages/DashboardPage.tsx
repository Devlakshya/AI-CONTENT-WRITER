import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import UsageMeter from '../components/UsageMeter'
import { useAuth } from '../hooks/useAuth'
import { fetchContents } from '../services/contentService'
import { fetchBillingOverview } from '../services/billingService'
import { CONTENT_TYPES } from '../utils/constants'
import { ContentDB } from '../types'

const DAY = 24 * 60 * 60 * 1000

const typeLabel = (value?: string) => CONTENT_TYPES.find((item) => item.value === value)?.label ?? 'Content'

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const DashboardPage = () => {
  const { user } = useAuth()
  const contentsQuery = useQuery({ queryKey: ['contents'], queryFn: fetchContents, retry: 1 })
  const billingQuery = useQuery({ queryKey: ['billing', 'overview'], queryFn: fetchBillingOverview, retry: 0 })

  const contents = useMemo<ContentDB[]>(() => {
    const list = contentsQuery.data ?? []
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [contentsQuery.data])

  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const words = contents.reduce((total, item) => {
      const text = item.generated_content || ''
      return total + (text.trim() ? text.trim().split(/\s+/).length : 0)
    }, 0)

    const weekly = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(now.getTime() - (6 - index) * DAY)
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
      const end = start + DAY
      const count = contents.filter((item) => {
        const created = new Date(item.created_at).getTime()
        return created >= start && created < end
      }).length
      return {
        label: day.toLocaleDateString(undefined, { weekday: 'short' }),
        count,
      }
    })

    return {
      total: contents.length,
      thisMonth: contents.filter((item) => new Date(item.created_at).getTime() >= monthStart).length,
      favorites: contents.filter((item) => item.favorite).length,
      words,
      weekly,
    }
  }, [contents])

  const maxWeekly = Math.max(...stats.weekly.map((day) => day.count), 1)
  const firstName = user?.name?.split(' ')[0]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Overview"
          title={`${greeting()}${firstName ? `, ${firstName}` : ''}`}
          description="Your content command center — track output, jump back into drafts, and keep the pipeline moving."
          actions={
            <>
              <Link to="/history" className="btn-ghost">
                <Icon name="history" className="h-4 w-4" />
                History
              </Link>
              <Link to="/generate" className="btn-primary">
                <Icon name="sparkles" className="h-4 w-4" />
                Generate content
              </Link>
            </>
          }
        />

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 p-6 text-white shadow-glow sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl" />
            <div className="absolute inset-0 bg-grid opacity-20" />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                Local AI online
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                From rough idea to publish-ready, in a single pass.
              </h2>
              <p className="mt-3 max-w-lg text-sm text-white/80 sm:text-base">
                Generate long-form articles, product copy, and social captions with a workflow tuned for
                marketing teams. Everything runs privately on your machine.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/generate"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                >
                  <Icon name="wand" className="h-4 w-4" />
                  Start creating
                </Link>
                <Link
                  to="/history"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Browse library
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative hidden w-full max-w-sm lg:block">
              <div className="absolute -inset-4 rounded-[2rem] bg-white/10 blur-2xl" />
              <div className="relative animate-float rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                      <Icon name="sparkles" className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Draft</p>
                      <p className="text-sm font-medium">Launch announcement</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
                    Ready
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full rounded-full bg-white/25" />
                  <div className="h-2 w-11/12 rounded-full bg-white/20" />
                  <div className="h-2 w-4/5 rounded-full bg-white/15" />
                  <div className="h-2 w-2/3 rounded-full bg-white/10" />
                </div>
                <div className="mt-5 flex items-center justify-between text-xs text-white/70">
                  <span>312 words</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="zap" className="h-3.5 w-3.5" />
                    Generated in 4s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total content"
            value={stats.total}
            hint="All generations saved"
            icon="fileText"
            accent="brand"
            data={stats.weekly.map((day) => day.count)}
          />
          <StatCard
            label="This month"
            value={stats.thisMonth}
            hint="Created since month start"
            icon="trendingUp"
            accent="violet"
            data={[0, 1, 1, 2, 1, 3, stats.thisMonth]}
          />
          <StatCard
            label="Favorites"
            value={stats.favorites}
            hint="Starred for reuse"
            icon="star"
            accent="amber"
            data={[1, 0, 1, 1, 2, 2, stats.favorites]}
          />
          <StatCard
            label="Words written"
            value={stats.words.toLocaleString()}
            hint="Across every draft"
            icon="pen"
            accent="emerald"
            data={[40, 80, 65, 120, 90, 160, Math.max(stats.words / 10, 1)]}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="surface-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Content activity</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Generations over the last seven days.</p>
              </div>
              <span className="pill">
                <Icon name="activity" className="h-3.5 w-3.5 text-brand-500" />
                Last 7 days
              </span>
            </div>

            <div className="mt-8 flex h-44 items-end gap-3 rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/5 dark:bg-slate-950/40">
              {stats.weekly.map((day) => (
                <div key={day.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{day.count}</span>
                  <div className="flex h-24 w-full items-end overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-brand-600 via-brand-500 to-accent-400 transition-all duration-500"
                      style={{ height: `${Math.max((day.count / maxWeekly) * 100, day.count ? 12 : 4)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Recent drafts
              </h4>
              <Link
                to="/history"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition hover:gap-2 dark:text-brand-300"
              >
                View all
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {contentsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 p-4 dark:border-white/5">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))
              ) : contents.length === 0 ? (
                <EmptyState
                  compact
                  icon="sparkles"
                  title="No drafts yet"
                  description="Generate your first piece of content to see it appear here."
                  action={
                    <Link to="/generate" className="btn-primary text-xs">
                      Create content
                    </Link>
                  }
                />
              ) : (
                contents.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to={`/content/${item.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300/70 hover:shadow-card dark:border-white/5 dark:bg-slate-950/40 dark:hover:border-brand-500/40"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-300">
                      <Icon name="fileText" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title || 'Untitled draft'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {typeLabel(item.content_type)} ·{' '}
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {item.favorite && <Icon name="star" className="h-4 w-4 fill-amber-400 text-amber-400" />}
                    <Icon
                      name="chevronRight"
                      className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500"
                    />
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            {billingQuery.data ? (
              <UsageMeter {...billingQuery.data.usage} />
            ) : (
              <div className="surface-panel p-6">
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Usage</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {billingQuery.isError ? 'Sign in again to load usage details.' : 'Loading usage details...'}
                </p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-500/60" />
                </div>
              </div>
            )}

            <div className="surface-panel p-6">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Quick actions</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Everything you need, one click away.</p>
              <div className="mt-5 space-y-2">
                {[
                  { to: '/generate', icon: 'sparkles' as const, title: 'Generate content', description: 'Draft a new asset' },
                  { to: '/history', icon: 'history' as const, title: 'Open library', description: 'Review saved drafts' },
                  { to: '/billing', icon: 'card' as const, title: 'Manage plan', description: 'Usage & subscription' },
                ].map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 p-3.5 transition-all duration-300 hover:border-brand-300/70 hover:bg-white/70 dark:border-white/5 dark:hover:border-brand-500/40 dark:hover:bg-white/5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                      <Icon name={action.icon} className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">{action.title}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{action.description}</span>
                    </span>
                    <Icon
                      name="chevronRight"
                      className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500"
                    />
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-emerald-50/70 p-6 dark:border-emerald-400/20 dark:bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                  <Icon name="server" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Local AI active</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">No API keys required · private by default</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
