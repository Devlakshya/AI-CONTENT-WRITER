import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import ContentForm from '../components/ContentForm'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'
import { ContentDB } from '../types'
import { favoriteContent } from '../services/contentService'
import { useToast } from '../hooks/useToast'
import { CONTENT_TYPES } from '../utils/constants'

const typeLabel = (value?: string) => CONTENT_TYPES.find((item) => item.value === value)?.label ?? 'Content'

const GenerateContentPage = () => {
  const [result, setResult] = useState<ContentDB | null>(null)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const generated = result?.generated_content ?? ''
  const wordTotal = generated.trim() ? generated.trim().split(/\s+/).length : 0

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
    const safeTitle = (result?.title || 'lumen-draft').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'lumen-draft'
    link.href = url
    link.download = `${safeTitle.replace(/\s+/g, '-').toLowerCase()}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    addToast('Draft downloaded', 'success')
  }

  const toggleFavorite = async () => {
    if (!result) return
    if (result.favorite) {
      addToast('This draft is already in your favorites', 'info')
      return
    }
    setSaving(true)
    try {
      const updated = await favoriteContent(result.id)
      setResult(updated)
      addToast('Added to favorites', 'success')
    } catch (error: any) {
      addToast(error?.response?.data?.detail || 'Unable to update favorite', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Create"
          title="Generate content"
          description="Describe what you need, choose a format, and let the studio draft a polished first pass."
          actions={
            <Link to="/history" className="btn-ghost">
              <Icon name="history" className="h-4 w-4" />
              View library
            </Link>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="surface-panel p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
                <Icon name="wand" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Content brief</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">The more context, the better the draft.</p>
              </div>
            </div>
            <ContentForm onGenerated={setResult} />
          </div>

          <div className="space-y-6">
            <div className="surface-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Icon name="fileText" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Draft preview</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Latest generation</p>
                  </div>
                </div>
                {result && (
                  <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                    {typeLabel(result.content_type)}
                  </span>
                )}
              </div>

              {result ? (
                <>
                  <div className="px-5 pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-lg font-semibold text-slate-900 dark:text-white">
                          {result.title || 'Untitled draft'}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {wordTotal} words · {new Date(result.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleFavorite}
                        disabled={saving}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                          result.favorite
                            ? 'border-amber-400/50 bg-amber-400/10 text-amber-500'
                            : 'border-slate-200/80 text-slate-400 hover:text-amber-500 dark:border-white/10'
                        }`}
                        aria-label="Toggle favorite"
                      >
                        <Icon name="star" className={`h-4 w-4 ${result.favorite ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mx-5 my-4 max-h-[22rem] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-sm leading-7 text-slate-600 dark:border-white/5 dark:bg-slate-950/50 dark:text-slate-300">
                    {generated || 'The model returned an empty draft. Try adding more detail to your prompt.'}
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-slate-200/70 px-5 py-4 dark:border-white/5">
                    <button type="button" onClick={copyContent} className="btn-ghost px-3 py-2 text-xs">
                      <Icon name="copy" className="h-3.5 w-3.5" />
                      Copy
                    </button>
                    <button type="button" onClick={downloadContent} className="btn-ghost px-3 py-2 text-xs">
                      <Icon name="download" className="h-3.5 w-3.5" />
                      Download
                    </button>
                    <Link to={`/content/${result.id}`} className="btn-subtle ml-auto px-3 py-2 text-xs">
                      Open full view
                      <Icon name="arrowRight" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="px-5 py-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-500 dark:text-brand-300">
                    <Icon name="sparkles" className="h-7 w-7" />
                  </div>
                  <p className="mt-5 text-center font-display text-base font-semibold text-slate-900 dark:text-white">
                    Your draft will appear here
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-center text-sm text-slate-500 dark:text-slate-400">
                    Fill in the brief and hit generate. You can copy, download, or save it as a favorite.
                  </p>
                  <div className="mx-auto mt-6 max-w-xs space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800" />
                    <div className="h-2.5 w-11/12 rounded-full bg-slate-200/70 dark:bg-slate-800/80" />
                    <div className="h-2.5 w-4/5 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
                  </div>
                </div>
              )}
            </div>

            <div className="surface-panel p-6">
              <div className="flex items-center gap-2">
                <Icon name="bulb" className="h-4 w-4 text-amber-500" />
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">Prompt tips</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {[
                  'Name the audience and the outcome you want.',
                  'List three key points that must appear.',
                  'Include offers, stats, or product names.',
                  'Pick a tone that matches your brand voice.',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <Icon name="checkCircle" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default GenerateContentPage
