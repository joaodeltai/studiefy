export type Profile = {
  id: string
  user_id: string
  name: string
  level: number
  points: number
  created_at: string
  updated_at: string
  subscription_plan?: 'free' | 'premium'
  email?: string
  username?: string
  avatar_url?: string
  role?: string
  streak?: number
  last_study_date?: string
  xp?: number
}

export type Subject = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export type Content = {
  id: string
  subject_id: string
  title: string
  priority: 'Alta' | 'Média' | 'Baixa'
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  profile_id?: string
  plan: 'free' | 'premium'
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  created_at: string
  updated_at: string
  stripe_price_id?: string
  status: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      subjects: {
        Row: Subject
        Insert: Omit<Subject, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subject, 'id'>>
      }
      contents: {
        Row: Content
        Insert: Omit<Content, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Content, 'id'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id'>>
      }
    }
  }
}
