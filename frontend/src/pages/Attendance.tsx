import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { AttendanceStatus } from '../types'

const STATUS_CYCLE: Array<AttendanceStatus | undefined> = ['present', 'late', 'absent', undefined]
const STATUS_LABEL: Record<AttendanceStatus, string> = { present: 'P', late: 'L', absent: 'A' }

function nextStatus(current: AttendanceStatus | undefined): AttendanceStatus | undefined {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

function getStatus(session: { attendance?: Array<{ student_id: number; status: AttendanceStatus }> }, studentId: number): AttendanceStatus | undefined {
  return session.attendance?.find(a => a.student_id === studentId)?.status
}

export default function Attendance() {
  const { subjects, students, sessions, setAttendance } = useStore()
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedSession, setSelectedSession] = useState('')

  const subjectSessions = sessions.filter(s => s.subject_id === selectedSubject)
  const subjectStudents = students.filter(s => s.subject_id === selectedSubject)
  const session = sessions.find(s => s.id === selectedSession)

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  async function handleClick(studentId: number) {
    if (!session) return
    const current = getStatus(session, studentId)
    const next = nextStatus(current)
    if (next === undefined) {
      // Set to absent as the "clear" state (you can't truly remove in this flow)
      await setAttendance(session.id, studentId, 'absent')
    } else {
      await setAttendance(session.id, studentId, next)
    }
  }

  // Stats for current session
  const presentCount = session ? subjectStudents.filter(s => getStatus(session, s.id) === 'present').length : 0
  const lateCount = session ? subjectStudents.filter(s => getStatus(session, s.id) === 'late').length : 0
  const absentCount = session ? subjectStudents.filter(s => getStatus(session, s.id) === 'absent').length : 0

  return (
    <div className="page">
      <div className="page-in">
        {/* Selectors */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label>Subject</label>
              <select className="inp" value={selectedSubject}
                onChange={e => { setSelectedSubject(e.target.value); setSelectedSession('') }}>
                <option value="">Select subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label>Session</label>
              <select className="inp" value={selectedSession} onChange={e => setSelectedSession(e.target.value)}
                disabled={!selectedSubject}>
                <option value="">Select session...</option>
                {subjectSessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.date)}{s.topic ? ` — ${s.topic}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Session stats */}
        {session && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Present', count: presentCount, color: '#4ade80', bg: 'rgba(22,163,74,.1)' },
              { label: 'Late',    count: lateCount,    color: '#facc15', bg: 'rgba(234,179,8,.1)' },
              { label: 'Absent',  count: absentCount,  color: '#f87171', bg: 'rgba(239,68,68,.1)' },
            ].map(({ label, count, color, bg }) => (
              <div key={label} style={{ flex: 1, background: bg, border: `1px solid ${color}30`, borderRadius: 'var(--r-lg)', padding: '12px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color }}>{count}</div>
              </div>
            ))}
          </div>
        )}

        {/* Attendance table */}
        {!selectedSubject && (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">Select a subject and session to mark attendance.</div>
            </div>
          </div>
        )}

        {selectedSubject && !selectedSession && (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">📅</div>
              <div className="empty-text">
                {subjectSessions.length === 0
                  ? 'No sessions for this subject yet. Create one in the Sessions page.'
                  : 'Select a session to mark attendance.'}
              </div>
            </div>
          </div>
        )}

        {session && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{formatDate(session.date)}</div>
                {session.topic && <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{session.topic}</div>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                Click to cycle: <span style={{ color: '#4ade80' }}>P</span> → <span style={{ color: '#facc15' }}>L</span> → <span style={{ color: '#f87171' }}>A</span>
              </div>
            </div>

            {subjectStudents.length === 0 ? (
              <div className="empty">
                <div className="empty-text">No students enrolled in this subject yet.</div>
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectStudents.map(st => {
                    const status = getStatus(session, st.id)
                    return (
                      <tr key={st.id}>
                        <td style={{ fontWeight: 600 }}>{st.name}</td>
                        <td><span className="badge badge-blue">{st.grade}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                              className={`att-btn${status ? ` ${status}` : ''}`}
                              onClick={() => handleClick(st.id)}
                              title="Click to change status"
                            >
                              {status ? STATUS_LABEL[status] : '—'}
                            </button>
                            <span style={{ fontSize: 12, color: 'var(--t3)', textTransform: 'capitalize' }}>
                              {status ?? 'not set'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
