import api from './api'
import { ContentCreate, ContentDB } from '../types'

export const fetchContents = async () => {
  const response = await api.get<ContentDB[]>('/content/')
  return response.data
}

export const fetchContent = async (id: number | string) => {
  const response = await api.get<ContentDB>(`/content/${id}`)
  return response.data
}

export const createContent = async (payload: ContentCreate) => {
  const response = await api.post<ContentDB>('/content/generate', payload)
  return response.data
}

export const favoriteContent = async (id: number) => {
  const response = await api.post<ContentDB>(`/content/${id}/favorite`)
  return response.data
}

export const deleteContent = async (id: number) => {
  await api.delete(`/content/${id}`)
}
