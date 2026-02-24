import { FastifyInstance } from 'fastify'

export async function attendanceRoutes(fastify: FastifyInstance) {
  // GET /api/attendance?session_id=...&student_id=...
  fastify.get<{ Querystring: { session_id?: string; student_id?: string } }>(
    '/',
    async (request, reply) => {
      let query = fastify.supabase
        .from('attendance')
        .select('*, students(id, name, grade), sessions(id, date, subject_id)')

      if (request.query.session_id) query = query.eq('session_id', request.query.session_id)
      if (request.query.student_id) query = query.eq('student_id', parseInt(request.query.student_id))

      const { data, error } = await query
      if (error) return reply.status(500).send({ error: error.message })
      return data
    }
  )

  // PUT /api/attendance — upsert single record
  fastify.put<{
    Body: {
      session_id: string
      student_id: number
      status: 'present' | 'late' | 'absent'
    }
  }>('/', async (request, reply) => {
    const { session_id, student_id, status } = request.body

    if (!session_id || !student_id || !status) {
      return reply.status(400).send({ error: 'session_id, student_id, and status are required' })
    }

    if (!['present', 'late', 'absent'].includes(status)) {
      return reply.status(400).send({ error: 'status must be present, late, or absent' })
    }

    const { data, error } = await fastify.supabase
      .from('attendance')
      .upsert({ session_id, student_id, status }, { onConflict: 'session_id,student_id' })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return data
  })

  // PUT /api/attendance/bulk — update many at once
  fastify.put<{
    Body: {
      session_id: string
      records: Array<{ student_id: number; status: 'present' | 'late' | 'absent' }>
    }
  }>('/bulk', async (request, reply) => {
    const { session_id, records } = request.body

    if (!session_id || !records?.length) {
      return reply.status(400).send({ error: 'session_id and records are required' })
    }

    const rows = records.map(r => ({ session_id, student_id: r.student_id, status: r.status }))

    const { data, error } = await fastify.supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'session_id,student_id' })
      .select()

    if (error) return reply.status(500).send({ error: error.message })
    return data
  })

  // GET /api/attendance/stats — attendance rates per student
  fastify.get('/stats', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('student_attendance_stats')
      .select('*')

    if (error) return reply.status(500).send({ error: error.message })
    return data
  })
}
