-- 0258_remove_master_calendar.sql
-- Remove Master Calendar System - now redundant with Legend Events
-- Legend Events provides a normalized event entity that serves as the single source of truth

-- ============================================================================
-- DROP TRIGGERS FIRST
-- ============================================================================

DROP TRIGGER IF EXISTS trg_sync_crm_meeting_to_master ON calendar_meetings;
DROP TRIGGER IF EXISTS trg_sync_booking_to_master ON bookings;
DROP TRIGGER IF EXISTS trg_sync_hold_to_master ON space_holds;
DROP TRIGGER IF EXISTS trg_sync_venue_event_to_master ON venue_events;
DROP TRIGGER IF EXISTS trg_sync_crm_task_to_master ON crm_tasks;
DROP TRIGGER IF EXISTS trg_sync_master_to_source ON master_calendar_events;

-- ============================================================================
-- DROP FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS sync_crm_meeting_to_master() CASCADE;
DROP FUNCTION IF EXISTS sync_booking_to_master() CASCADE;
DROP FUNCTION IF EXISTS sync_hold_to_master() CASCADE;
DROP FUNCTION IF EXISTS sync_venue_event_to_master() CASCADE;
DROP FUNCTION IF EXISTS sync_crm_task_to_master() CASCADE;
DROP FUNCTION IF EXISTS sync_master_to_source() CASCADE;
DROP FUNCTION IF EXISTS get_calendar_events_for_range(UUID, TIMESTAMPTZ, TIMESTAMPTZ) CASCADE;
DROP FUNCTION IF EXISTS check_calendar_conflicts(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID) CASCADE;

-- ============================================================================
-- DROP TABLES
-- ============================================================================

DROP TABLE IF EXISTS master_calendar_attendees CASCADE;
DROP TABLE IF EXISTS master_calendar_recurrence CASCADE;
DROP TABLE IF EXISTS master_calendar_reminders CASCADE;
DROP TABLE IF EXISTS master_calendar_events CASCADE;

-- ============================================================================
-- DROP TYPES (only if not used elsewhere)
-- ============================================================================

-- Note: Only drop types if they're not used by other tables
-- Check before dropping to avoid breaking other functionality

DO $$
BEGIN
  -- Check if calendar_source_type is used elsewhere
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE udt_name = 'calendar_source_type' 
    AND table_name != 'master_calendar_events'
  ) THEN
    DROP TYPE IF EXISTS calendar_source_type CASCADE;
  END IF;
  
  -- Check if calendar_event_status is used elsewhere
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE udt_name = 'calendar_event_status' 
    AND table_name != 'master_calendar_events'
  ) THEN
    DROP TYPE IF EXISTS calendar_event_status CASCADE;
  END IF;
  
  -- Check if calendar_visibility is used elsewhere
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE udt_name = 'calendar_visibility' 
    AND table_name != 'master_calendar_events'
  ) THEN
    DROP TYPE IF EXISTS calendar_visibility CASCADE;
  END IF;
END $$;

-- ============================================================================
-- MIGRATION NOTE
-- ============================================================================
-- The Master Calendar system has been replaced by Legend Events.
-- Legend Events (legend_events table) now serves as the single source of truth
-- for all time-based data across ATLVS, COMPVSS, and GVTEWAY.
--
-- Key differences:
-- 1. Legend Events uses a normalized entity model with profile extensions
-- 2. Event-specific data is stored in profile tables (e.g., legend_event_profile_production)
-- 3. Relationships between events and other entities use legend_relationships
-- 4. The Legend schema provides a consistent API across all event types
--
-- To migrate existing calendar data:
-- 1. Create legend_events records from master_calendar_events
-- 2. Create appropriate profile records based on source_type
-- 3. Update foreign key references in related tables
