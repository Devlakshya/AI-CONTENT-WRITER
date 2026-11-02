export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000'
export const TOKEN_KEY = 'access_token'
export const CONTENT_TYPES = [
  { label: 'Blog Post', value: 'blog' },
  { label: 'Product Description', value: 'product' },
  { label: 'Social Caption', value: 'social' },
  { label: 'Email Copy', value: 'email' },
  { label: 'SEO Title', value: 'seo_title' },
  { label: 'SEO Meta', value: 'seo_meta' },
]
