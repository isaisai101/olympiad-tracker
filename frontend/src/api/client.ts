import { supabase } from './supabase'
import type { Student, Session, AttendanceStatus, Subject, StudentStats } from '../types'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Get auth token for backend requests
async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await authHeaders()
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers, ...options?.headers } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Students ────────────────────────────────────────────────
export const studentsApi = {
  list: () => request<Student[]>('/api/students'),

  create: (body: { name: string; grade: string; subject_id: string; email?: string }) =>
    request<Student>('/api/students', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: number, body: Partial<Student>) =>
    request<Student>(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (id: number) =>
    request<void>(`/api/students/${id}`, { method: 'DELETE' }),
}

// ── Sessions ────────────────────────────────────────────────
export const sessionsApi = {
  list: (subject_id?: string) =>
    request<Session[]>(`/api/sessions${subject_id ? `?subject_id=${subject_id}` : ''}`),

  create: (body: { subject_id: string; date: string; time?: string; topic?: string; note?: string }) =>
    request<Session>('/api/sessions', { method: 'POST', body: JSON.stringify(body) }),

  delete: (id: string) =>
    request<void>(`/api/sessions/${id}`, { method: 'DELETE' }),
}

// ── Attendance ──────────────────────────────────────────────
export const attendanceApi = {
  update: (session_id: string, student_id: number, status: AttendanceStatus) =>
    request('/api/attendance', {
      method: 'PUT',
      body: JSON.stringify({ session_id, student_id, status }),
    }),

  bulkUpdate: (session_id: string, records: Array<{ student_id: number; status: AttendanceStatus }>) =>
    request('/api/attendance/bulk', {
      method: 'PUT',
      body: JSON.stringify({ session_id, records }),
    }),

  stats: () => request<StudentStats[]>('/api/attendance/stats'),
}

// ── Subjects ────────────────────────────────────────────────
export const subjectsApi = {
  list: () => request<Subject[]>('/api/subjects'),
}
