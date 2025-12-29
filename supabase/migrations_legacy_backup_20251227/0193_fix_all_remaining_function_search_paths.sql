-- Migration: Fix All Remaining Function Search Paths
-- Description: Sets search_path on all remaining functions with SECURITY DEFINER
-- Date: 2025-12-11

-- This migration uses ALTER FUNCTION to set search_path on functions that were
-- missed by previous migrations (0181, 0185, 0190, 0191)

DO $$
DECLARE
  func_record RECORD;
  func_count INTEGER := 0;
BEGIN
  -- Loop through all functions with SECURITY DEFINER that don't have search_path set
  FOR func_record IN
    SELECT 
      n.nspname AS schema_name,
      p.proname AS func_name,
      pg_get_function_identity_arguments(p.oid) AS func_args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true  -- SECURITY DEFINER
      AND (p.proconfig IS NULL OR NOT ('search_path=public' = ANY(p.proconfig)))
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public',
        func_record.schema_name,
        func_record.func_name,
        func_record.func_args
      );
      func_count := func_count + 1;
      RAISE NOTICE 'Fixed: %.%(%)', func_record.schema_name, func_record.func_name, func_record.func_args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not fix %.%: %', func_record.schema_name, func_record.func_name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Total functions fixed: %', func_count;
END $$;

-- Also fix any functions in analytics schema
DO $$
DECLARE
  func_record RECORD;
  func_count INTEGER := 0;
BEGIN
  FOR func_record IN
    SELECT 
      n.nspname AS schema_name,
      p.proname AS func_name,
      pg_get_function_identity_arguments(p.oid) AS func_args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'analytics'
      AND p.prosecdef = true
      AND (p.proconfig IS NULL OR NOT ('search_path=analytics, public' = ANY(p.proconfig)))
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = analytics, public',
        func_record.schema_name,
        func_record.func_name,
        func_record.func_args
      );
      func_count := func_count + 1;
      RAISE NOTICE 'Fixed analytics: %.%(%)', func_record.schema_name, func_record.func_name, func_record.func_args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not fix analytics %.%: %', func_record.schema_name, func_record.func_name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Total analytics functions fixed: %', func_count;
END $$;

-- Verify the final count
DO $$
DECLARE
  remaining_count INTEGER;
  total_fixed INTEGER;
BEGIN
  -- Count remaining functions without search_path
  SELECT COUNT(*) INTO remaining_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname IN ('public', 'analytics')
    AND p.prosecdef = true
    AND (p.proconfig IS NULL OR NOT (
      'search_path=public' = ANY(p.proconfig) OR
      'search_path=analytics, public' = ANY(p.proconfig)
    ));
  
  -- Count total functions with search_path
  SELECT COUNT(*) INTO total_fixed
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname IN ('public', 'analytics')
    AND p.proconfig IS NOT NULL
    AND (
      'search_path=public' = ANY(p.proconfig) OR
      'search_path=analytics, public' = ANY(p.proconfig)
    );
  
  RAISE NOTICE 'Remaining functions without search_path: %', remaining_count;
  RAISE NOTICE 'Total functions with search_path: %', total_fixed;
  
  IF remaining_count > 0 THEN
    RAISE WARNING 'There are still % functions without search_path set!', remaining_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All SECURITY DEFINER functions now have search_path set!';
  END IF;
END $$;
