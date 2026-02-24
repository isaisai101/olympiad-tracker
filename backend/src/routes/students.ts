import { FastifyInstance } from 'fastify'

export async function studentsRoutes(fastify: FastifyInstance) {
  // GET /api/students
  fastify.get('/', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('students')
      .select('*, subjects(id, name, color, icon)')
      .order('name')

    if (error) return reply.status(500).send({ error: error.message })
    return data
  })

  // POST /api/students
  fastify.post<{
    Body: {
      name: string
      grade: string
      subject_id: string
      email?: string
    }
  }>('/', async (request, reply) => {
    const { name, grade, subject_id, email } = request.body

    if (!name || !grade || !subject_id) {
      return reply.status(400).send({ error: 'name, grade, and subject_id are required' })
    }

    const { data, error } = await fastify.supabase
      .from('students')
      .insert({ name, grade, subject_id, email })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // PUT /api/students/:id
  fastify.put<{
    Params: { id: string }
    Body: {
      name?: string
      grade?: string
      subject_id?: string
      email?: string
      streak?: number
    }
  }>('/:id', async (request, reply) => {
    const id = parseInt(request.params.id)
    if (isNaN(id)) return reply.status(400).send({ error: 'Invalid ID' })

    const { data, error } = await fastify.supabase
      .from('students')
      .update(request.body)
      .eq('id', id)
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    if (!data) return reply.status(404).send({ error: 'Student not found' })
    return data
  })

  // DELETE /api/students/:id
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const id = parseInt(request.params.id)
    if (isNaN(id)) return reply.status(400).send({ error: 'Invalid ID' })

    const { error } = await fastify.supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(204).send()
  })
}
