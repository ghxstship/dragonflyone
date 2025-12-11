-- Migration: Create schema reload function
-- Description: Creates a function to trigger PostgREST schema cache reload
-- Date: 2025-12-11

-- Create a function that can be called via RPC to reload the schema
CREATE OR REPLACE FUNCTION reload_pgrst_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- Grant execute to authenticated and service_role
GRANT EXECUTE ON FUNCTION reload_pgrst_schema() TO authenticated;
GRANT EXECUTE ON FUNCTION reload_pgrst_schema() TO service_role;

-- Call it immediately
SELECT reload_pgrst_schema();
