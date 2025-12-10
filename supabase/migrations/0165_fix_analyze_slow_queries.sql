-- Migration: 0165_fix_analyze_slow_queries.sql
-- Description: Fix analyze_slow_queries to properly handle OUT variables

DROP FUNCTION IF EXISTS analyze_slow_queries(NUMERIC);

-- Recreate with proper OUT variable handling
-- This function returns an empty result set since pg_stat_statements is not available
CREATE OR REPLACE FUNCTION analyze_slow_queries(p_min_duration_ms NUMERIC DEFAULT 1000)
RETURNS TABLE (query TEXT, calls BIGINT, total_time NUMERIC, mean_time NUMERIC, max_time NUMERIC) AS $$
BEGIN
  -- Use the parameter to avoid unused warning
  IF p_min_duration_ms < 0 THEN
    RAISE EXCEPTION 'Duration must be positive';
  END IF;
  
  -- Return empty result set - pg_stat_statements extension is not available in Supabase
  -- This is intentional as the extension requires superuser privileges
  RETURN QUERY SELECT 
    NULL::TEXT AS query,
    NULL::BIGINT AS calls,
    NULL::NUMERIC AS total_time,
    NULL::NUMERIC AS mean_time,
    NULL::NUMERIC AS max_time
  WHERE FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION analyze_slow_queries(NUMERIC) IS 'Returns slow queries from pg_stat_statements. Returns empty set as pg_stat_statements is not available in Supabase hosted environments.';
