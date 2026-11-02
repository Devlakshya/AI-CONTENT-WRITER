import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import Icon from '../components/ui/Icon'

const NotFoundPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-aurora opacity-90" />
        <div className="absolute inset-0 bg-grid opacity-40 dark:opacity-20" />
      </div>
      <div className="w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="surface-card p-8 text-center sm:p-12">
          <p className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text font-display text-7xl font-bold text-transparent sm:text-8xl">
            404
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            The page you are looking for does not exist or has been moved. Let&apos;s get you back to your
            workspace.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary text-sm">
              <Icon name="dashboard" className="h-4 w-4" />
              Return to dashboard
            </Link>
            <Link to="/generate" className="btn-ghost text-sm">
              <Icon name="sparkles" className="h-4 w-4" />
              Generate content
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
