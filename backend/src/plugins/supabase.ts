import fp from 'fastify-plugin'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { FastifyPluginAsync } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient
  }
}

const supabasePlugin: FastifyPluginAsync = async (fastify) => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  }

  const client = createClient(url, key, {
    auth: { persistSession: false },
  })

  fastify.decorate('supabase', client)
}

export default fp(supabasePlugin)
