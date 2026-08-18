-- 2. Upgrade the get_uptime_90_days RPC Function
-- Supports per-endpoint filtering and realistic daily uptime grading.
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
            SUM(CASE WHEN is_operational = true AND (status_code < 500 AND status_code > 0) THEN 1 ELSE 0 END) as operational_pings,
            SUM(CASE WHEN is_operational = false OR status_code >= 500 OR status_code = 0 THEN 1 ELSE 0 END) as outages,
            SUM(CASE WHEN is_operational = true AND response_time_ms > 3500 THEN 1 ELSE 0 END) as slow_pings
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
            -- If severe downtime (< 90% uptime or >= 5 outages), it is a major outage
            WHEN (s.operational_pings::numeric / s.total_pings::numeric) < 0.90 OR s.outages >= 5 THEN 'outage'
            -- If any outages occurred, or >= 5 slow pings (>3.5s), or uptime < 99.9%, it is degraded
            WHEN s.outages > 0 OR s.slow_pings >= 5 OR (s.operational_pings::numeric / s.total_pings::numeric) < 0.999 THEN 'degraded'
            -- Otherwise 100% operational
            ELSE 'operational'
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
