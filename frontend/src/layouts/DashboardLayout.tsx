import { ReactNode } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MobileNav from '../components/MobileNav'

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-aurora opacity-80" />
        <div className="absolute inset-0 bg-grid opacity-40 dark:opacity-20" />
        <div className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-white/80 via-white/40 to-transparent dark:from-slate-950/90 dark:via-slate-950/60" />
      </div>
      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <main className="relative flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-8 lg:px-10 lg:py-10 md:pb-10">
              {children}
            </div>
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}

export default DashboardLayout
