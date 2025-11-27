--
-- Advanced Features Tables
-- Search, Export, Batch Operations, Audit Trail
--

-- Search Index Table (Full-text search)
CREATE TABLE IF NOT EXISTS search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  search_text TEXT NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(search_text, '')), 'C')
  ) STORED,
  score FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Saved Searches Table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search History Table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB,
  result_count INTEGER DEFAULT 0,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Export Jobs Table
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('csv', 'excel', 'pdf', 'json')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  config JSONB NOT NULL,
  file_url TEXT,
  record_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Export Templates Table
CREATE TABLE IF NOT EXISTS export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('csv', 'excel', 'pdf', 'json')),
  columns TEXT[] NOT NULL,
  filters JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Batch Operations Table
CREATE TABLE IF NOT EXISTS batch_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_ids TEXT[] NOT NULL,
  parameters JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
  total_count INTEGER NOT NULL,
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Audit Trail Table (Enhanced)
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view', 'export', 'import', 'approve', 'reject')),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom Dashboard Widgets Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  dashboard_id UUID,
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  config JSONB NOT NULL,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 4,
  height INTEGER NOT NULL DEFAULT 3,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_search_index_vector ON search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_index_entity ON search_index(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_search_index_updated ON search_index(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_public ON saved_searches(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_export_jobs_user ON export_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);

CREATE INDEX IF NOT EXISTS idx_export_templates_user ON export_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_export_templates_entity ON export_templates(entity_type);

CREATE INDEX IF NOT EXISTS idx_batch_operations_user ON batch_operations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_operations_status ON batch_operations(status);

CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON audit_trail(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user ON dashboard_widgets(user_id, dashboard_id);

-- RLS Policies
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Search Index Policies
CREATE POLICY "Users can view all search index entries"
  ON search_index FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage search index"
  ON search_index FOR ALL
  USING (auth.role() = 'service_role');

-- Saved Searches Policies
CREATE POLICY "Users can view their own and public saved searches"
  ON saved_searches FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (user_id = auth.uid());

-- Search History Policies
CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own search history"
  ON search_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Export Jobs Policies
CREATE POLICY "Users can view their own export jobs"
  ON export_jobs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own export jobs"
  ON export_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own export jobs"
  ON export_jobs FOR UPDATE
  USING (user_id = auth.uid());

-- Export Templates Policies
CREATE POLICY "Users can view their own and public templates"
  ON export_templates FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own templates"
  ON export_templates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON export_templates FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON export_templates FOR DELETE
  USING (user_id = auth.uid());

-- Batch Operations Policies
CREATE POLICY "Users can view their own batch operations"
  ON batch_operations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own batch operations"
  ON batch_operations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own batch operations"
  ON batch_operations FOR UPDATE
  USING (user_id = auth.uid());

-- Audit Trail Policies
CREATE POLICY "Users can view audit trail for their actions"
  ON audit_trail FOR SELECT
  USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Service role can create audit trail entries"
  ON audit_trail FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR true);

-- Dashboard Widgets Policies
CREATE POLICY "Users can view their own dashboard widgets"
  ON dashboard_widgets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own dashboard widgets"
  ON dashboard_widgets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own dashboard widgets"
  ON dashboard_widgets FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own dashboard widgets"
  ON dashboard_widgets FOR DELETE
  USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION update_search_index_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER search_index_updated
  BEFORE UPDATE ON search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_search_index_timestamp();

-- Function to clean up old search history (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_search_history()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM search_history
  WHERE executed_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit trail (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_audit_trail()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_trail
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE search_index IS 'Full-text search index for universal search across all entities';
COMMENT ON TABLE saved_searches IS 'User-saved search queries with filters for quick access';
COMMENT ON TABLE search_history IS 'History of search queries executed by users';
COMMENT ON TABLE export_jobs IS 'Data export jobs with status tracking and file URLs';
COMMENT ON TABLE export_templates IS 'Reusable export templates with column and filter configurations';
COMMENT ON TABLE batch_operations IS 'Bulk operations on multiple entities with progress tracking';
COMMENT ON TABLE audit_trail IS 'Comprehensive audit log of all system actions';
COMMENT ON TABLE dashboard_widgets IS 'Custom dashboard widgets for personalized user dashboards';
