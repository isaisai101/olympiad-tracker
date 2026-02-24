import { create } from 'zustand'
import type { Student, Subject, Session, StudentStats, Page, AttendanceStatus } from '../types'
import { studentsApi, sessionsApi, attendanceApi, subjectsApi } from '../api/client'
import { supabase } from '../api/supabase'
import type { User } from '@supabase/supabase-js'

interface AppStore {
  // Auth
  user: User | null
  setUser: (user: User | null) => void

  // Navigation
  page: Page
  selectedSubjectId: string | null
  selectedStudentId: number | null
  navigate: (page: Page, opts?: { subjectId?: string; studentId?: number }) => void

  // Data
  students: Student[]
  subjects: Subject[]
  sessions: Session[]
  stats: StudentStats[]
  loading: boolean
  error: string | null

  // Actions
  fetchAll: () => Promise<void>
  fetchSessions: (subjectId?: string) => Promise<void>
  addStudent: (data: { name: string; grade: string; subject_id: string; email?: string }) => Promise<void>
  updateStudent: (id: number, data: Partial<Student>) => Promise<void>
  deleteStudent: (id: number) => Promise<void>
  addSession: (data: { subject_id: string; date: string; time?: string; topic?: string; note?: string }) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  setAttendance: (sessionId: string, studentId: number, status: AttendanceStatus) => Promise<void>

  // Computed
  getAttendanceRate: (studentId: number) => number | null
}

export const useStore = create<AppStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  page: 'dashboard',
  selectedSubjectId: null,
  selectedStudentId: null,

  navigate(page, opts = {}) {
    set({
      page,
      selectedSubjectId: opts.subjectId ?? get().selectedSubjectId,
      selectedStudentId: opts.studentId ?? get().selectedStudentId,
    })
  },

  students: [],
  subjects: [],
  sessions: [],
  stats: [],
  loading: false,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null })
    try {
      const [students, subjects, sessions, stats] = await Promise.all([
        studentsApi.list(),
        subjectsApi.list(),
        sessionsApi.list(),
        attendanceApi.stats(),
      ])
      set({ students, subjects, sessions, stats })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load data' })
    } finally {
      set({ loading: false })
    }
  },

  async fetchSessions(subjectId) {
    try {
      const sessions = await sessionsApi.list(subjectId)
      set({ sessions })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load sessions' })
    }
  },

  async addStudent(data) {
    const student = await studentsApi.create(data)
    set(s => ({ students: [...s.students, student] }))
  },

  async updateStudent(id, data) {
    const updated = await studentsApi.update(id, data)
    set(s => ({ students: s.students.map(st => st.id === id ? updated : st) }))
  },

  async deleteStudent(id) {
    await studentsApi.delete(id)
    set(s => ({ students: s.students.filter(st => st.id !== id) }))
  },

  async addSession(data) {
    const session = await sessionsApi.create(data)
    set(s => ({ sessions: [session, ...s.sessions] }))
  },

  async deleteSession(id) {
    await sessionsApi.delete(id)
    set(s => ({ sessions: s.sessions.filter(sess => sess.id !== id) }))
  },

  async setAttendance(sessionId, studentId, status) {
    await attendanceApi.update(sessionId, studentId, status)
    // Optimistically update local state
    set(s => ({
      sessions: s.sessions.map(sess => {
        if (sess.id !== sessionId) return sess
        const attendance = (sess.attendance ?? []).map(a =>
          a.student_id === studentId ? { ...a, status } : a
        )
        return { ...sess, attendance }
      })
    }))
  },

  getAttendanceRate(studentId) {
    const stat = get().stats.find(s => s.student_id === studentId)
    return stat?.attendance_rate ?? null
  },
}))
