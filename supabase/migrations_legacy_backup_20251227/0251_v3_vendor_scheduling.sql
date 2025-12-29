-- V3 Expansion: Vendor Scheduling (VS-001)
-- For COMPVSS production team vendor coordination

-- =====================================================
-- VENDOR SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  vendor_profile_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('load_in', 'load_out', 'setup', 'breakdown', 'service', 'standby')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  location TEXT,
  access_point TEXT,
  access_instructions TEXT,
  
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  
  crew_count INTEGER DEFAULT 1,
  equipment_notes TEXT,
  special_requirements TEXT,
  
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES auth.users(id),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_schedule_times CHECK (end_time > start_time)
);

-- Indexes for vendor_schedules
CREATE INDEX IF NOT EXISTS idx_vendor_schedules_org ON public.vendor_schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_schedules_booking ON public.vendor_schedules(booking_id);
CREATE INDEX IF NOT EXISTS idx_vendor_schedules_vendor ON public.vendor_schedules(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_schedules_times ON public.vendor_schedules(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_vendor_schedules_status ON public.vendor_schedules(status);
CREATE INDEX IF NOT EXISTS idx_vendor_schedules_type ON public.vendor_schedules(schedule_type);

-- =====================================================
-- VENDOR COMMUNICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendor_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  vendor_profile_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.vendor_schedules(id) ON DELETE SET NULL,
  
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'phone', 'in_app', 'portal')),
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  
  subject TEXT,
  message TEXT NOT NULL,
  
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  read_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'failed', 'bounced')),
  
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns to existing vendor_communications table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_communications' AND column_name = 'organization_id') THEN
    ALTER TABLE vendor_communications ADD COLUMN organization_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_communications' AND column_name = 'booking_id') THEN
    ALTER TABLE vendor_communications ADD COLUMN booking_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_communications' AND column_name = 'vendor_profile_id') THEN
    ALTER TABLE vendor_communications ADD COLUMN vendor_profile_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_communications' AND column_name = 'schedule_id') THEN
    ALTER TABLE vendor_communications ADD COLUMN schedule_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_communications' AND column_name = 'sent_at') THEN
    ALTER TABLE vendor_communications ADD COLUMN sent_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- Indexes for vendor_communications
CREATE INDEX IF NOT EXISTS idx_vendor_comms_org ON public.vendor_communications(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_comms_booking ON public.vendor_communications(booking_id);
CREATE INDEX IF NOT EXISTS idx_vendor_comms_vendor ON public.vendor_communications(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_comms_schedule ON public.vendor_communications(schedule_id);
CREATE INDEX IF NOT EXISTS idx_vendor_comms_sent ON public.vendor_communications(sent_at DESC);

-- =====================================================
-- VENDOR SCHEDULE NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendor_schedule_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.vendor_schedules(id) ON DELETE CASCADE,
  
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'confirmation', 'change', 'cancellation')),
  send_at TIMESTAMPTZ NOT NULL,
  
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_schedule_notifs_schedule ON public.vendor_schedule_notifications(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_notifs_send_at ON public.vendor_schedule_notifications(send_at) WHERE status = 'pending';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.vendor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_schedule_notifications ENABLE ROW LEVEL SECURITY;

-- Vendor Schedules policies
DROP POLICY IF EXISTS vendor_schedules_select ON public.vendor_schedules;
CREATE POLICY vendor_schedules_select ON public.vendor_schedules
  FOR SELECT USING (org_matches(organization_id));

DROP POLICY IF EXISTS vendor_schedules_insert ON public.vendor_schedules;
CREATE POLICY vendor_schedules_insert ON public.vendor_schedules
  FOR INSERT WITH CHECK (org_matches(organization_id));

DROP POLICY IF EXISTS vendor_schedules_update ON public.vendor_schedules;
CREATE POLICY vendor_schedules_update ON public.vendor_schedules
  FOR UPDATE USING (org_matches(organization_id));

DROP POLICY IF EXISTS vendor_schedules_delete ON public.vendor_schedules;
CREATE POLICY vendor_schedules_delete ON public.vendor_schedules
  FOR DELETE USING (org_matches(organization_id));

-- Vendor Communications policies
DROP POLICY IF EXISTS vendor_comms_select ON public.vendor_communications;
CREATE POLICY vendor_comms_select ON public.vendor_communications
  FOR SELECT USING (org_matches(organization_id));

DROP POLICY IF EXISTS vendor_comms_insert ON public.vendor_communications;
CREATE POLICY vendor_comms_insert ON public.vendor_communications
  FOR INSERT WITH CHECK (org_matches(organization_id));

-- Schedule Notifications policies
DROP POLICY IF EXISTS schedule_notifs_select ON public.vendor_schedule_notifications;
CREATE POLICY schedule_notifs_select ON public.vendor_schedule_notifications
  FOR SELECT USING (
    schedule_id IN (
      SELECT id FROM public.vendor_schedules WHERE org_matches(organization_id)
    )
  );

DROP POLICY IF EXISTS schedule_notifs_manage ON public.vendor_schedule_notifications;
CREATE POLICY schedule_notifs_manage ON public.vendor_schedule_notifications
  FOR ALL USING (
    schedule_id IN (
      SELECT id FROM public.vendor_schedules WHERE org_matches(organization_id)
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger for vendor_schedules
DROP TRIGGER IF EXISTS vendor_schedules_updated_at ON public.vendor_schedules;
CREATE TRIGGER vendor_schedules_updated_at
  BEFORE UPDATE ON public.vendor_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANTS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_schedules TO authenticated;
GRANT SELECT, INSERT ON public.vendor_communications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_schedule_notifications TO authenticated;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check for schedule conflicts
CREATE OR REPLACE FUNCTION check_vendor_schedule_conflict(
  p_vendor_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.vendor_schedules
    WHERE vendor_profile_id = p_vendor_id
      AND status NOT IN ('cancelled', 'no_show')
      AND (p_exclude_id IS NULL OR id != p_exclude_id)
      AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get vendor schedule summary for a booking
CREATE OR REPLACE FUNCTION get_booking_vendor_schedule_summary(p_booking_id UUID)
RETURNS TABLE (
  vendor_count INTEGER,
  total_schedules INTEGER,
  confirmed_count INTEGER,
  pending_count INTEGER,
  first_load_in TIMESTAMPTZ,
  last_load_out TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT vendor_profile_id)::INTEGER,
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE status = 'confirmed')::INTEGER,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER,
    MIN(start_time) FILTER (WHERE schedule_type = 'load_in'),
    MAX(end_time) FILTER (WHERE schedule_type = 'load_out')
  FROM public.vendor_schedules
  WHERE booking_id = p_booking_id
    AND status NOT IN ('cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.vendor_schedules IS 'Vendor scheduling for load-in/out and service times';
COMMENT ON TABLE public.vendor_communications IS 'Communication log with vendors';
COMMENT ON TABLE public.vendor_schedule_notifications IS 'Automated notification queue for vendor schedules';
