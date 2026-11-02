import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-brand-500 dark:text-brand-300">
          <span className="h-px w-6 bg-gradient-to-r from-brand-500 to-accent-500" />
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-2xl font-bold leading-tight text-slate-900 sm:text-3xl dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
)

export default PageHeader
