-- Migration: Maintenance Records Tables
-- Description: Tables for maintenance history and service records

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('preventive', 'corrective', 'inspection', 'calibration', 'repair', 'upgrade', 'cleaning')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'deferred')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  performed_by UUID REFERENCES platform_users(id),
  vendor_id UUID REFERENCES vendors(id),
  labor_hours DECIMAL(10, 2),
  labor_cost DECIMAL(12, 2),
  parts_cost DECIMAL(12, 2),
  total_cost DECIMAL(12, 2),
  parts_used JSONB,
  notes TEXT,
  attachments JSONB,
  next_service_date TIMESTAMPTZ,
  warranty_claim BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_interval INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service records table (external service providers)
CREATE TABLE IF NOT EXISTS service_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  service_type VARCHAR(30) NOT NULL CHECK (service_type IN ('routine', 'emergency', 'warranty', 'recall', 'upgrade')),
  service_provider VARCHAR(200) NOT NULL,
  service_date TIMESTAMPTZ NOT NULL,
  invoice_number VARCHAR(100),
  invoice_amount DECIMAL(12, 2),
  work_performed TEXT NOT NULL,
  technician_name VARCHAR(200),
  condition_before VARCHAR(20) CHECK (condition_before IN ('excellent', 'good', 'fair', 'poor', 'non_functional')),
  condition_after VARCHAR(20) CHECK (condition_after IN ('excellent', 'good', 'fair', 'poor', 'non_functional')),
  recommendations TEXT,
  warranty_used BOOLEAN DEFAULT FALSE,
  next_service_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add maintenance tracking columns to assets table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'last_maintenance_date') THEN
    ALTER TABLE assets ADD COLUMN last_maintenance_date TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'next_maintenance_date') THEN
    ALTER TABLE assets ADD COLUMN next_maintenance_date TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'condition') THEN
    ALTER TABLE assets ADD COLUMN condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'non_functional'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_records_asset ON maintenance_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_scheduled ON maintenance_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_type ON maintenance_records(type);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vendor ON maintenance_records(vendor_id);
CREATE INDEX IF NOT EXISTS idx_service_records_asset ON service_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_service_records_date ON service_records(service_date);

-- RLS Policies
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY maintenance_records_view ON maintenance_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY service_records_view ON service_records FOR SELECT USING (auth.uid() IS NOT NULL);

-- Manage policies
CREATE POLICY maintenance_records_manage ON maintenance_records FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY service_records_manage ON service_records FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

-- Function to get maintenance cost summary for an asset
CREATE OR REPLACE FUNCTION get_asset_maintenance_summary(p_asset_id UUID)
RETURNS TABLE (
  total_maintenance_count INTEGER,
  completed_count INTEGER,
  total_labor_cost DECIMAL,
  total_parts_cost DECIMAL,
  total_cost DECIMAL,
  last_maintenance_date TIMESTAMPTZ,
  next_scheduled_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER,
    COALESCE(SUM(labor_cost) FILTER (WHERE status = 'completed'), 0),
    COALESCE(SUM(parts_cost) FILTER (WHERE status = 'completed'), 0),
    COALESCE(SUM(total_cost) FILTER (WHERE status = 'completed'), 0),
    MAX(completed_date) FILTER (WHERE status = 'completed'),
    MIN(scheduled_date) FILTER (WHERE status = 'scheduled' AND scheduled_date > NOW())
  FROM maintenance_records
  WHERE asset_id = p_asset_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get overdue maintenance alerts
CREATE OR REPLACE FUNCTION get_overdue_maintenance()
RETURNS TABLE (
  asset_id UUID,
  asset_name VARCHAR,
  maintenance_id UUID,
  title VARCHAR,
  scheduled_date TIMESTAMPTZ,
  days_overdue INTEGER,
  priority VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.asset_id,
    a.name,
    m.id,
    m.title,
    m.scheduled_date,
    EXTRACT(DAY FROM NOW() - m.scheduled_date)::INTEGER,
    m.priority
  FROM maintenance_records m
  JOIN assets a ON m.asset_id = a.id
  WHERE m.status = 'scheduled'
    AND m.scheduled_date < NOW()
  ORDER BY m.priority DESC, m.scheduled_date ASC;
END;
$$ LANGUAGE plpgsql;
