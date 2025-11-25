--
-- Collaboration & Live Status Tables
-- Supports real-time collaborative editing and status indicators
--

-- Document Locks Table
CREATE TABLE IF NOT EXISTS document_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, field_name)
);

-- Status Updates Table  
CREATE TABLE IF NOT EXISTS status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'event', 'task', 'asset', 'crew_member', 'venue', 'order', 'ticket')),
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('idle', 'active', 'in_progress', 'pending', 'completed', 'cancelled', 'failed', 'on_hold', 'delayed', 'at_risk', 'critical')),
  message TEXT,
  metadata JSONB,
  updated_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_locks_expires_at ON document_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_document_locks_user_id ON document_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_document_locks_lookup ON document_locks(document_id, field_name);

CREATE INDEX IF NOT EXISTS idx_status_updates_entity ON status_updates(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_updates_updated_at ON status_updates(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_updates_status ON status_updates(status);

-- RLS Policies
ALTER TABLE document_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;

-- Document locks: users can see all locks
CREATE POLICY "Users can view all document locks"
  ON document_locks FOR SELECT
  USING (true);

-- Document locks: users can create their own locks
CREATE POLICY "Users can create their own locks"
  ON document_locks FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Document locks: users can delete their own locks
CREATE POLICY "Users can delete their own locks"
  ON document_locks FOR DELETE
  USING (user_id = auth.uid());

-- Document locks: users can update their own locks
CREATE POLICY "Users can update their own locks"
  ON document_locks FOR UPDATE
  USING (user_id = auth.uid());

-- Status updates: users can view all status updates
CREATE POLICY "Users can view all status updates"
  ON status_updates FOR SELECT
  USING (true);

-- Status updates: authenticated users can create status updates
CREATE POLICY "Authenticated users can create status updates"
  ON status_updates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Status updates: users can update their own status updates
CREATE POLICY "Users can update their own status updates"
  ON status_updates FOR UPDATE
  USING (updated_by = auth.uid());

-- Function to cleanup expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM document_locks
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-cleanup expired locks (runs hourly)
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  PERFORM cleanup_expired_locks();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE document_locks IS 'Locks for collaborative editing - prevents concurrent field edits';
COMMENT ON TABLE status_updates IS 'Real-time status tracking for entities across the platform';
COMMENT ON FUNCTION cleanup_expired_locks IS 'Removes expired document locks from the system';
