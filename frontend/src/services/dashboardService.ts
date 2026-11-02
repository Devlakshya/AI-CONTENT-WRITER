import api from './api'

export interface DashboardOverview {
  user: { id: number; name: string; email: string }
  stats: {
    projects: number
    content_generations: number
    favorites: number
  }
}

export const fetchDashboardOverview = async () => {
  const response = await api.get<DashboardOverview>('/dashboard/overview')
  return response.data
}
