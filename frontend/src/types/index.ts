export type UserCreate = {
  name: string
  email: string
  password: string
}

export type UserDB = {
  id: number
  name: string
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type AuthToken = {
  access_token: string
  token_type: 'bearer'
}

export type ContentCreate = {
  project_id?: number | null
  title?: string | null
  content_type: string
  prompt: string
  generated_content?: string
  tone?: string
  word_count?: number
  target_audience?: string
  keywords?: string
  language?: string
}

export type ContentDB = ContentCreate & {
  id: number
  user_id: number
  favorite: boolean
  created_at: string
}

export type BillingPlan = {
  id?: string
  name: string
  description: string
  price: number
  monthly_limit: number | null
  unlimited: boolean
}

export type BillingOverview = {
  subscription: {
    status: string
    plan_name: string
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    current_period_end?: string | null
  }
  usage: {
    month?: string
    generation_count: number
    limit: number
    remaining: number
  }
}

export type BillingAnalytics = {
  mrr: number
  active_subscribers: number
  churn_rate: number
  total_generations: number
}
