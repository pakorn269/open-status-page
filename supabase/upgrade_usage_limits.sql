-- ===================================================================
-- Migration: Add Usage Limits & Telemetry Columns to api_status_logs
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ===================================================================

-- 1. Add Telemetry & Usage Limit columns to api_status_logs
ALTER TABLE public.api_status_logs
ADD COLUMN IF NOT EXISTS remaining_tokens BIGINT,
ADD COLUMN IF NOT EXISTS token_limit BIGINT,
ADD COLUMN IF NOT EXISTS max_parallel_requests INT,
ADD COLUMN IF NOT EXISTS remaining_parallel_requests INT,
ADD COLUMN IF NOT EXISTS key_spend NUMERIC(10, 4),
ADD COLUMN IF NOT EXISTS key_max_budget NUMERIC(10, 4),
ADD COLUMN IF NOT EXISTS error_type TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 2. Create index for fast lookups by endpoint and recency
CREATE INDEX IF NOT EXISTS idx_api_status_logs_endpoint_created_at
ON public.api_status_logs (endpoint, created_at DESC);

-- 3. Update get_uptime_90_days RPC function
-- Ensures HTTP 429 (Rate / Usage Limit Exceeded) is treated as degraded/outage instead of operational
CREATE OR REPLACE FUNCTION public.get_uptime_90_days(target_endpoint TEXT DEFAULT NULL)
RETURNS TABLE (
    date DATE,
    status TEXT,
    uptime_pct NUMERIC
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
            SUM(CASE WHEN is_operational = true AND (status_code >= 200 AND status_code < 300) THEN 1 ELSE 0 END) as operational_pings,
            SUM(CASE WHEN is_operational = false OR status_code >= 500 OR status_code = 0 THEN 1 ELSE 0 END) as outages,
            SUM(CASE WHEN status_code = 429 OR (is_operational = true AND response_time_ms > 3500) THEN 1 ELSE 0 END) as slow_or_throttled_pings
        FROM public.api_status_logs
        WHERE created_at >= (CURRENT_DATE - INTERVAL '90 days')
          AND (
            target_endpoint IS NULL 
            OR endpoint = target_endpoint
            OR (target_endpoint = 'API Gateway (HTTP / Models)' AND endpoint IS NULL)
          )
        GROUP BY DATE(created_at)
    )
    SELECT 
        d.check_date AS date,
        CASE 
            WHEN s.total_pings IS NULL OR s.total_pings = 0 THEN 'no-data'
            WHEN (s.operational_pings::numeric / s.total_pings::numeric) >= 0.98 THEN 'operational'
            WHEN (s.operational_pings::numeric / s.total_pings::numeric) >= 0.80 THEN 'degraded'
            ELSE 'outage'
        END AS status,
        CASE 
            WHEN s.total_pings IS NULL OR s.total_pings = 0 THEN 100.00
            ELSE ROUND(((s.operational_pings::numeric / s.total_pings::numeric) * 100), 2)
        END AS uptime_pct
    FROM dates d
    LEFT JOIN daily_stats s ON d.check_date = s.log_date
    ORDER BY d.check_date ASC;
END;
$$;
