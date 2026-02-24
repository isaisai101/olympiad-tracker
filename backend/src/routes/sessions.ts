import { FastifyInstance } from 'fastify'

export async function sessionsRoutes(fastify: FastifyInstance) {
  // GET /api/sessions?subject_id=math
  fastify.get<{ Querystring: { subject_id?: string } }>('/', async (request, reply) => {
    let query = fastify.supabase
      .from('sessions')
      .select('*, attendance(student_id, status)')
      .order('date', { ascending: false })

    if (request.query.subject_id) {
      query = query.eq('subject_id', request.query.subject_id)
    }

    const { data, error } = await query
    if (error) return reply.status(500).send({ error: error.message })
    return data
  })

  // POST /api/sessions
  fastify.post<{
    Body: {
      subject_id: string
      date: string
      time?: string
      topic?: string
      note?: string
    }
  }>('/', async (request, reply) => {
    const { subject_id, date, time, topic, note } = request.body

    if (!subject_id || !date) {
      return reply.status(400).send({ error: 'subject_id and date are required' })
    }

    // Generate session ID
    const id = `sess-${subject_id}-${date}-${Date.now()}`

    const { data, error } = await fastify.supabase
      .from('sessions')
      .insert({ id, subject_id, date, time, topic, note, created_by: request.userId })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })

    // Auto-add all students in this subject with no status (they'll be marked during session)
    const { data: students } = await fastify.supabase
      .from('students')
      .select('id')
      .eq('subject_id', subject_id)

    if (students && students.length > 0) {
      await fastify.supabase.from('attendance').insert(
        students.map(s => ({ session_id: id, student_id: s.id, status: 'present' }))
      )
    }

    return reply.status(201).send(data)
  })

  // DELETE /api/sessions/:id
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { error } = await fastify.supabase
      .from('sessions')
      .delete()
      .eq('id', request.params.id)

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(204).send()
  })
}
