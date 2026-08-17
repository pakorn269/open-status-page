-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    impact TEXT NOT NULL CHECK (impact IN ('none', 'minor', 'major', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Set up Row Level Security (RLS) so the frontend can read incidents
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to incidents" 
ON public.incidents
FOR SELECT 
TO public
USING (true);

-- 3. Seed Sample Incident Data
INSERT INTO public.incidents (name, message, impact, created_at)
VALUES 
    (
        'Elevated error rate across multiple services', 
        'This incident has been resolved.', 
        'critical', 
        NOW() - INTERVAL '45 days'
    ),
    (
        'Partial outage of dashboard', 
        'This incident has been resolved.', 
        'major', 
        NOW() - INTERVAL '28 days'
    ),
    (
        'Authentication SSO sign-in failures', 
        'This incident has been resolved.', 
        'major', 
        NOW() - INTERVAL '26 days'
    ),
    (
        'Elevated errors across APIs', 
        'This issue has been resolved.', 
        'major', 
        NOW() - INTERVAL '7 days'
    ),
    (
        'Degraded performance for gateway.9arm.co', 
        'This incident has been resolved.', 
        'minor', 
        NOW() - INTERVAL '6 days'
    );

-- 4. Schedule the Health-Check Edge Function
-- This will use pg_cron and pg_net to POST to your edge function every 5 minutes.
-- IMPORTANT: Replace YOUR_PROJECT_REF with your Supabase project reference ID before running.
SELECT cron.schedule(
    'invoke-health-check-every-5-mins',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/health-check'
    );
    $$
);
