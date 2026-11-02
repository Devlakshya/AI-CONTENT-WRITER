const LoadingSpinner = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
    <div className="relative flex h-14 w-14 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/20" />
      <span className="relative h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600 dark:border-white/10 dark:border-t-brand-400" />
    </div>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Preparing your workspace…</p>
  </div>
)

export default LoadingSpinner
