import { ReactNode } from 'react'

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-aurora opacity-90" />
        <div className="absolute inset-0 bg-grid opacity-40 dark:opacity-20" />
        <div className="absolute -left-32 top-1/3 h-72 w-72 animate-float rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -right-24 top-10 h-80 w-80 animate-float rounded-full bg-accent-400/20 blur-3xl [animation-delay:2s]" />
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
        <div className="w-full max-w-6xl">{children}</div>
      </div>
      <footer className="relative px-4 pb-6 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Lumen AI · Private, local-first content generation
      </footer>
    </div>
  )
}

export default PublicLayout
