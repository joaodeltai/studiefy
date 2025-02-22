import { create } from 'zustand'

interface UserState {
  user: any | null
  setUser: (user: any) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

interface SubjectState {
  subjects: any[]
  setSubjects: (subjects: any[]) => void
  addSubject: (subject: any) => void
}

export const useSubjectStore = create<SubjectState>((set) => ({
  subjects: [],
  setSubjects: (subjects) => set({ subjects }),
  addSubject: (subject) => set((state) => ({ subjects: [...state.subjects, subject] })),
}))
