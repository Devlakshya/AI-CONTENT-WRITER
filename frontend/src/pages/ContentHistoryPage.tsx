import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../layouts/DashboardLayout'
import PageHeader from '../components/ui/PageHeader'
import Icon, { IconName } from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { deleteContent, favoriteContent, fetchContents } from '../services/contentService'
import { useToast } from '../hooks/useToast'
import { CONTENT_TYPES } from '../utils/constants'
import { ContentDB } from '../types'

const typeIcons: Record<string, IconName> = {
  blog: 'book',
  product: 'briefcase',
  social: 'send',
  email: 'mail',
  seo_title: 'target',
  seo_meta: 'globe',
}

const typeGradients: Record<string, string> = {
  blog: 'from-brand-500 to-sky-500',
  product: 'from-accent-500 to-brand-500',
  social: 'from-sky-500 to-cyan-400',
  email: 'from-amber-500 to-orange-500',
  seo_title: 'from-emerald-500 to-teal-500',
  seo_meta: 'from-rose-500 to-pink-500',
}

const typeLabel = (value?: string) => CONTENT_TYPES.find((item) => item.value === value)?.label ?? 'Content'

const ContentHistoryPage = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [busyId, setBusyId] = useState<number | null>(null)
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['contents'],
    queryFn: fetchContents,
    retry: 1,
  })

  const contents = useMemo<ContentDB[]>(() => {
    const list = data ?? []
    const term = search.trim().toLowerCase()
    return list
      .filter((item) => (filter === 'all' ? true : item.content_type === filter))
      .filter((item) => {
        if (!term) return true
        return [item.title, item.prompt, item.generated_content]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term))
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [data, search, filter])

  const toggleFavorite = async (item: ContentDB) => {
    if (item.favorite) {
      addToast('This draft is already in your favorites', 'info')
      return
    }
    setBusyId(item.id)
    try {
      await favoriteContent(item.id)
      await queryClient.invalidateQueries({ queryKey: ['contents'] })
      addToast('Added to favorites', 'success')
    } catch (error: any) {
      addToast(error?.response?.data?.detail || 'Unable to update favorite', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const removeContent = async (item: ContentDB) => {
    const confirmed = window.confirm('Delete this draft? This action cannot be undone.')
    if (!confirmed) return
    setBusyId(item.id)
    try {
      await deleteContent(item.id)
      await queryClient.invalidateQueries({ queryKey: ['contents'] })
      addToast('Draft deleted', 'success')
    } catch (error: any) {
      addToast(error?.response?.data?.detail || 'Unable to delete draft', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Library"
          title="Content history"
          description="Every generation, organized and searchable. Open a draft to refine, copy, or export it."
          actions={
            <Link to="/generate" className="btn-primary">
              <Icon name="plus" className="h-4 w-4" />
              New content
            </Link>
          }
        />

        <div className="surface-panel p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Icon
                name="search"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input-surface pl-11"
                placeholder="Search title, prompt, or content..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-glow'
                    : 'border border-slate-200/80 text-slate-500 hover:border-brand-300/70 hover:text-brand-600 dark:border-white/10 dark:text-slate-400'
                }`}
              >
                All
              </button>
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFilter(type.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    filter === type.value
                      ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-glow'
                      : 'border border-slate-200/80 text-slate-500 hover:border-brand-300/70 hover:text-brand-600 dark:border-white/10 dark:text-slate-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="surface-panel space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon="alert"
            title="Could not load your library"
            description="The API did not respond. Check that the backend is running, then try again."
            action={
              <button type="button" onClick={() => refetch()} className="btn-primary text-xs">
                <Icon name="refresh" className="h-4 w-4" />
                Retry
              </button>
            }
          />
        ) : contents.length === 0 ? (
          <EmptyState
            icon="fileText"
            title={search || filter !== 'all' ? 'No matching drafts' : 'Your library is empty'}
            description={
              search || filter !== 'all'
                ? 'Try a different search term or content type.'
                : 'Generate your first piece of content and it will be saved here automatically.'
            }
            action={
              <Link to="/generate" className="btn-primary text-xs">
                <Icon name="sparkles" className="h-4 w-4" />
                Generate content
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{contents.length}</span>{' '}
                {contents.length === 1 ? 'draft' : 'drafts'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
              >
                <Icon name="refresh" className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {contents.map((item) => {
                const gradient = typeGradients[item.content_type] ?? 'from-brand-500 to-accent-500'
                const preview = (item.generated_content || item.prompt || '').replace(/\s+/g, ' ').slice(0, 160)
                const busy = busyId === item.id
                return (
                  <article
                    key={item.id}
                    className="surface-card group flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
                    <div className="flex items-start justify-between gap-3">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
                        <Icon name={typeIcons[item.content_type] ?? 'fileText'} className="h-5 w-5" />
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item)}
                          disabled={busy}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            item.favorite
                              ? 'text-amber-500'
                              : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500 dark:text-slate-600 dark:hover:bg-white/5'
                          }`}
                          aria-label={item.favorite ? 'Already in favorites' : 'Add to favorites'}
                        >
                          <Icon name="star" className={`h-4 w-4 ${item.favorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContent(item)}
                          disabled={busy}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-500/10"
                          aria-label="Delete draft"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <Link to={`/content/${item.id}`} className="mt-4 block flex-1">
                      <h3 className="font-display text-base font-semibold text-slate-900 transition group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">
                        {item.title || 'Untitled draft'}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                        {preview || 'No preview available yet.'}
                      </p>
                    </Link>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/5">
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
                          {typeLabel(item.content_type)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <Link
                        to={`/content/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:gap-1.5 dark:text-brand-300"
                      >
                        Open
                        <Icon name="arrowRight" className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ContentHistoryPage
