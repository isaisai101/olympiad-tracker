import { LayoutDashboard, CalendarCheck, BookOpen, Users, LogOut } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { supabase } from '../../api/supabase'
import type { Page } from '../../types'

const NAV: Array<{ page: Page; icon: typeof LayoutDashboard; label: string }> = [
  { page: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { page: 'attendance', icon: CalendarCheck,   label: 'Attendance' },
  { page: 'sessions',   icon: BookOpen,        label: 'Sessions'   },
  { page: 'students',   icon: Users,           label: 'Students'   },
]

export default function Sidebar() {
  const { page, navigate, user } = useStore()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'T'
  const name = user?.user_metadata?.name ?? user?.email ?? 'Teacher'
  const role = user?.user_metadata?.role ?? 'teacher'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🏆</div>
          <div>
            <div className="logo-text">Olympiad</div>
            <div className="logo-sub">Tracker · 2024–25</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>
        {NAV.map(({ page: p, icon: Icon, label }) => (
          <button
            key={p}
            className={`nav-item${page === p ? ' active' : ''}`}
            onClick={() => navigate(p)}
          >
            <Icon size={16} className="nav-icon" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </div>
            <div className="user-role" style={{ textTransform: 'capitalize' }}>{role}</div>
          </div>
          <button
            className="logout-btn"
            title="Sign out"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
