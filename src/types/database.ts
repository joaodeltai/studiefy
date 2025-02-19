export type Profile = {
  id: string
  user_id: string
  name: string
  level: number
  points: number
  created_at: string
  updated_at: string
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
    }
  }
}
