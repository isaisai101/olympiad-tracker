import { useStore } from '../../store/useStore'

const PAGE_INFO: Record<string, { title: string; sub: string }> = {
  dashboard:  { title: 'Dashboard',  sub: 'Overview of attendance and performance'   },
  attendance: { title: 'Attendance', sub: 'Mark and review session attendance'        },
  sessions:   { title: 'Sessions',   sub: 'Manage training sessions'                  },
  students:   { title: 'Students',   sub: 'Manage enrolled students'                  },
}

export default function TopBar() {
  const page = useStore(s => s.page)
  const info = PAGE_INFO[page] ?? PAGE_INFO.dashboard

  const now = new Date()
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{info.title}</div>
        <div className="topbar-sub">{info.sub}</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--t3)' }}>{date}</div>
    </header>
  )
}
