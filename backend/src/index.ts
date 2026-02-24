import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import supabasePlugin from './plugins/supabase'
import authPlugin from './plugins/auth'
import { studentsRoutes } from './routes/students'
import { sessionsRoutes } from './routes/sessions'
import { attendanceRoutes } from './routes/attendance'
import { subjectsRoutes } from './routes/subjects'

const app = Fastify({ logger: true })

async function start() {
  // ── Plugins ──────────────────────────────────────────────
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })

  await app.register(supabasePlugin)
  await app.register(authPlugin)

  // ── Health check (no auth) ────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ── API Routes ────────────────────────────────────────────
  app.register(studentsRoutes,   { prefix: '/api/students' })
  app.register(sessionsRoutes,   { prefix: '/api/sessions' })
  app.register(attendanceRoutes, { prefix: '/api/attendance' })
  app.register(subjectsRoutes,   { prefix: '/api/subjects' })

  // ── Start ─────────────────────────────────────────────────
  const port = parseInt(process.env.PORT || '3001')
  try {
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`\n🚀 Server running on http://localhost:${port}`)
    console.log(`📋 Health: http://localhost:${port}/health`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
