-- Migration: Calibration and Certification Schedules System
-- Description: Track calibration requirements and certification schedules for assets and components

-- Calibration standards/requirements
CREATE TABLE IF NOT EXISTS calibration_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  governing_body VARCHAR(255),
  standard_type VARCHAR(50) CHECK (standard_type IN ('iso', 'nist', 'ansi', 'industry', 'manufacturer', 'internal', 'regulatory')),
  requirements JSONB DEFAULT '{}',
  tolerance_specs JSONB DEFAULT '{}',
  documentation_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calibration schedules
CREATE TABLE IF NOT EXISTS calibration_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  component_id UUID REFERENCES serialized_components(id) ON DELETE CASCADE,
  calibration_standard_id UUID REFERENCES calibration_standards(id),
  calibration_type VARCHAR(100) NOT NULL,
  frequency_days INTEGER NOT NULL,
  last_calibration_date DATE,
  next_calibration_date DATE NOT NULL,
  tolerance_range JSONB DEFAULT '{}',
  calibration_points JSONB DEFAULT '[]',
  required_equipment JSONB DEFAULT '[]',
  certified_technician_required BOOLEAN DEFAULT FALSE,
  estimated_duration_hours DECIMAL(5,2),
  estimated_cost DECIMAL(12,2),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'overdue', 'in_progress', 'completed', 'skipped', 'suspended')),
  notification_days_before INTEGER DEFAULT 30,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  CONSTRAINT calibration_target CHECK (asset_id IS NOT NULL OR component_id IS NOT NULL)
);

-- Calibration records/history
CREATE TABLE IF NOT EXISTS calibration_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES calibration_schedules(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  component_id UUID REFERENCES serialized_components(id) ON DELETE CASCADE,
  calibration_date DATE NOT NULL,
  calibration_type VARCHAR(100) NOT NULL,
  performed_by VARCHAR(255),
  technician_certification VARCHAR(255),
  calibration_lab VARCHAR(255),
  lab_accreditation VARCHAR(255),
  reference_standards_used JSONB DEFAULT '[]',
  measurements_before JSONB DEFAULT '{}',
  measurements_after JSONB DEFAULT '{}',
  adjustments_made JSONB DEFAULT '[]',
  result VARCHAR(50) NOT NULL CHECK (result IN ('pass', 'fail', 'pass_with_adjustments', 'out_of_tolerance', 'unable_to_calibrate')),
  deviation_from_standard DECIMAL(10,6),
  uncertainty_measurement DECIMAL(10,6),
  certificate_number VARCHAR(100),
  certificate_url TEXT,
  expiration_date DATE,
  environmental_conditions JSONB DEFAULT '{}',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  CONSTRAINT calibration_record_target CHECK (asset_id IS NOT NULL OR component_id IS NOT NULL)
);

-- Certification types
CREATE TABLE IF NOT EXISTS certification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  category VARCHAR(100) NOT NULL,
  issuing_authority VARCHAR(255),
  description TEXT,
  validity_period_months INTEGER,
  renewal_requirements JSONB DEFAULT '{}',
  prerequisites JSONB DEFAULT '[]',
  documentation_required JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset/equipment certifications
CREATE TABLE IF NOT EXISTS equipment_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  component_id UUID REFERENCES serialized_components(id) ON DELETE CASCADE,
  certification_type_id UUID REFERENCES certification_types(id),
  certification_name VARCHAR(255) NOT NULL,
  certificate_number VARCHAR(100),
  issuing_authority VARCHAR(255),
  issue_date DATE NOT NULL,
  expiration_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'revoked', 'pending_renewal')),
  scope TEXT,
  conditions JSONB DEFAULT '[]',
  certificate_url TEXT,
  verification_url TEXT,
  renewal_cost DECIMAL(12,2),
  notification_days_before INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  CONSTRAINT certification_target CHECK (asset_id IS NOT NULL OR component_id IS NOT NULL)
);

-- Certification renewal tracking
CREATE TABLE IF NOT EXISTS certification_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES equipment_certifications(id) ON DELETE CASCADE,
  renewal_date DATE NOT NULL,
  previous_expiration DATE,
  new_expiration DATE NOT NULL,
  renewal_type VARCHAR(50) CHECK (renewal_type IN ('standard', 'expedited', 'provisional', 'extension')),
  cost DECIMAL(12,2),
  processed_by UUID REFERENCES platform_users(id),
  documentation JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calibration_schedules_asset ON calibration_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_calibration_schedules_component ON calibration_schedules(component_id);
