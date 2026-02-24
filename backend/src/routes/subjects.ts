import { FastifyInstance } from 'fastify'

export async function subjectsRoutes(fastify: FastifyInstance) {
  // GET /api/subjects
  fastify.get('/', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (error) return reply.status(500).send({ error: error.message })
    return data
  })

  // POST /api/subjects
  fastify.post<{
    Body: {
      id: string
      name: string
      color: string
      icon: string
      teacher?: string
      schedule?: string
    }
  }>('/', async (request, reply) => {
    const { id, name, color, icon, teacher, schedule } = request.body

    if (!id || !name || !color || !icon) {
      return reply.status(400).send({ error: 'id, name, color, and icon are required' })
    }

    const bg = color + '20' // 12% opacity hex

    const { data, error } = await fastify.supabase
      .from('subjects')
      .insert({ id, name, color, bg, icon, teacher, schedule })
      .select()
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })
}
