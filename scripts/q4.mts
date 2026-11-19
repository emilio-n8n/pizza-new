import { createClient } from '@supabase/supabase-js'
const c = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {auth:{persistSession:false}})
const { data } = await c.from('pv_users').select('email,created_at').order('created_at',{ascending:false}).limit(3)
console.log(JSON.stringify(data))
