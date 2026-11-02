import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import StatCard from '../components/ui/StatCard'
import { useAuth } from '../hooks/useAuth'
import { fetchBillingAnalytics } from '../services/billingService'
import { API_ORIGIN } from '../utils/constants'

const checkHealth = async () => {
  const response = await fetch(`${API_ORIGIN}/api/health`)
  if (!response.ok) throw new Error('Health check failed')
  return response.json() as Promise<{ status: string }>
}

const AdminPage = () => {
  const { user } = useAuth()
  const isAdmin = Boolean(user?.is_admin)

  const analyticsQuery = useQuery({
    queryKey: ['billing', 'analytics'],
    queryFn: fetchBillingAnalytics,
    enabled: isAdmin,
    retry: 0,
  })

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30000,
    retry: 1,
  })

  const apiOnline = healthQuery.isSuccess
  const analytics = analyticsQuery.data

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Admin"
          title="Operations console"
          description="Platform health, revenue signals, and the controls that keep the workspace running."
          actions={
            <button
              type="button"
              onClick={() => {
                analyticsQuery.refetch()
                healthQuery.refetch()
              }}
              className="btn-ghost"
            >
              <Icon name="refresh" className={`h-4 w-4 ${analyticsQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />

        {!isAdmin ? (
          <EmptyState
            icon="lock"
            title="Administrator access required"
            description="This area is restricted to workspace administrators. Ask an owner to grant your account admin access."
            action={null}
          />
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="MRR"
                value={analytics ? `$${analytics.mrr.toFixed(0)}` : '—'}
                hint="Recurring revenue"
                icon="trendingUp"
                accent="emerald"
              />
              <StatCard
                label="Subscribers"
                value={analytics?.active_subscribers ?? '—'}
                hint="Active Pro members"
                icon="users"
                accent="brand"
              />
              <StatCard
                label="Churn"
                value={analytics ? `${(analytics.churn_rate * 100).toFixed(1)}%` : '—'}
                hint="Trailing 30 days"
                icon="chart"
                accent="amber"
              />
              <StatCard
                label="Generations"
                value={analytics?.total_generations ?? '—'}
                hint="All-time content output"
                icon="sparkles"
                accent="violet"
              />
            </section>

            {analyticsQuery.isError && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50/80 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Analytics could not be loaded. Stripe billing may be unconfigured in this environment.</p>
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="surface-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">System status</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Live checks for core services.</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      apiOnline
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${apiOnline ? 'animate-pulse bg-emerald-500' : 'bg-rose-500'}`} />
                    {apiOnline ? 'Operational' : 'Degraded'}
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  {[
                    {
                      name: 'API service',
                      detail: API_ORIGIN,
                      icon: 'server' as const,
                      ok: apiOnline,
                    },
                    {
                      name: 'AI provider',
                      detail: 'Local GGUF model',
                      icon: 'cpu' as const,
                      ok: apiOnline,
                    },
                    {
                      name: 'Database',
                      detail: 'SQLite workspace store',
                      icon: 'layers' as const,
                      ok: apiOnline,
                    },
                    {
                      name: 'Agent workflows',
                      detail: 'Bootstrap pipeline',
                      icon: 'activity' as const,
                      ok: apiOnline,
                    },
                  ].map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200/70 p-3.5 dark:border-white/5"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        <Icon name={service.icon} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{service.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{service.detail}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          service.ok
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {service.ok ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <div className="space-y-6">
                <section className="surface-panel p-6">
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Operator</h3>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-brand-800 font-display text-sm font-bold text-white">
                      {user?.name
                        ?.split(' ')
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('') || 'AD'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200/70 p-3 text-xs text-slate-500 dark:border-white/5 dark:text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <Icon name="shield" className="h-3.5 w-3.5 text-emerald-500" />
                      Full administrative privileges
                    </p>
                  </div>
                </section>

                <section className="surface-panel p-6">
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Capabilities</h3>
                  <div className="mt-4 space-y-2 text-sm">
                    {[
                      { icon: 'sparkles' as const, label: 'Multi-provider AI routing' },
                      { icon: 'book' as const, label: 'RAG knowledge bases' },
                      { icon: 'activity' as const, label: 'Agent workflow engine' },
                      { icon: 'card' as const, label: 'Stripe billing hooks' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <Icon name={item.icon} className="h-4 w-4 text-brand-500 dark:text-brand-300" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminPage
