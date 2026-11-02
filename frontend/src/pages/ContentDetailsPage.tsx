import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../layouts/DashboardLayout'
import Icon from '../components/ui/Icon'
import EmptyState from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { deleteContent, favoriteContent, fetchContent } from '../services/contentService'
import { useToast } from '../hooks/useToast'
import { CONTENT_TYPES } from '../utils/constants'

const typeLabel = (value?: string) => CONTENT_TYPES.find((item) => item.value === value)?.label ?? 'Content'

const ContentDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [busy, setBusy] = useState(false)

  const { data: content, isLoading, isError, refetch } = useQuery({
    queryKey: ['content', id],
    queryFn: () => fetchContent(id as string),
    enabled: Boolean(id),
    retry: 1,
  })

  const generated = content?.generated_content ?? ''
  const wordTotal = generated.trim() ? generated.trim().split(/\s+/).length : 0
  const keywords = content?.keywords
    ? content.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
    : []

  const copyContent = async () => {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(generated)
      addToast('Draft copied to clipboard', 'success')
    } catch {
      addToast('Clipboard is unavailable in this browser', 'error')
    }
  }

  const downloadContent = () => {
    if (!generated) return
    const blob = new Blob([generated], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeTitle = (content?.title || 'lumen-draft').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'lumen-draft'
    link.href = url
    link.download = `${safeTitle.replace(/\s+/g, '-').toLowerCase()}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    addToast('Draft downloaded', 'success')
  }

  const toggleFavorite = async () => {
    if (!content) return
    if (content.favorite) {
      addToast('This draft is already in your favorites', 'info')
      return
    }
    setBusy(true)
    try {
      await favoriteContent(content.id)
      await queryClient.invalidateQueries({ queryKey: ['content', id] })
      await queryClient.invalidateQueries({ queryKey: ['contents'] })
      addToast('Added to favorites', 'success')
    } catch (error: any) {
      addToast(error?.response?.data?.detail || 'Unable to update favorite', 'error')
    } finally {
      setBusy(false)
    }
  }

  const removeContent = async () => {
    if (!content) return
    const confirmed = window.confirm('Delete this draft? This action cannot be undone.')
    if (!confirmed) return
    setBusy(true)
    try {
      await deleteContent(content.id)
      await queryClient.invalidateQueries({ queryKey: ['contents'] })
      addToast('Draft deleted', 'success')
      navigate('/history')
    } catch (error: any) {
      addToast(error?.response?.data?.detail || 'Unable to delete draft', 'error')
      setBusy(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/history" className="btn-ghost px-4 py-2 text-sm">
            <Icon name="arrowLeft" className="h-4 w-4" />
            Back to library
          </Link>
          {content && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={busy}
                className={`btn-ghost px-3 py-2 text-xs ${content.favorite ? 'border-amber-400/60 text-amber-600' : ''}`}
              >
                <Icon name="star" className={`h-3.5 w-3.5 ${content.favorite ? 'fill-amber-400' : ''}`} />
                {content.favorite ? 'Favorited' : 'Favorite'}
              </button>
              <button type="button" onClick={copyContent} className="btn-ghost px-3 py-2 text-xs">
                <Icon name="copy" className="h-3.5 w-3.5" />
                Copy
              </button>
              <button type="button" onClick={downloadContent} className="btn-ghost px-3 py-2 text-xs">
                <Icon name="download" className="h-3.5 w-3.5" />
                Export
              </button>
              <button
                type="button"
                onClick={removeContent}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="surface-panel space-y-5 p-6 sm:p-8">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-3 pt-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className={`h-4 ${index % 3 === 0 ? 'w-full' : index % 3 === 1 ? 'w-11/12' : 'w-4/5'}`} />
              ))}
            </div>
          </div>
        ) : isError || !content ? (
          <EmptyState
            icon="alert"
            title="Draft not found"
            description="This draft may have been deleted, or the API is unavailable."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => refetch()} className="btn-ghost text-xs">
                  <Icon name="refresh" className="h-4 w-4" />
                  Retry
                </button>
                <Link to="/history" className="btn-primary text-xs">
                  Back to library
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.6fr_0.7fr]">
            <article className="surface-panel overflow-hidden">
              <div className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-br from-brand-600/10 via-white/0 to-accent-500/10 px-6 py-7 dark:border-white/5 sm:px-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                    {typeLabel(content.content_type)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Icon name="checkCircle" className="h-3.5 w-3.5" />
                    Generated
                  </span>
                  {content.favorite && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <Icon name="star" className="h-3.5 w-3.5 fill-amber-400" />
                      Favorite
                    </span>
                  )}
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  {content.title || 'Untitled draft'}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {new Date(content.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="fileText" className="h-3.5 w-3.5" />
                    {wordTotal} words
                  </span>
                  {content.tone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="activity" className="h-3.5 w-3.5" />
                      {content.tone}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 py-7 sm:px-8">
                <div className="whitespace-pre-wrap text-[15px] leading-8 text-slate-700 dark:text-slate-300">
                  {generated || 'This draft has no generated content yet.'}
                </div>
              </div>
            </article>

            <aside className="space-y-5">
              <div className="surface-panel p-5">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Brief
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {content.prompt || 'No prompt recorded for this draft.'}
                </p>
              </div>

              <div className="surface-panel space-y-4 p-5">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Details
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500 dark:text-slate-400">Audience</dt>
                    <dd className="text-right font-medium text-slate-900 dark:text-white">
                      {content.target_audience || 'General'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500 dark:text-slate-400">Word target</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">{content.word_count ?? wordTotal}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500 dark:text-slate-400">Language</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">{content.language || 'English'}</dd>
                  </div>
                </dl>
                {keywords.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Keywords</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-dashed border-brand-300/60 bg-brand-50/50 p-5 dark:border-brand-400/20 dark:bg-brand-500/5">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
                  <Icon name="sparkles" className="h-4 w-4" />
                  <p className="text-sm font-semibold">Need a variation?</p>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Generate a fresh take with a different tone or audience.
                </p>
                <Link to="/generate" className="btn-primary mt-4 w-full text-xs">
                  Create another
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ContentDetailsPage
