-- 0256_master_calendar_system.sql
-- Master Calendar System: Unified calendar with real-time two-way sync
-- Single source of truth for ALL time-based data across ATLVS, COMPVSS, GVTEWAY

-- ============================================================================
-- PART 1: CALENDAR EVENT SOURCE TYPES
-- ============================================================================

-- Enum for calendar event source types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_source_type') THEN
    CREATE TYPE calendar_source_type AS ENUM (
      -- CRM Sources
      'crm_meeting',
      'crm_call',
      'crm_task',
      'crm_reminder',
      'crm_deadline',
      -- Venue/Booking Sources
      'venue_booking',
      'venue_hold',
      'venue_block',
      'venue_maintenance',
      -- Production Sources
      'production_event',
      'production_rehearsal',
      'production_soundcheck',
      'production_load_in',
      'production_load_out',
      'production_strike',
      -- Show Sources
      'show_performance',
      'show_set_time',
      'show_cue',
      'run_of_show_entry',
      -- Project Sources
      'project_milestone',
      'project_deadline',
      'contract_deadline',
      'advancing_deadline',
      -- Crew Sources
      'crew_shift',
      'crew_assignment',
      'crew_availability',
      -- External Sources
      'external_google',
      'external_outlook',
      'external_apple',
      'external_ical',
      -- General
      'personal',
      'holiday',
      'other'
    );
  END IF;
END $$;

-- Enum for calendar event status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_event_status') THEN
    CREATE TYPE calendar_event_status AS ENUM (
      'draft',
      'tentative',
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show'
    );
  END IF;
END $$;

-- Enum for calendar event visibility
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calendar_visibility') THEN
    CREATE TYPE calendar_visibility AS ENUM (
      'public',
      'organization',
      'team',
      'private'
    );
  END IF;
END $$;

-- ============================================================================
-- PART 2: MASTER CALENDAR EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS master_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization & User Context
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Core Event Fields (Normalized)
  title TEXT NOT NULL,
  description TEXT,
  
  -- Time Fields (Normalized to TIMESTAMPTZ)
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Setup/Breakdown Times (for production events)
  setup_start TIMESTAMPTZ,
  breakdown_end TIMESTAMPTZ,
  
  -- Source Tracking
  source_type calendar_source_type NOT NULL DEFAULT 'other',
  source_id UUID, -- ID of the source record (booking_id, meeting_id, etc.)
  source_table TEXT, -- Table name for the source record
  external_id TEXT, -- External calendar ID (Google, Outlook, etc.)
  
  -- Status & Visibility
  status calendar_event_status DEFAULT 'scheduled',
  visibility calendar_visibility DEFAULT 'organization',
  
  -- Location Fields
  location TEXT,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  space_id UUID REFERENCES venue_spaces(id) ON DELETE SET NULL,
  is_virtual BOOLEAN DEFAULT false,
  meeting_url TEXT,
  meeting_provider TEXT,
  
  -- Related Entities
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Attendees & Participants
  attendees JSONB DEFAULT '[]', -- Array of {user_id, email, name, response_status}
  guest_count INT,
  
  -- CRM-specific Fields
  linked_contact TEXT,
  linked_deal TEXT,
  
  -- Production-specific Fields
  department TEXT,
  responsible TEXT,
  cue_number TEXT,
  cue_type TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  artist_name TEXT,
  stage TEXT,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format
  recurrence_parent_id UUID REFERENCES master_calendar_events(id) ON DELETE CASCADE,
  recurrence_exception_dates TIMESTAMPTZ[],
  
  -- Reminders
  reminder_minutes INT[],
  
  -- Display
  color TEXT,
  icon TEXT,
  priority TEXT DEFAULT 'medium',
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  
  -- Sync Metadata
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'synced',
  sync_error TEXT,
  sync_version INT DEFAULT 1,
  
  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete for sync purposes
  
  -- Constraints
  CONSTRAINT valid_datetime_range CHECK (end_datetime >= start_datetime),
  CONSTRAINT valid_setup_range CHECK (setup_start IS NULL OR setup_start <= start_datetime),
  CONSTRAINT valid_breakdown_range CHECK (breakdown_end IS NULL OR breakdown_end >= end_datetime)
);

