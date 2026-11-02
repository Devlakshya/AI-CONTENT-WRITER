import { ReactNode } from 'react'

interface ContentCardProps {
  title: string
  subtitle: string
  children?: ReactNode
}

const ContentCard = ({ title, subtitle, children }: ContentCardProps) => (
  <div className="surface-panel p-6">
    <div className="mb-4">
      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
    {children}
  </div>
)

export default ContentCard
