import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
// Prefer classic service_role JWT, or newer sb_secret_ key from Project Settings → API
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Missing Supabase config. Set SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in backend/.env',
  )
  process.exit(1)
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'taskflow-dev-secret',
  supabaseUrl,
  supabaseServiceRoleKey,
}
