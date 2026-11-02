import AuthPage from '../pages/AuthPage'
import DashboardPage from '../pages/DashboardPage'
import ProfilePage from '../pages/ProfilePage'
import ContentHistoryPage from '../pages/ContentHistoryPage'
import GenerateContentPage from '../pages/GenerateContentPage'
import ContentDetailsPage from '../pages/ContentDetailsPage'
import AdminPage from '../pages/AdminPage'
import BillingPage from '../pages/BillingPage'
import PricingPage from '../pages/PricingPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProtectedRoute from '../components/ProtectedRoute'

const AppRoutes = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/history',
    element: (
      <ProtectedRoute>
        <ContentHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/generate',
    element: (
      <ProtectedRoute>
        <GenerateContentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/content/:id',
    element: (
      <ProtectedRoute>
        <ContentDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/billing',
    element: (
      <ProtectedRoute>
        <BillingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pricing',
    element: (
      <ProtectedRoute>
        <PricingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  { path: '/login', element: <AuthPage /> },
  { path: '/register', element: <AuthPage initialMode="register" /> },
  { path: '*', element: <NotFoundPage /> },
]

export default AppRoutes
