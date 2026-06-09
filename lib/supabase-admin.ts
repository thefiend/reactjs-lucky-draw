import { createClient } from '@supabase/supabase-js';

// Only use this in server-side code (API routes, Server Components)
// Never import this in client components — it holds the service role key
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
