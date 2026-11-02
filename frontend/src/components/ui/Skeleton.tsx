interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className = 'h-4 w-full' }: SkeletonProps) => (
  <div className={`relative overflow-hidden rounded-xl bg-slate-200/70 dark:bg-slate-800/70 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
  </div>
)

export const CardSkeleton = () => (
  <div className="surface-panel space-y-4 p-6">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-24 w-full" />
  </div>
)

export default Skeleton
