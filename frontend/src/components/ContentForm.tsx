import { FormEvent, useState } from 'react'
import { createContent } from '../services/contentService'
import { useToast } from '../hooks/useToast'
import { CONTENT_TYPES } from '../utils/constants'
import { ContentDB } from '../types'
import { useQueryClient } from '@tanstack/react-query'
import Icon, { IconName } from './ui/Icon'

interface ContentFormProps {
  onGenerated?: (content: ContentDB) => void
}

const typeIcons: Record<string, IconName> = {
  blog: 'book',
  product: 'briefcase',
  social: 'send',
  email: 'mail',
  seo_title: 'target',
  seo_meta: 'globe',
}

const tones = ['Neutral', 'Professional', 'Friendly', 'Persuasive', 'Confident', 'Playful', 'Authoritative']

const samplePrompts: Record<string, string> = {
  blog: 'Write a practical guide for remote teams on running async stand-ups that actually save time.',
  product: 'Introduce a smart budgeting app that helps freelancers predict irregular income.',
  social: 'Create a launch-day post for an AI content workspace aimed at marketing teams.',
  email: 'Write a welcome email for new users of a content generation platform.',
  seo_title: 'Generate SEO title options for an article about sustainable home office setups.',
  seo_meta: 'Write a meta description for a landing page about AI content generation for SaaS teams.',
}

const ContentForm = ({ onGenerated }: ContentFormProps) => {
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('blog')
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('Professional')
  const [audience, setAudience] = useState('')
  const [keywords, setKeywords] = useState('')
  const [wordCount, setWordCount] = useState(200)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() && !prompt.trim()) {
      addToast('Add a title or prompt before generating', 'error')
      return
    }

    setLoading(true)
    try {
      const created = await createContent({
        title,
        content_type: contentType,
        prompt,
        tone,
        word_count: wordCount,
        target_audience: audience,
        keywords,
      })
      onGenerated?.(created)
      queryClient.invalidateQueries({ queryKey: ['contents'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'overview'] })
      addToast('Content generated successfully', 'success')
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Failed to generate content. Please try again.'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="label-text">
          Working title <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-surface"
          placeholder="e.g. Q3 product launch announcement"
        />
      </div>

      <div className="space-y-3">
        <span className="label-text">Content type</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONTENT_TYPES.map((type) => {
            const active = contentType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setContentType(type.value)}
                className={`group flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'border-brand-400/70 bg-gradient-to-br from-brand-500/10 to-accent-500/10 text-brand-700 shadow-sm dark:border-brand-400/40 dark:text-brand-200'
                    : 'border-slate-200/80 bg-white/60 text-slate-600 hover:-translate-y-0.5 hover:border-brand-300/70 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-300'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  <Icon name={typeIcons[type.value] ?? 'fileText'} className="h-4 w-4" />
                </span>
                <span className="truncate">{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="tone" className="label-text">
            Tone of voice
          </label>
          <div className="relative">
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input-surface appearance-none pr-10"
            >
              {tones.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="audience" className="label-text">
            Target audience
          </label>
          <input
            id="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="input-surface"
            placeholder="e.g. B2B marketers"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="keywords" className="label-text">
          Keywords <span className="text-slate-400">(comma separated)</span>
        </label>
        <input
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="input-surface"
          placeholder="AI content, automation, growth"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="wordCount" className="label-text">
            Target length
          </label>
          <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
            {wordCount} words
          </span>
        </div>
        <input
          id="wordCount"
          type="range"
          min={50}
          max={1500}
          step={50}
          value={wordCount}
          onChange={(e) => setWordCount(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-slate-800"
        />
        <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span>Short</span>
          <span>Standard</span>
          <span>Long-form</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="prompt" className="label-text">
            Brief or prompt
          </label>
          <button
            type="button"
            onClick={() => setPrompt(samplePrompts[contentType] ?? '')}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 transition hover:text-brand-500 dark:text-brand-300"
          >
            <Icon name="bulb" className="h-3.5 w-3.5" />
            Use sample
          </button>
        </div>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="input-surface resize-none"
          placeholder="What should the content be about? Add key points, offers, and any must-include details."
        />
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Be specific for better results</span>
          <span>{prompt.length} characters</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-5 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Icon name="lock" className="h-3.5 w-3.5" />
          Generations run on your local model.
        </p>
        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          <Icon name={loading ? 'refresh' : 'sparkles'} className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating…' : 'Generate content'}
        </button>
      </div>
    </form>
  )
}

export default ContentForm
