import api from './api'
import { BillingOverview, BillingPlan, BillingAnalytics } from '../types'

export const fetchPricingPlans = async () => {
  const response = await api.get<BillingPlan[]>('/billing/pricing')
  return response.data
}

export const fetchBillingOverview = async () => {
  const response = await api.get<BillingOverview>('/billing/status')
  return response.data
}

export const createCheckoutSession = async () => {
  const response = await api.post<{ url: string }>('/billing/checkout-session')
  return response.data
}

export const createCustomerPortal = async () => {
  const response = await api.post<{ url: string }>('/billing/customer-portal')
  return response.data
}

export const cancelSubscription = async () => {
  const response = await api.post('/billing/cancel')
  return response.data
}

export const downgradeSubscription = async () => {
  const response = await api.post('/billing/downgrade')
  return response.data
}

export const fetchBillingAnalytics = async () => {
  const response = await api.get<BillingAnalytics>('/billing/analytics')
  return response.data
}
