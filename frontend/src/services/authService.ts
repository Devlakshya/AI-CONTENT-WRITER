import api from './api'
import { AuthToken, UserCreate, UserDB } from '../types'
import { API_ORIGIN } from '../utils/constants'

const login = (payload: { username: string; password: string }) =>
  api
    .post<AuthToken>(`${API_ORIGIN}/api/auth/login`, new URLSearchParams(payload), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then((response) => response.data)

const register = (payload: UserCreate) =>
  api.post<UserDB>(`${API_ORIGIN}/api/auth/register`, payload).then((response) => response.data)

const getMe = () => api.get<UserDB>(`${API_ORIGIN}/api/auth/me`).then((response) => response.data)

const authService = {
  login,
  register,
  getMe,
}

export default authService
