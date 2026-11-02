import { useToast, ToastVariant } from '../../hooks/useToast'
import Icon, { IconName } from './Icon'

const styles: Record<ToastVariant, { ring: string; icon: IconName; iconClass: string; bar: string }> = {
  success: {
    ring: 'border-emerald-400/40',
    icon: 'checkCircle',
    iconClass: 'bg-emerald-500/15 text-emerald-500',
    bar: 'bg-emerald-500',
  },
  error: {
    ring: 'border-rose-400/40',
    icon: 'alert',
    iconClass: 'bg-rose-500/15 text-rose-500',
    bar: 'bg-rose-500',
  },
  warning: {
    ring: 'border-amber-400/40',
    icon: 'alert',
    iconClass: 'bg-amber-500/15 text-amber-500',
    bar: 'bg-amber-500',
  },
  info: {
    ring: 'border-brand-400/40',
    icon: 'info',
    iconClass: 'bg-brand-500/15 text-brand-500',
    bar: 'bg-brand-500',
  },
}

const ToastViewport = () => {
  const { messages, removeToast } = useToast()

  if (messages.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6">
      {messages.map((message) => {
        const style = styles[message.variant]
        return (
          <div
            key={message.id}
            role="status"
            className={`pointer-events-auto animate-pop-in overflow-hidden rounded-2xl border ${style.ring} bg-white/95 shadow-card backdrop-blur-xl dark:bg-slate-900/95`}
          >
            <div className="flex items-start gap-3 p-4">
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.iconClass}`}>
                <Icon name={style.icon} className="h-4 w-4" />
              </span>
              <p className="flex-1 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                {message.message}
              </p>
              <button
                type="button"
                onClick={() => removeToast(message.id)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Dismiss notification"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className={`h-0.5 w-full ${style.bar} opacity-70`} />
          </div>
        )
      })}
    </div>
  )
}

export default ToastViewport