CREATE INDEX IF NOT EXISTS idx_calibration_schedules_next_date ON calibration_schedules(next_calibration_date);
CREATE INDEX IF NOT EXISTS idx_calibration_schedules_status ON calibration_schedules(status);
CREATE INDEX IF NOT EXISTS idx_calibration_records_asset ON calibration_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_calibration_records_component ON calibration_records(component_id);
CREATE INDEX IF NOT EXISTS idx_calibration_records_date ON calibration_records(calibration_date);
CREATE INDEX IF NOT EXISTS idx_equipment_certifications_asset ON equipment_certifications(asset_id);
CREATE INDEX IF NOT EXISTS idx_equipment_certifications_component ON equipment_certifications(component_id);
CREATE INDEX IF NOT EXISTS idx_equipment_certifications_expiration ON equipment_certifications(expiration_date);
CREATE INDEX IF NOT EXISTS idx_equipment_certifications_status ON equipment_certifications(status);

-- RLS Policies
ALTER TABLE calibration_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_renewals ENABLE ROW LEVEL SECURITY;

-- Select policies (read access for authenticated users)
CREATE POLICY "calibration_standards_select" ON calibration_standards FOR SELECT USING (true);
CREATE POLICY "calibration_schedules_select" ON calibration_schedules FOR SELECT USING (true);
CREATE POLICY "calibration_records_select" ON calibration_records FOR SELECT USING (true);
CREATE POLICY "certification_types_select" ON certification_types FOR SELECT USING (true);
CREATE POLICY "equipment_certifications_select" ON equipment_certifications FOR SELECT USING (true);
CREATE POLICY "certification_renewals_select" ON certification_renewals FOR SELECT USING (true);

-- Insert/Update/Delete policies for admin roles
CREATE POLICY "calibration_standards_manage" ON calibration_standards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "calibration_schedules_insert" ON calibration_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "calibration_schedules_update" ON calibration_schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "calibration_records_insert" ON calibration_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "certification_types_manage" ON certification_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "equipment_certifications_insert" ON equipment_certifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "equipment_certifications_update" ON equipment_certifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "certification_renewals_insert" ON certification_renewals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Function to update calibration schedule status
CREATE OR REPLACE FUNCTION update_calibration_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.next_calibration_date < CURRENT_DATE AND NEW.status = 'scheduled' THEN
    NEW.status := 'overdue';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calibration_schedule_status_update
  BEFORE UPDATE ON calibration_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_calibration_status();

-- Function to update certification status
CREATE OR REPLACE FUNCTION update_certification_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiration_date IS NOT NULL AND NEW.expiration_date < CURRENT_DATE AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certification_status_update
  BEFORE UPDATE ON equipment_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_certification_status();

-- View for upcoming calibrations
CREATE OR REPLACE VIEW upcoming_calibrations AS
SELECT 
  cs.id,
  cs.calibration_type,
  cs.next_calibration_date,
  cs.priority,
  cs.status,
  cs.notification_days_before,
  a.id as asset_id,
  a.name as asset_name,
  a.asset_tag,
  sc.id as component_id,
  sc.serial_number as component_serial,
  sc.component_type,
  cst.name as standard_name,
  cst.code as standard_code,
  (cs.next_calibration_date - CURRENT_DATE) as days_until_due
FROM calibration_schedules cs
LEFT JOIN assets a ON cs.asset_id = a.id
LEFT JOIN serialized_components sc ON cs.component_id = sc.id
LEFT JOIN calibration_standards cst ON cs.calibration_standard_id = cst.id
WHERE cs.status IN ('scheduled', 'overdue')
ORDER BY cs.next_calibration_date ASC;

-- View for expiring certifications
CREATE OR REPLACE VIEW expiring_certifications AS
SELECT 
  ec.id,
  ec.certification_name,
  ec.certificate_number,
  ec.expiration_date,
  ec.status,
  ec.notification_days_before,
  a.id as asset_id,
  a.name as asset_name,
  a.asset_tag,
  sc.id as component_id,
  sc.serial_number as component_serial,
  ct.name as certification_type_name,
  ct.category as certification_category,
  (ec.expiration_date - CURRENT_DATE) as days_until_expiration
FROM equipment_certifications ec
LEFT JOIN assets a ON ec.asset_id = a.id
LEFT JOIN serialized_components sc ON ec.component_id = sc.id
LEFT JOIN certification_types ct ON ec.certification_type_id = ct.id
WHERE ec.status IN ('active', 'pending_renewal')
  AND ec.expiration_date IS NOT NULL
ORDER BY ec.expiration_date ASC;
