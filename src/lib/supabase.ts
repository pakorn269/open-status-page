import { createClient } from '@supabase/supabase-js';

// These are public-safe values (anon key + Row Level Security).
// They are intentionally hardcoded for static asset deployments
// where build-time environment variables are unavailable.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://ssqvojmcrubohsudmrta.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_Q8WH5D6N6uGwJxzz_732DA_7vjsbZod';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
