import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
    userRole: string
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('userId', '')
  fastify.decorateRequest('userRole', '')

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for health check
    if (request.url === '/health') return

    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return reply.status(401).send({ error: 'No token provided' })
    }

    // Verify token using Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return reply.status(401).send({ error: 'Invalid or expired token' })
    }

    request.userId = data.user.id
    request.userRole = data.user.user_metadata?.role ?? 'teacher'
  })
}

export default fp(authPlugin)
