import { useState } from 'react'
import { Plus, Trash2, X, CalendarDays } from 'lucide-react'
import { useStore } from '../store/useStore'

interface SessionForm {
  subject_id: string
  date: string
  time: string
  topic: string
  note: string
}

const emptyForm: SessionForm = {
  subject_id: '',
  date: new Date().toISOString().slice(0, 10),
  time: '',
  topic: '',
  note: '',
}

export default function Sessions() {
  const { sessions, subjects, students, addSession, deleteSession } = useStore()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<SessionForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject_id || !form.date) { setError('Subject and date are required'); return }
    setLoading(true)
    try {
      await addSession({
        subject_id: form.subject_id,
        date: form.date,
        time: form.time || undefined,
        topic: form.topic || undefined,
        note: form.note || undefined,
      })
      setModal(false)
      setForm(emptyForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this session? Attendance records will also be removed.')) return
    await deleteSession(id)
  }

  const filtered = filterSubject ? sessions.filter(s => s.subject_id === filterSubject) : sessions

  function getStudentCount(session: typeof sessions[0]) {
    const subj = session.subject_id
    return students.filter(s => s.subject_id === subj).length
  }

  function getPresentCount(session: typeof sessions[0]) {
    return (session.attendance ?? []).filter(a => a.status === 'present').length
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="page">
      <div className="page-in">
        <div className="section-hd" style={{ marginBottom: 20 }}>
          <div>
            <div className="section-title">Sessions ({filtered.length})</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>All training sessions with attendance records</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="inp" style={{ width: 160 }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">All subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setError(''); setModal(true) }}>
              <Plus size={15} /> New Session
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">No sessions yet. Create the first session to start tracking attendance.</div>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Time</th>
                  <th>Attendance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sess => {
                  const subj = subjects.find(s => s.id === sess.subject_id)
                  const total = getStudentCount(sess)
                  const present = getPresentCount(sess)
                  const rate = total > 0 ? Math.round((present / total) * 100) : null
                  return (
                    <tr key={sess.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CalendarDays size={14} style={{ color: 'var(--t3)' }} />
                          <span style={{ fontWeight: 600 }}>{formatDate(sess.date)}</span>
                        </div>
                      </td>
                      <td>
                        {subj && (
                          <span className="subj-chip" style={{ background: subj.bg, color: subj.color }}>
                            {subj.icon} {subj.name}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--t2)' }}>{sess.topic || <span style={{ color: 'var(--t3)' }}>—</span>}</td>
                      <td style={{ color: 'var(--t3)', fontSize: 12, fontFamily: 'var(--mono)' }}>
                        {sess.time || '—'}
                      </td>
                      <td>
                        {rate !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--t3)' }}>{present}/{total}</span>
                            <div className="rate-bar" style={{ width: 60 }}>
                              <div className="rate-fill" style={{
                                width: `${rate}%`,
                                background: rate >= 80 ? '#4ade80' : rate >= 60 ? '#facc15' : '#f87171'
                              }} />
                            </div>
                          </div>
                        ) : <span style={{ color: 'var(--t3)', fontSize: 12 }}>No records</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button className="btn btn-danger" style={{ padding: '5px 8px' }} onClick={() => handleDelete(sess.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div className="modal-title" style={{ margin: 0 }}>New Session</div>
              <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setModal(false)}>
                <X size={15} />
              </button>
            </div>

            {error && <div className="login-err" style={{ marginBottom: 16 }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Subject *</label>
                <select className="inp" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Date *</label>
                <input className="inp" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Time (optional)</label>
                <input className="inp" placeholder="16:00–17:30" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Topic (optional)</label>
                <input className="inp" placeholder="Combinatorics, Number Theory..." value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Notes (optional)</label>
                <input className="inp" placeholder="Any notes about this session..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
