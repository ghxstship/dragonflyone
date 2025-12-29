-- Migration: Notify PostgREST to reload schema cache
-- Description: Sends notification to PostgREST to reload schema cache
-- Date: 2025-12-11

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