-- Indexes for master_calendar_events
CREATE INDEX IF NOT EXISTS idx_master_calendar_org ON master_calendar_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_master_calendar_dates ON master_calendar_events(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_master_calendar_source ON master_calendar_events(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_master_calendar_status ON master_calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_master_calendar_venue ON master_calendar_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_master_calendar_event ON master_calendar_events(event_id);
CREATE INDEX IF NOT EXISTS idx_master_calendar_project ON master_calendar_events(project_id);
CREATE INDEX IF NOT EXISTS idx_master_calendar_production ON master_calendar_events(production_id);
CREATE INDEX IF NOT EXISTS idx_master_calendar_assigned ON master_calendar_events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_master_calendar_created_by ON master_calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_master_calendar_recurrence ON master_calendar_events(recurrence_parent_id);
CREATE INDEX IF NOT EXISTS idx_master_calendar_external ON master_calendar_events(external_id);
CREATE INDEX IF NOT EXISTS idx_master_calendar_deleted ON master_calendar_events(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- PART 3: CALENDAR EVENT LINKS (Bi-directional Source Linking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_event_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_event_id UUID NOT NULL REFERENCES master_calendar_events(id) ON DELETE CASCADE,
  source_type calendar_source_type NOT NULL,
  source_id UUID NOT NULL,
  source_table TEXT NOT NULL,
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('master_to_source', 'source_to_master', 'bidirectional')),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(master_event_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_links_master ON calendar_event_links(master_event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_links_source ON calendar_event_links(source_type, source_id);

-- ============================================================================
-- PART 4: CALENDAR SYNC LOG (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_event_id UUID REFERENCES master_calendar_events(id) ON DELETE SET NULL,
  source_type calendar_source_type,
  source_id UUID,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'sync')),
  direction TEXT NOT NULL CHECK (direction IN ('master_to_source', 'source_to_master')),
  changes JSONB,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_sync_log_event ON calendar_sync_log(master_event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_log_source ON calendar_sync_log(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_log_created ON calendar_sync_log(created_at);

-- ============================================================================
-- PART 5: RLS POLICIES
-- ============================================================================

ALTER TABLE master_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_log ENABLE ROW LEVEL SECURITY;

-- Master Calendar Events Policies
CREATE POLICY "Users can view calendar events in their organization"
  ON master_calendar_events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
    OR visibility = 'public'
    OR (visibility = 'private' AND created_by = auth.uid())
  );

CREATE POLICY "Users can create calendar events in their organization"
  ON master_calendar_events FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own events or org events with permission"
  ON master_calendar_events FOR UPDATE
  USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR (
      organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
      AND visibility != 'private'
    )
  );

CREATE POLICY "Users can delete their own events"
  ON master_calendar_events FOR DELETE
  USING (
    created_by = auth.uid()
    OR (
      organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.platform_user_id = auth.uid()
        AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN')
      )
    )
  );

-- Calendar Event Links Policies
CREATE POLICY "Users can view links for events they can see"
  ON calendar_event_links FOR SELECT
  USING (
    master_event_id IN (
      SELECT id FROM master_calendar_events
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage links for events they own"
  ON calendar_event_links FOR ALL
  USING (
    master_event_id IN (
      SELECT id FROM master_calendar_events
      WHERE created_by = auth.uid()
      OR organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

-- Calendar Sync Log Policies
CREATE POLICY "Users can view sync logs for their organization"
  ON calendar_sync_log FOR SELECT
  USING (
    master_event_id IN (
      SELECT id FROM master_calendar_events
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert sync logs"
  ON calendar_sync_log FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- PART 6: TRIGGERS FOR REAL-TIME SYNC
-- ============================================================================

-- Function to update master calendar from CRM meetings
CREATE OR REPLACE FUNCTION sync_crm_meeting_to_master()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get organization from user
  SELECT organization_id INTO v_org_id
  FROM platform_users WHERE id = NEW.user_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO master_calendar_events (
      organization_id, created_by, title, description,
      start_datetime, end_datetime, timezone,
      source_type, source_id, source_table,
      status, location, is_virtual, meeting_url, meeting_provider,
      contact_id, deal_id, project_id, notes
    ) VALUES (
      v_org_id, NEW.user_id, NEW.title, NEW.description,
      NEW.start_time, NEW.end_time, COALESCE(NEW.timezone, 'America/New_York'),
      'crm_meeting', NEW.id, 'calendar_meetings',
      CASE NEW.status
        WHEN 'scheduled' THEN 'scheduled'::calendar_event_status
        WHEN 'confirmed' THEN 'confirmed'::calendar_event_status
        WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
        WHEN 'completed' THEN 'completed'::calendar_event_status
        WHEN 'no_show' THEN 'no_show'::calendar_event_status
        ELSE 'scheduled'::calendar_event_status
      END,
      NEW.location, NEW.is_virtual, NEW.meeting_url, NEW.meeting_provider,
      NEW.contact_id, NEW.deal_id, NEW.project_id, NEW.notes
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE master_calendar_events SET
      title = NEW.title,
      description = NEW.description,
      start_datetime = NEW.start_time,
      end_datetime = NEW.end_time,
      status = CASE NEW.status
        WHEN 'scheduled' THEN 'scheduled'::calendar_event_status
        WHEN 'confirmed' THEN 'confirmed'::calendar_event_status
        WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
        WHEN 'completed' THEN 'completed'::calendar_event_status
        WHEN 'no_show' THEN 'no_show'::calendar_event_status
        ELSE 'scheduled'::calendar_event_status
      END,
      location = NEW.location,
      is_virtual = NEW.is_virtual,
      meeting_url = NEW.meeting_url,
      contact_id = NEW.contact_id,
      deal_id = NEW.deal_id,
      notes = NEW.notes,
      updated_at = NOW(),
      sync_version = sync_version + 1
    WHERE source_type = 'crm_meeting' AND source_id = NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE master_calendar_events SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE source_type = 'crm_meeting' AND source_id = OLD.id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update master calendar from venue bookings
CREATE OR REPLACE FUNCTION sync_booking_to_master()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO master_calendar_events (
      organization_id, created_by, title, description,
      start_datetime, end_datetime, all_day,
      setup_start, breakdown_end,
      source_type, source_id, source_table,
      status, venue_id, booking_id, contact_id,
      guest_count, notes, internal_notes
    ) VALUES (
      NEW.organization_id, NEW.created_by,
      COALESCE(NEW.event_name, 'Booking #' || NEW.booking_number),
      NEW.special_requests,
      (NEW.event_date + COALESCE(NEW.start_time, '00:00:00'::TIME))::TIMESTAMPTZ,
      (NEW.event_date + COALESCE(NEW.end_time, '23:59:59'::TIME))::TIMESTAMPTZ,
      NEW.start_time IS NULL,
      CASE WHEN NEW.setup_time IS NOT NULL 
        THEN (NEW.event_date + NEW.setup_time)::TIMESTAMPTZ 
        ELSE NULL 
      END,
      CASE WHEN NEW.breakdown_time IS NOT NULL 
        THEN (NEW.event_date + NEW.breakdown_time)::TIMESTAMPTZ 
        ELSE NULL 
      END,
      'venue_booking', NEW.id, 'bookings',
      CASE NEW.status::TEXT
        WHEN 'draft' THEN 'draft'::calendar_event_status
        WHEN 'pending' THEN 'tentative'::calendar_event_status
        WHEN 'confirmed' THEN 'confirmed'::calendar_event_status
        WHEN 'in_progress' THEN 'in_progress'::calendar_event_status
        WHEN 'completed' THEN 'completed'::calendar_event_status
        WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
        ELSE 'scheduled'::calendar_event_status
      END,
      NEW.venue_id, NEW.id, NEW.contact_id,
      COALESCE(NEW.guest_count_expected, NEW.guest_count_guaranteed),
      NEW.special_requests, NEW.internal_notes
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE master_calendar_events SET
      title = COALESCE(NEW.event_name, 'Booking #' || NEW.booking_number),
      description = NEW.special_requests,
      start_datetime = (NEW.event_date + COALESCE(NEW.start_time, '00:00:00'::TIME))::TIMESTAMPTZ,
      end_datetime = (NEW.event_date + COALESCE(NEW.end_time, '23:59:59'::TIME))::TIMESTAMPTZ,
      setup_start = CASE WHEN NEW.setup_time IS NOT NULL 
        THEN (NEW.event_date + NEW.setup_time)::TIMESTAMPTZ 
        ELSE NULL 
      END,
      breakdown_end = CASE WHEN NEW.breakdown_time IS NOT NULL 
        THEN (NEW.event_date + NEW.breakdown_time)::TIMESTAMPTZ 
        ELSE NULL 
      END,
      status = CASE NEW.status::TEXT
        WHEN 'draft' THEN 'draft'::calendar_event_status
        WHEN 'pending' THEN 'tentative'::calendar_event_status
        WHEN 'confirmed' THEN 'confirmed'::calendar_event_status
        WHEN 'in_progress' THEN 'in_progress'::calendar_event_status
        WHEN 'completed' THEN 'completed'::calendar_event_status
        WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
        ELSE 'scheduled'::calendar_event_status
      END,
      venue_id = NEW.venue_id,
      contact_id = NEW.contact_id,
      guest_count = COALESCE(NEW.guest_count_expected, NEW.guest_count_guaranteed),
      notes = NEW.special_requests,
      internal_notes = NEW.internal_notes,
      updated_at = NOW(),
      sync_version = sync_version + 1
    WHERE source_type = 'venue_booking' AND source_id = NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE master_calendar_events SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE source_type = 'venue_booking' AND source_id = OLD.id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update master calendar from venue holds
CREATE OR REPLACE FUNCTION sync_hold_to_master()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO master_calendar_events (
      organization_id, created_by, title,
      start_datetime, end_datetime, all_day,
      source_type, source_id, source_table,
      status, space_id, contact_id, notes
    ) VALUES (
      NEW.organization_id, NEW.created_by,
      'Hold: ' || COALESCE(NEW.notes, 'Space Hold'),
      (NEW.hold_date + COALESCE(NEW.start_time, '00:00:00'::TIME))::TIMESTAMPTZ,
      (NEW.hold_date + COALESCE(NEW.end_time, '23:59:59'::TIME))::TIMESTAMPTZ,
      NEW.start_time IS NULL,
      'venue_hold', NEW.id, 'space_holds',
      CASE NEW.status::TEXT
        WHEN 'active' THEN 'tentative'::calendar_event_status
        WHEN 'expired' THEN 'cancelled'::calendar_event_status
        WHEN 'released' THEN 'cancelled'::calendar_event_status
        WHEN 'converted' THEN 'confirmed'::calendar_event_status
        ELSE 'tentative'::calendar_event_status
      END,
      NEW.space_id, NEW.contact_id, NEW.notes
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE master_calendar_events SET
      title = 'Hold: ' || COALESCE(NEW.notes, 'Space Hold'),
      start_datetime = (NEW.hold_date + COALESCE(NEW.start_time, '00:00:00'::TIME))::TIMESTAMPTZ,
      end_datetime = (NEW.hold_date + COALESCE(NEW.end_time, '23:59:59'::TIME))::TIMESTAMPTZ,
      status = CASE NEW.status::TEXT
        WHEN 'active' THEN 'tentative'::calendar_event_status
        WHEN 'expired' THEN 'cancelled'::calendar_event_status
        WHEN 'released' THEN 'cancelled'::calendar_event_status
        WHEN 'converted' THEN 'confirmed'::calendar_event_status
        ELSE 'tentative'::calendar_event_status
      END,
      space_id = NEW.space_id,
      contact_id = NEW.contact_id,
      notes = NEW.notes,
      updated_at = NOW(),
      sync_version = sync_version + 1
    WHERE source_type = 'venue_hold' AND source_id = NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE master_calendar_events SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE source_type = 'venue_hold' AND source_id = OLD.id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update master calendar from venue events
CREATE OR REPLACE FUNCTION sync_venue_event_to_master()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO master_calendar_events (
      organization_id, created_by, title,
      start_datetime, end_datetime, all_day,
      setup_start, breakdown_end,
      source_type, source_id, source_table,
      status, venue_id, space_id, booking_id,
      contact_id, notes, internal_notes, color
    ) VALUES (
      NEW.organization_id, NEW.created_by, NEW.name,
      NEW.start_datetime, NEW.end_datetime, NEW.all_day,
      NEW.setup_start, NEW.breakdown_end,
      'production_event', NEW.id, 'venue_events',
      CASE NEW.status
        WHEN 'tentative' THEN 'tentative'::calendar_event_status
        WHEN 'confirmed' THEN 'confirmed'::calendar_event_status
        WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
        ELSE 'scheduled'::calendar_event_status
      END,
      NEW.venue_id, NEW.space_id, NEW.booking_id,
      NEW.contact_id, NEW.notes, NEW.internal_notes, NEW.color
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE master_calendar_events SET
      title = NEW.name,
      start_datetime = NEW.start_datetime,
      end_datetime = NEW.end_datetime,
      all_day = NEW.all_day,
      setup_start = NEW.setup_start,
      breakdown_end = NEW.breakdown_end,
      status = CASE NEW.status
        WHEN 'tentative' THEN 'tentative'::calendar_event_status
        WHEN 'confirmed' THEN 'confirmed'::calendar_event_status
        WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
        ELSE 'scheduled'::calendar_event_status
      END,
      venue_id = NEW.venue_id,
      space_id = NEW.space_id,
      booking_id = NEW.booking_id,
      contact_id = NEW.contact_id,
      notes = NEW.notes,
      internal_notes = NEW.internal_notes,
      color = NEW.color,
      updated_at = NOW(),
      sync_version = sync_version + 1
    WHERE source_type = 'production_event' AND source_id = NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE master_calendar_events SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE source_type = 'production_event' AND source_id = OLD.id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update master calendar from CRM tasks
CREATE OR REPLACE FUNCTION sync_crm_task_to_master()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get organization from user
  SELECT organization_id INTO v_org_id
  FROM platform_users WHERE id = NEW.user_id;

  IF TG_OP = 'INSERT' AND NEW.due_date IS NOT NULL THEN
    INSERT INTO master_calendar_events (
      organization_id, created_by, assigned_to, title, description,
      start_datetime, end_datetime, all_day,
      source_type, source_id, source_table,
      status, contact_id, deal_id, project_id, priority
    ) VALUES (
      v_org_id, NEW.user_id, NEW.assigned_to, NEW.title, NEW.description,
      NEW.due_date, NEW.due_date + INTERVAL '1 hour', true,
      CASE NEW.task_type
        WHEN 'call' THEN 'crm_call'::calendar_source_type
        WHEN 'meeting' THEN 'crm_meeting'::calendar_source_type
        WHEN 'deadline' THEN 'crm_deadline'::calendar_source_type
        ELSE 'crm_task'::calendar_source_type
      END,
      NEW.id, 'crm_tasks',
      CASE NEW.status
        WHEN 'pending' THEN 'scheduled'::calendar_event_status
        WHEN 'in_progress' THEN 'in_progress'::calendar_event_status
        WHEN 'completed' THEN 'completed'::calendar_event_status
        WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
        WHEN 'deferred' THEN 'tentative'::calendar_event_status
        ELSE 'scheduled'::calendar_event_status
      END,
      NEW.contact_id, NEW.deal_id, NEW.project_id, NEW.priority
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.due_date IS NOT NULL THEN
    -- Check if master event exists
    IF EXISTS (SELECT 1 FROM master_calendar_events WHERE source_id = NEW.id AND source_type IN ('crm_task', 'crm_call', 'crm_meeting', 'crm_deadline')) THEN
      UPDATE master_calendar_events SET
        title = NEW.title,
        description = NEW.description,
        assigned_to = NEW.assigned_to,
        start_datetime = NEW.due_date,
        end_datetime = NEW.due_date + INTERVAL '1 hour',
        status = CASE NEW.status
          WHEN 'pending' THEN 'scheduled'::calendar_event_status
          WHEN 'in_progress' THEN 'in_progress'::calendar_event_status
          WHEN 'completed' THEN 'completed'::calendar_event_status
          WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
          WHEN 'deferred' THEN 'tentative'::calendar_event_status
          ELSE 'scheduled'::calendar_event_status
        END,
        contact_id = NEW.contact_id,
        deal_id = NEW.deal_id,
        project_id = NEW.project_id,
        priority = NEW.priority,
        updated_at = NOW(),
        sync_version = sync_version + 1
      WHERE source_id = NEW.id AND source_type IN ('crm_task', 'crm_call', 'crm_meeting', 'crm_deadline');
    ELSE
      -- Create if doesn't exist
      INSERT INTO master_calendar_events (
        organization_id, created_by, assigned_to, title, description,
        start_datetime, end_datetime, all_day,
        source_type, source_id, source_table,
        status, contact_id, deal_id, project_id, priority
      ) VALUES (
        v_org_id, NEW.user_id, NEW.assigned_to, NEW.title, NEW.description,
        NEW.due_date, NEW.due_date + INTERVAL '1 hour', true,
        CASE NEW.task_type
          WHEN 'call' THEN 'crm_call'::calendar_source_type
          WHEN 'meeting' THEN 'crm_meeting'::calendar_source_type
          WHEN 'deadline' THEN 'crm_deadline'::calendar_source_type
          ELSE 'crm_task'::calendar_source_type
        END,
        NEW.id, 'crm_tasks',
        CASE NEW.status
          WHEN 'pending' THEN 'scheduled'::calendar_event_status
          WHEN 'in_progress' THEN 'in_progress'::calendar_event_status
          WHEN 'completed' THEN 'completed'::calendar_event_status
          WHEN 'cancelled' THEN 'cancelled'::calendar_event_status
          WHEN 'deferred' THEN 'tentative'::calendar_event_status
          ELSE 'scheduled'::calendar_event_status
        END,
        NEW.contact_id, NEW.deal_id, NEW.project_id, NEW.priority
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE master_calendar_events SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE source_id = OLD.id AND source_type IN ('crm_task', 'crm_call', 'crm_meeting', 'crm_deadline');
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers (only if tables exist)
DO $$
BEGIN
  -- Trigger for calendar_meetings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_meetings') THEN
    DROP TRIGGER IF EXISTS trg_sync_crm_meeting_to_master ON calendar_meetings;
    CREATE TRIGGER trg_sync_crm_meeting_to_master
      AFTER INSERT OR UPDATE OR DELETE ON calendar_meetings
      FOR EACH ROW EXECUTE FUNCTION sync_crm_meeting_to_master();
  END IF;

  -- Trigger for bookings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    DROP TRIGGER IF EXISTS trg_sync_booking_to_master ON bookings;
    CREATE TRIGGER trg_sync_booking_to_master
      AFTER INSERT OR UPDATE OR DELETE ON bookings
      FOR EACH ROW EXECUTE FUNCTION sync_booking_to_master();
  END IF;

  -- Trigger for space_holds
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'space_holds') THEN
    DROP TRIGGER IF EXISTS trg_sync_hold_to_master ON space_holds;
    CREATE TRIGGER trg_sync_hold_to_master
      AFTER INSERT OR UPDATE OR DELETE ON space_holds
      FOR EACH ROW EXECUTE FUNCTION sync_hold_to_master();
  END IF;

  -- Trigger for venue_events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venue_events') THEN
    DROP TRIGGER IF EXISTS trg_sync_venue_event_to_master ON venue_events;
    CREATE TRIGGER trg_sync_venue_event_to_master
      AFTER INSERT OR UPDATE OR DELETE ON venue_events
      FOR EACH ROW EXECUTE FUNCTION sync_venue_event_to_master();
  END IF;

  -- Trigger for crm_tasks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crm_tasks') THEN
    DROP TRIGGER IF EXISTS trg_sync_crm_task_to_master ON crm_tasks;
    CREATE TRIGGER trg_sync_crm_task_to_master
      AFTER INSERT OR UPDATE OR DELETE ON crm_tasks
      FOR EACH ROW EXECUTE FUNCTION sync_crm_task_to_master();
  END IF;
END $$;

-- ============================================================================
-- PART 7: REVERSE SYNC TRIGGER (Master to Source)
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_master_to_source()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only sync if this is a direct update to master (not from source trigger)
  IF NEW.sync_status = 'pending_sync' THEN
    RETURN NEW;
  END IF;

  -- Log the sync operation
  INSERT INTO calendar_sync_log (
    master_event_id, source_type, source_id, action, direction, changes, performed_by
  ) VALUES (
    NEW.id, NEW.source_type, NEW.source_id, 
    CASE WHEN TG_OP = 'INSERT' THEN 'create' WHEN TG_OP = 'UPDATE' THEN 'update' ELSE 'delete' END,
    'master_to_source',
    jsonb_build_object(
      'title', NEW.title,
      'start_datetime', NEW.start_datetime,
      'end_datetime', NEW.end_datetime,
      'status', NEW.status
    ),
    NEW.created_by
  );

  -- Update source tables based on source_type
  CASE NEW.source_type
    WHEN 'crm_meeting' THEN
      UPDATE calendar_meetings SET
        title = NEW.title,
        description = NEW.description,
        start_time = NEW.start_datetime,
        end_time = NEW.end_datetime,
        location = NEW.location,
        status = CASE NEW.status
          WHEN 'scheduled' THEN 'scheduled'
          WHEN 'confirmed' THEN 'confirmed'
          WHEN 'cancelled' THEN 'cancelled'
          WHEN 'completed' THEN 'completed'
          WHEN 'no_show' THEN 'no_show'
          ELSE 'scheduled'
        END,
        updated_at = NOW()
      WHERE id = NEW.source_id;
      
    WHEN 'venue_booking' THEN
      UPDATE bookings SET
        event_name = NEW.title,
        special_requests = NEW.notes,
        event_date = NEW.start_datetime::DATE,
        start_time = NEW.start_datetime::TIME,
        end_time = NEW.end_datetime::TIME,
        updated_at = NOW()
      WHERE id = NEW.source_id;
      
    WHEN 'venue_hold' THEN
      UPDATE space_holds SET
        notes = REPLACE(NEW.title, 'Hold: ', ''),
        hold_date = NEW.start_datetime::DATE,
        start_time = NEW.start_datetime::TIME,
        end_time = NEW.end_datetime::TIME,
        updated_at = NOW()
      WHERE id = NEW.source_id;
      
    WHEN 'production_event' THEN
      UPDATE venue_events SET
        name = NEW.title,
        start_datetime = NEW.start_datetime,
        end_datetime = NEW.end_datetime,
        setup_start = NEW.setup_start,
        breakdown_end = NEW.breakdown_end,
        notes = NEW.notes,
        internal_notes = NEW.internal_notes,
        color = NEW.color,
        updated_at = NOW()
      WHERE id = NEW.source_id;
      
    ELSE
      -- No reverse sync for other types
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;

-- Create reverse sync trigger
DROP TRIGGER IF EXISTS trg_sync_master_to_source ON master_calendar_events;
CREATE TRIGGER trg_sync_master_to_source
  AFTER UPDATE ON master_calendar_events
  FOR EACH ROW
  WHEN (OLD.sync_version = NEW.sync_version) -- Only when not triggered by source sync
  EXECUTE FUNCTION sync_master_to_source();

-- ============================================================================
-- PART 8: HELPER FUNCTIONS
-- ============================================================================

-- Function to get all calendar events for a date range
CREATE OR REPLACE FUNCTION get_master_calendar_events(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_source_types calendar_source_type[] DEFAULT NULL,
  p_venue_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_production_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  all_day BOOLEAN,
  source_type calendar_source_type,
  source_id UUID,
  status calendar_event_status,
  venue_id UUID,
  venue_name TEXT,
  space_id UUID,
  space_name TEXT,
  color TEXT,
  attendees JSONB,
  created_by UUID,
  assigned_to UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mce.id,
    mce.title,
    mce.description,
    mce.start_datetime,
    mce.end_datetime,
    mce.all_day,
    mce.source_type,
    mce.source_id,
    mce.status,
    mce.venue_id,
    v.name AS venue_name,
    mce.space_id,
    vs.name AS space_name,
    mce.color,
    mce.attendees,
    mce.created_by,
    mce.assigned_to
  FROM master_calendar_events mce
  LEFT JOIN venues v ON mce.venue_id = v.id
  LEFT JOIN venue_spaces vs ON mce.space_id = vs.id
  WHERE mce.organization_id = p_organization_id
    AND mce.deleted_at IS NULL
    AND mce.start_datetime < p_end_date
    AND mce.end_datetime > p_start_date
    AND (p_source_types IS NULL OR mce.source_type = ANY(p_source_types))
    AND (p_venue_id IS NULL OR mce.venue_id = p_venue_id)
    AND (p_project_id IS NULL OR mce.project_id = p_project_id)
    AND (p_production_id IS NULL OR mce.production_id = p_production_id)
  ORDER BY mce.start_datetime;
END;
$$;

-- Function to check for calendar conflicts
CREATE OR REPLACE FUNCTION check_calendar_conflicts(
  p_organization_id UUID,
  p_start_datetime TIMESTAMPTZ,
  p_end_datetime TIMESTAMPTZ,
  p_venue_id UUID DEFAULT NULL,
  p_space_id UUID DEFAULT NULL,
  p_exclude_event_id UUID DEFAULT NULL
)
RETURNS TABLE (
  conflicting_event_id UUID,
  conflicting_title TEXT,
  conflicting_start TIMESTAMPTZ,
  conflicting_end TIMESTAMPTZ,
  conflict_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mce.id,
    mce.title,
    mce.start_datetime,
    mce.end_datetime,
    CASE 
      WHEN mce.start_datetime <= p_start_datetime AND mce.end_datetime >= p_end_datetime THEN 'contains'
      WHEN mce.start_datetime >= p_start_datetime AND mce.end_datetime <= p_end_datetime THEN 'contained'
      WHEN mce.start_datetime < p_start_datetime AND mce.end_datetime > p_start_datetime THEN 'overlaps_start'
      WHEN mce.start_datetime < p_end_datetime AND mce.end_datetime > p_end_datetime THEN 'overlaps_end'
      ELSE 'unknown'
    END AS conflict_type
  FROM master_calendar_events mce
  WHERE mce.organization_id = p_organization_id
    AND mce.deleted_at IS NULL
    AND mce.status NOT IN ('cancelled', 'draft')
    AND (p_exclude_event_id IS NULL OR mce.id != p_exclude_event_id)
    AND (p_venue_id IS NULL OR mce.venue_id = p_venue_id)
    AND (p_space_id IS NULL OR mce.space_id = p_space_id)
    AND mce.start_datetime < p_end_datetime
    AND mce.end_datetime > p_start_datetime;
END;
$$;

-- Enable realtime for master calendar
ALTER PUBLICATION supabase_realtime ADD TABLE master_calendar_events;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON master_calendar_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON calendar_event_links TO authenticated;
GRANT SELECT, INSERT ON calendar_sync_log TO authenticated;
GRANT EXECUTE ON FUNCTION get_master_calendar_events TO authenticated;
GRANT EXECUTE ON FUNCTION check_calendar_conflicts TO authenticated;
