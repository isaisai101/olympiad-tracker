import { useStore } from '../store/useStore'
import { Users, CalendarCheck, TrendingUp, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function rateColor(r: number | null) {
  if (r === null) return 'var(--t3)'
  return r >= 85 ? '#4ade80' : r >= 65 ? '#facc15' : '#f87171'
}

export default function Dashboard() {
  const { students, subjects, sessions, stats, navigate } = useStore()

  const totalStudents = students.length
  const avgRate = stats.length
    ? Math.round(stats.reduce((s, st) => s + (st.attendance_rate ?? 0), 0) / stats.length)
    : 0
  const atRisk = stats.filter(s => (s.attendance_rate ?? 100) < 70).length
  const totalSessions = sessions.length

  // Chart: attendance rate per subject
  const chartData = subjects.map(subj => {
    const subjStats = stats.filter(s => s.subject_id === subj.id)
    const rate = subjStats.length
      ? Math.round(subjStats.reduce((s, st) => s + (st.attendance_rate ?? 0), 0) / subjStats.length)
      : 0
    return { name: subj.name.slice(0, 4), rate, full: subj.name }
  }).filter(d => d.rate > 0)

  // Top students by attendance rate
  const topStudents = [...stats]
    .filter(s => s.attendance_rate !== null)
    .sort((a, b) => (b.attendance_rate ?? 0) - (a.attendance_rate ?? 0))
    .slice(0, 6)

  return (
    <div className="page">
      <div className="page-in">
        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Users size={12} /> Students
            </div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-sub">{subjects.length} subjects</div>
          </div>

          <div className="stat-card">
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={12} /> Avg Attendance
            </div>
            <div className="stat-value" style={{ color: rateColor(avgRate) }}>{avgRate}%</div>
            <div className="stat-sub">across all subjects</div>
          </div>

          <div className="stat-card">
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CalendarCheck size={12} /> Sessions
            </div>
            <div className="stat-value">{totalSessions}</div>
            <div className="stat-sub">total recorded</div>
          </div>

          <div className="stat-card">
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertTriangle size={12} /> At Risk
            </div>
            <div className="stat-value" style={{ color: atRisk > 0 ? '#f87171' : '#4ade80' }}>{atRisk}</div>
            <div className="stat-sub">below 70% attendance</div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-hd">
              <div className="section-title">Attendance by Subject</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C9943A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9943A" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a24', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Avg rate']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.full ?? label}
                />
                <Area type="monotone" dataKey="rate" stroke="#C9943A" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Students */}
        {topStudents.length > 0 && (
          <div className="card">
            <div className="section-hd">
              <div className="section-title">Top Students</div>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => navigate('students')}>
                View all
              </button>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Sessions</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((st, i) => {
                  const subj = subjects.find(s => s.id === st.subject_id)
                  return (
                    <tr key={st.student_id}>
                      <td style={{ color: 'var(--t3)', fontSize: 12 }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{st.student_name}</td>
                      <td>
                        {subj && (
                          <span className="subj-chip" style={{ background: subj.bg, color: subj.color }}>
                            {subj.icon} {subj.name}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--t3)' }}>{st.total_sessions}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="rate-bar" style={{ width: 80 }}>
                            <div className="rate-fill" style={{ width: `${st.attendance_rate}%`, background: rateColor(st.attendance_rate) }} />
                          </div>
                          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: rateColor(st.attendance_rate) }}>
                            {st.attendance_rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalStudents === 0 && (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">🏆</div>
              <div className="empty-text">No data yet. Start by adding students and creating sessions.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
