import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Student } from '../types'

interface StudentForm {
  name: string
  grade: string
  subject_id: string
  email: string
}

const empty: StudentForm = { name: '', grade: '', subject_id: '', email: '' }

export default function Students() {
  const { students, subjects, stats, addStudent, updateStudent, deleteStudent } = useStore()

  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [form, setForm] = useState<StudentForm>(empty)
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  function openAdd() { setForm(empty); setEditId(null); setModal('add'); setError('') }

  function openEdit(s: Student) {
    setForm({ name: s.name, grade: s.grade, subject_id: s.subject_id ?? '', email: s.email ?? '' })
    setEditId(s.id)
    setModal('edit')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.grade || !form.subject_id) {
      setError('Name, grade, and subject are required')
      return
    }
    setLoading(true)
    try {
      if (modal === 'add') {
        await addStudent({ name: form.name, grade: form.grade, subject_id: form.subject_id, email: form.email || undefined })
      } else if (editId) {
        await updateStudent(editId, { name: form.name, grade: form.grade, subject_id: form.subject_id, email: form.email || null })
      }
      setModal(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this student? Their attendance history will also be removed.')) return
    await deleteStudent(id)
  }

  function getRate(studentId: number) {
    return stats.find(s => s.student_id === studentId)?.attendance_rate ?? null
  }

  function rateColor(r: number | null) {
    if (r === null) return 'var(--t3)'
    return r >= 85 ? '#4ade80' : r >= 65 ? '#facc15' : '#f87171'
  }

  const filtered = filterSubject ? students.filter(s => s.subject_id === filterSubject) : students

  function avatarColor(name: string) {
    const colors = ['#C9943A', '#6B5CE7', '#34D399', '#5B9BF8', '#F97316', '#EC4899']
    return colors[name.charCodeAt(0) % colors.length]
  }

  return (
    <div className="page">
      <div className="page-in">
        {/* Header */}
        <div className="section-hd" style={{ marginBottom: 20 }}>
          <div>
            <div className="section-title">All Students ({filtered.length})</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
              Manage enrolled olympiad students
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              className="inp"
              style={{ width: 160 }}
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
            >
              <option value="">All subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={15} /> Add Student
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👩‍🎓</div>
              <div className="empty-text">No students yet. Add your first student to get started.</div>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Subject</th>
                  <th>Email</th>
                  <th>Attendance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(st => {
                  const subj = subjects.find(s => s.id === st.subject_id)
                  const rate = getRate(st.id)
                  return (
                    <tr key={st.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: avatarColor(st.name) }}>
                            {st.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{st.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue">{st.grade}</span>
                      </td>
                      <td>
                        {subj && (
                          <span className="subj-chip" style={{ background: subj.bg, color: subj.color }}>
                            {subj.icon} {subj.name}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--t3)', fontSize: 12 }}>{st.email || '—'}</td>
                      <td>
                        {rate !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="rate-bar" style={{ width: 64 }}>
                              <div className="rate-fill" style={{ width: `${rate}%`, background: rateColor(rate) }} />
                            </div>
                            <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: rateColor(rate) }}>{rate}%</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--t3)', fontSize: 12 }}>No data</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost" style={{ padding: '5px 8px' }} onClick={() => openEdit(st)}>
                            <Pencil size={13} />
                          </button>
                          <button className="btn btn-danger" style={{ padding: '5px 8px' }} onClick={() => handleDelete(st.id)}>
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

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div className="modal-title" style={{ margin: 0 }}>
                {modal === 'add' ? 'Add Student' : 'Edit Student'}
              </div>
              <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setModal(null)}>
                <X size={15} />
              </button>
            </div>

            {error && <div className="login-err" style={{ marginBottom: 16 }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Full Name *</label>
                <input className="inp" placeholder="Aizat Bekova" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Grade *</label>
                <input className="inp" placeholder="10A" value={form.grade}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Subject *</label>
                <select className="inp" value={form.subject_id}
                  onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Email (optional)</label>
                <input className="inp" type="email" placeholder="student@school.kz" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : modal === 'add' ? 'Add Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
