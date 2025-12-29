-- =====================================================
-- COMMUNICATIONS SYSTEM
-- =====================================================
-- Track crew communications for COMPVSS operations
-- Supports radio, phone, email, and SMS communication logging

-- =====================================================
-- COMMUNICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Communication details
  type TEXT NOT NULL CHECK (type IN ('radio', 'phone', 'email', 'sms')),
  from_user_id UUID REFERENCES platform_users(id),
  from_identifier TEXT NOT NULL, -- Name, email, phone number, or radio callsign
  to_user_id UUID REFERENCES platform_users(id),
  to_identifier TEXT NOT NULL, -- Name, email, phone number, or radio callsign
  
  -- Message content
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Priority and status
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'emergency')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  
  -- Context
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_communications_org ON communications(organization_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_priority ON communications(priority);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_from_user ON communications(from_user_id);
CREATE INDEX idx_communications_to_user ON communications(to_user_id);
CREATE INDEX idx_communications_event ON communications(event_id);
CREATE INDEX idx_communications_project ON communications(project_id);
CREATE INDEX idx_communications_timestamp ON communications(timestamp DESC);

-- Composite index for common queries
CREATE INDEX idx_communications_org_timestamp ON communications(organization_id, timestamp DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Users can view communications they sent or received
CREATE POLICY "Users can view their own communications"
  ON communications FOR SELECT
  TO authenticated
  USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = communications.organization_id
    )
  );

-- Users can create communications
CREATE POLICY "Authenticated users can create communications"
  ON communications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = communications.organization_id
    )
  );

-- Users can update their own sent communications
CREATE POLICY "Users can update their own communications"
  ON communications FOR UPDATE
  TO authenticated
  USING (from_user_id = auth.uid());

-- Admins can manage all communications
CREATE POLICY "Admins can manage all communications"
  ON communications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      JOIN user_roles ur ON ur.platform_user_id = pu.id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_communications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_communications_timestamp
  BEFORE INSERT ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_communications_timestamp();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE communications IS 'Crew communication log for radio, phone, email, and SMS';
COMMENT ON COLUMN communications.type IS 'Communication channel: radio, phone, email, sms';
COMMENT ON COLUMN communications.priority IS 'Message priority: normal, urgent, emergency';
COMMENT ON COLUMN communications.status IS 'Delivery status: sent, delivered, read, failed';
