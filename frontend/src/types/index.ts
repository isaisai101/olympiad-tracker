export interface Profile {
  id: string
  name: string
  role: 'teacher' | 'admin'
}

export interface Subject {
  id: string
  name: string
  color: string
  bg: string
  icon: string
  teacher: string | null
  schedule: string | null
}

export interface Student {
  id: number
  name: string
  grade: string
  subject_id: string
  email: string | null
  streak: number
  joined_date: string
  subjects?: Subject
}

export type AttendanceStatus = 'present' | 'late' | 'absent'

export interface AttendanceRecord {
  id: number
  session_id: string
  student_id: number
  status: AttendanceStatus
  students?: Student
}

export interface Session {
  id: string
  subject_id: string
  date: string
  time: string | null
  topic: string | null
  note: string | null
  attendance?: AttendanceRecord[]
}

export interface StudentStats {
  student_id: number
  student_name: string
  subject_id: string
  total_sessions: number
  present_count: number
  late_count: number
  absent_count: number
  attendance_rate: number
}

export type Page = 'dashboard' | 'attendance' | 'sessions' | 'students'
