import { Route, Routes } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import ToastViewport from './components/ui/ToastViewport'

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-slate-900 transition-colors duration-300 dark:text-slate-100">
      <Routes>
        {AppRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      <ToastViewport />
    </div>
  )
}

export default App
