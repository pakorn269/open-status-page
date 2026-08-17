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
            -- If uptime is 98%+ (normal minor transient retry), it is operational
            WHEN (s.operational_pings::numeric / s.total_pings::numeric) >= 0.98 THEN 'operational'
            -- If uptime is between 80% and 98%, or heavily degraded, it's degraded performance
            WHEN (s.operational_pings::numeric / s.total_pings::numeric) >= 0.80 THEN 'degraded'
            -- If severe downtime (< 80% uptime), it is a major outage
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
