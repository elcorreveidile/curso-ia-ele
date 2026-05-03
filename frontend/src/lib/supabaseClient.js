import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Solo crear cliente si las variables están configuradas
// Si no, crear un cliente mock que evita errores
const createMockClient = () => ({
  from: () => ({
    select: () => ({
      data: null,
      error: { message: 'Supabase no está configurado. Configura REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en .env' }
    }),
    insert: () => ({ error: { message: 'Supabase no está configurado' } }),
    update: () => ({ error: { message: 'Supabase no está configurado' } }),
    delete: () => ({ error: { message: 'Supabase no está configurado' } }),
  }),
  functions: {
    invoke: () => ({ error: { message: 'Supabase no está configurado' } })
  }
})

export const supabase = (supabaseUrl && supabaseUrl !== 'https://example-project.supabase.co')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()
