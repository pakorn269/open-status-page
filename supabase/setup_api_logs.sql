-- 1. Create api_status_logs Table
CREATE TABLE IF NOT EXISTS public.api_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_operational BOOLEAN NOT NULL,
    response_time_ms INTEGER NOT NULL,
    status_code INTEGER NOT NULL
);

-- Enable RLS for public read access
ALTER TABLE public.api_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to api_status_logs" 
ON public.api_status_logs
FOR SELECT 
TO public
USING (true);

-- Allow service role to insert (Edge Function uses service role, which bypasses RLS, but just to be sure)
-- No explicit policy needed for service_role inserts as it bypasses RLS by default.

-- 2. Create the get_uptime_90_days RPC Function
-- This function aggregates the ping logs by day for the last 90 days.
CREATE OR REPLACE FUNCTION public.get_uptime_90_days()
RETURNS TABLE (
    date DATE,
    status TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH dates AS (
        SELECT (CURRENT_DATE - d) AS check_date
        FROM generate_series(0, 89) AS d
    ),
    daily_stats AS (
        SELECT 
            DATE(created_at) AS log_date,
            COUNT(*) as total_pings,
            SUM(CASE WHEN is_operational = false OR status_code >= 500 THEN 1 ELSE 0 END) as outages,
            SUM(CASE WHEN is_operational = true AND response_time_ms > 2000 THEN 1 ELSE 0 END) as degraded
        FROM public.api_status_logs
        WHERE created_at >= (CURRENT_DATE - INTERVAL '90 days')
        GROUP BY DATE(created_at)
    )
    SELECT 
        d.check_date AS date,
        CASE 
            WHEN s.total_pings IS NULL OR s.total_pings = 0 THEN 'no-data'
            WHEN s.outages > 0 THEN 'outage'
            WHEN s.degraded > (s.total_pings / 2) THEN 'degraded' -- degraded if more than half pings are slow
            ELSE 'operational'
        END AS status
    FROM dates d
    LEFT JOIN daily_stats s ON d.check_date = s.log_date
    ORDER BY d.check_date ASC;
END;
$$;
