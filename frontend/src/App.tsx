import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { supabase } from './api/supabase'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Sessions from './pages/Sessions'
import Students from './pages/Students'

export default function App() {
  const { user, setUser, fetchAll, loading, page } = useStore()

  // Listen for Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  // Fetch all data when user logs in
  useEffect(() => {
    if (user) fetchAll()
  }, [user, fetchAll])

  // Not logged in → show login screen
  if (!user) {
    return (
      <>
        <div className="aurora">
          <div className="aurora-blob" />
          <div className="aurora-blob" />
          <div className="aurora-blob" />
        </div>
        <Login />
      </>
    )
  }

  // Loading data
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div style={{ color: 'var(--t3)', fontSize: 13 }}>Loading your data...</div>
      </div>
    )
  }

  const pages: Record<string, JSX.Element> = {
    dashboard:  <Dashboard />,
    attendance: <Attendance />,
    sessions:   <Sessions />,
    students:   <Students />,
  }

  return (
    <div className="layout">
      <div className="aurora">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>
      <Sidebar />
      <div className="main">
        <TopBar />
        {pages[page] ?? <Dashboard />}
      </div>
    </div>
  )
}
