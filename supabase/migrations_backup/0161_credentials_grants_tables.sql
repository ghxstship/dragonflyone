-- Migration: Credentials and Grants Tables
-- Description: Tables for employee credentials/licenses and grant/funding management

-- Employee credentials table
CREATE TABLE IF NOT EXISTS employee_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES platform_users(id),
  credential_type VARCHAR(30) NOT NULL CHECK (credential_type IN ('license', 'certification', 'permit', 'clearance', 'registration', 'endorsement')),
  name VARCHAR(200) NOT NULL,
  issuing_authority VARCHAR(200) NOT NULL,
  credential_number VARCHAR(100),
  issue_date TIMESTAMPTZ NOT NULL,
  expiration_date TIMESTAMPTZ,
  renewal_required BOOLEAN DEFAULT TRUE,
  renewal_period_months INTEGER,
  cost DECIMAL(10, 2),
  document_url TEXT,
  notes TEXT,
  last_renewed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credential reminders table
CREATE TABLE IF NOT EXISTS credential_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES employee_credentials(id),
  reminder_type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  recipient_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credential renewals table
CREATE TABLE IF NOT EXISTS credential_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES employee_credentials(id),
  previous_expiration TIMESTAMPTZ,
  new_expiration TIMESTAMPTZ NOT NULL,
  renewal_cost DECIMAL(10, 2),
  renewed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grants table
CREATE TABLE IF NOT EXISTS grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  grantor VARCHAR(200) NOT NULL,
  grantor_type VARCHAR(30) NOT NULL CHECK (grantor_type IN ('federal', 'state', 'local', 'foundation', 'corporate', 'individual', 'other')),
  grant_number VARCHAR(100),
  amount_awarded DECIMAL(14, 2) NOT NULL,
  amount_received DECIMAL(14, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  purpose TEXT NOT NULL,
  restrictions TEXT,
  reporting_requirements TEXT,
  reporting_frequency VARCHAR(20) CHECK (reporting_frequency IN ('monthly', 'quarterly', 'semi_annual', 'annual', 'final_only')),
  project_id UUID REFERENCES projects(id),
  contact_name VARCHAR(200),
  contact_email VARCHAR(255),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'closed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant expenditures table
CREATE TABLE IF NOT EXISTS grant_expenditures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL REFERENCES grants(id),
  amount DECIMAL(12, 2) NOT NULL,
  expenditure_date TIMESTAMPTZ NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  invoice_id UUID,
  approved_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant reports table
CREATE TABLE IF NOT EXISTS grant_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL REFERENCES grants(id),
  report_type VARCHAR(30) NOT NULL CHECK (report_type IN ('progress', 'financial', 'final', 'interim')),
  report_number INTEGER,
  due_date TIMESTAMPTZ NOT NULL,
  submitted_date TIMESTAMPTZ,
  report_content TEXT,
  attachments JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'accepted', 'revision_required')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant receipts table
CREATE TABLE IF NOT EXISTS grant_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID NOT NULL REFERENCES grants(id),
  amount DECIMAL(12, 2) NOT NULL,
  received_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funding sources table
CREATE TABLE IF NOT EXISTS funding_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('grant', 'donation', 'sponsorship', 'investment', 'loan', 'revenue', 'other')),
  amount DECIMAL(14, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  restrictions TEXT,
  project_id UUID REFERENCES projects(id),
  donor_id UUID REFERENCES contacts(id),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'depleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employee_credentials_employee ON employee_credentials(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_type ON employee_credentials(credential_type);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_expiration ON employee_credentials(expiration_date);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_status ON employee_credentials(status);
CREATE INDEX IF NOT EXISTS idx_credential_reminders_credential ON credential_reminders(credential_id);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_grantor_type ON grants(grantor_type);
CREATE INDEX IF NOT EXISTS idx_grants_end_date ON grants(end_date);
CREATE INDEX IF NOT EXISTS idx_grant_expenditures_grant ON grant_expenditures(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_reports_grant ON grant_reports(grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_reports_due_date ON grant_reports(due_date);
CREATE INDEX IF NOT EXISTS idx_funding_sources_type ON funding_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_funding_sources_project ON funding_sources(project_id);

-- RLS Policies
ALTER TABLE employee_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_sources ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY employee_credentials_view ON employee_credentials FOR SELECT USING (
  employee_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY grants_view ON grants FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY grant_expenditures_view ON grant_expenditures FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY grant_reports_view ON grant_reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY funding_sources_view ON funding_sources FOR SELECT USING (auth.uid() IS NOT NULL);

-- Manage policies
CREATE POLICY employee_credentials_manage ON employee_credentials FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY grants_manage ON grants FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY grant_expenditures_manage ON grant_expenditures FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY funding_sources_manage ON funding_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

-- Function to get expiring credentials
CREATE OR REPLACE FUNCTION get_expiring_credentials(days_ahead INTEGER DEFAULT 60)
RETURNS TABLE (
  credential_id UUID,
  employee_id UUID,
  employee_name TEXT,
  credential_name VARCHAR,
  credential_type VARCHAR,
  expiration_date TIMESTAMPTZ,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ec.id,
    ec.employee_id,
    pu.first_name || ' ' || pu.last_name,
    ec.name,
    ec.credential_type,
    ec.expiration_date,
    EXTRACT(DAY FROM ec.expiration_date - NOW())::INTEGER
  FROM employee_credentials ec
  JOIN platform_users pu ON ec.employee_id = pu.id
  WHERE ec.status = 'active'
    AND ec.renewal_required = TRUE
    AND ec.expiration_date <= NOW() + (days_ahead || ' days')::INTERVAL
    AND ec.expiration_date > NOW()
  ORDER BY ec.expiration_date ASC;
END;
$$ LANGUAGE plpgsql;
