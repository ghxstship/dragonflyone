-- Migration: Cross-Platform Sync System
-- Description: Tables for ATLVS ↔ COMPVSS ↔ GVTEWAY synchronization

-- Cross-platform links
CREATE TABLE IF NOT EXISTS cross_platform_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_type TEXT NOT NULL CHECK (link_type IN ('atlvs_compvss', 'atlvs_gvteway', 'compvss_gvteway')),
  atlvs_project_id UUID REFERENCES projects(id),
  compvss_project_id UUID REFERENCES compvss_projects(id),
  gvteway_event_id UUID REFERENCES events(id),
  sync_enabled BOOLEAN DEFAULT true,
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('atlvs_to_compvss', 'compvss_to_atlvs', 'atlvs_to_gvteway', 'gvteway_to_atlvs', 'compvss_to_gvteway', 'gvteway_to_compvss', 'bidirectional')),
  sync_schedule TEXT,
  last_synced_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cross_platform_links_type ON cross_platform_links(link_type);
CREATE INDEX IF NOT EXISTS idx_cross_platform_links_atlvs ON cross_platform_links(atlvs_project_id);
CREATE INDEX IF NOT EXISTS idx_cross_platform_links_compvss ON cross_platform_links(compvss_project_id);
CREATE INDEX IF NOT EXISTS idx_cross_platform_links_gvteway ON cross_platform_links(gvteway_event_id);

-- Cross-platform sync logs
CREATE TABLE IF NOT EXISTS cross_platform_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES cross_platform_links(id),
  link_type TEXT NOT NULL,
  atlvs_project_id UUID,
  compvss_project_id UUID,
  gvteway_event_id UUID,
  sync_direction TEXT NOT NULL,
  fields_synced TEXT[],
  sync_results JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  synced_by UUID REFERENCES platform_users(id),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cross_platform_sync_logs_link ON cross_platform_sync_logs(link_id);
CREATE INDEX IF NOT EXISTS idx_cross_platform_sync_logs_type ON cross_platform_sync_logs(link_type);
CREATE INDEX IF NOT EXISTS idx_cross_platform_sync_logs_synced ON cross_platform_sync_logs(synced_at);

-- Project revenue (for ATLVS financial tracking)
CREATE TABLE IF NOT EXISTS project_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  source TEXT NOT NULL,
  source_event_id UUID,
  gross_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  refunds NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  transaction_count INT DEFAULT 0,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, source_event_id)
);

CREATE INDEX IF NOT EXISTS idx_project_revenue_project ON project_revenue(project_id);
CREATE INDEX IF NOT EXISTS idx_project_revenue_source ON project_revenue(source);

-- Financial reports
CREATE TABLE IF NOT EXISTS financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('project_summary', 'monthly', 'quarterly', 'annual', 'custom')),
  period_start DATE,
  period_end DATE,
  total_revenue NUMERIC(14,2) DEFAULT 0,
  total_expenses NUMERIC(14,2) DEFAULT 0,
  net_profit NUMERIC(14,2) DEFAULT 0,
  profit_margin NUMERIC(8,4) DEFAULT 0,
  budget NUMERIC(14,2) DEFAULT 0,
  budget_variance NUMERIC(14,2) DEFAULT 0,
  report_data JSONB,
  generated_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_reports_project ON financial_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_reports_type ON financial_reports(report_type);

-- Event staff (for GVTEWAY)
CREATE TABLE IF NOT EXISTS event_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT NOT NULL,
  department TEXT,
  check_in_time TIME,
  check_out_time TIME,
  actual_check_in TIMESTAMPTZ,
  actual_check_out TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_staff_event ON event_staff(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_user ON event_staff(user_id);

-- COMPVSS projects extended fields
ALTER TABLE compvss_projects ADD COLUMN IF NOT EXISTS expected_attendance INT;
ALTER TABLE compvss_projects ADD COLUMN IF NOT EXISTS attendance_percentage NUMERIC(8,4);
ALTER TABLE compvss_projects ADD COLUMN IF NOT EXISTS ticket_data_synced_at TIMESTAMPTZ;
ALTER TABLE compvss_projects ADD COLUMN IF NOT EXISTS venue_id UUID;

-- Function to get cross-platform summary
CREATE OR REPLACE FUNCTION get_cross_platform_summary(p_project_id UUID)
RETURNS TABLE (
  platform TEXT,
  linked_id UUID,
  link_type TEXT,
  last_synced TIMESTAMPTZ,
  sync_status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN cpl.compvss_project_id IS NOT NULL AND cpl.atlvs_project_id = p_project_id THEN 'compvss'
      WHEN cpl.gvteway_event_id IS NOT NULL AND cpl.atlvs_project_id = p_project_id THEN 'gvteway'
      WHEN cpl.atlvs_project_id IS NOT NULL AND cpl.compvss_project_id = p_project_id THEN 'atlvs'
      WHEN cpl.gvteway_event_id IS NOT NULL AND cpl.compvss_project_id = p_project_id THEN 'gvteway'
      ELSE 'unknown'
    END as platform,
    COALESCE(cpl.compvss_project_id, cpl.gvteway_event_id, cpl.atlvs_project_id) as linked_id,
    cpl.link_type,
    cpl.last_synced_at as last_synced,
    CASE 
      WHEN cpl.last_synced_at > NOW() - INTERVAL '1 hour' THEN 'recent'
      WHEN cpl.last_synced_at > NOW() - INTERVAL '24 hours' THEN 'stale'
      ELSE 'outdated'
    END as sync_status
  FROM cross_platform_links cpl
  WHERE cpl.atlvs_project_id = p_project_id
     OR cpl.compvss_project_id = p_project_id;
END;
$$;

-- Function to auto-sync on project update
CREATE OR REPLACE FUNCTION trigger_cross_platform_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark linked projects as needing sync
  UPDATE cross_platform_links
  SET last_synced_at = NULL
  WHERE (atlvs_project_id = NEW.id OR compvss_project_id = NEW.id)
    AND sync_enabled = TRUE;
  
  RETURN NEW;
END;
$$;

-- RLS policies
ALTER TABLE cross_platform_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON cross_platform_links TO authenticated;
GRANT SELECT, INSERT ON cross_platform_sync_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON project_revenue TO authenticated;
GRANT SELECT, INSERT ON financial_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_staff TO authenticated;
GRANT EXECUTE ON FUNCTION get_cross_platform_summary(UUID) TO authenticated;
