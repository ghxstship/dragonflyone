-- ============================================================================
-- 0012_operational_workforce.sql
-- Operational Workforce Tables: Time Tracking, Certifications, Scheduling
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- ENUM TYPES FOR WORKFORCE
-- ============================================================================

CREATE TYPE time_entry_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE shift_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

-- ============================================================================
-- WORKFORCE ROLES (Job Roles/Positions for Crew)
-- ============================================================================

CREATE TABLE workforce_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES legend_departments(id),
  hourly_rate_min NUMERIC(10,2),
  hourly_rate_max NUMERIC(10,2),
  daily_rate NUMERIC(10,2),
  overtime_multiplier NUMERIC(4,2) DEFAULT 1.5,
  requires_certification BOOLEAN DEFAULT false,
  certification_types TEXT[],
  skills_required TEXT[],
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_workforce_roles_org ON workforce_roles(organization_id);
CREATE INDEX idx_workforce_roles_dept ON workforce_roles(department_id);

-- ============================================================================
-- WORKFORCE EMPLOYEES (Operational Employee Records)
-- ============================================================================

CREATE TABLE workforce_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  employee_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  status employee_status NOT NULL DEFAULT 'active',
  hire_date DATE,
  termination_date DATE,
  department_id UUID REFERENCES legend_departments(id),
  position_id UUID REFERENCES legend_positions(id),
  manager_id UUID REFERENCES workforce_employees(id),
  hourly_rate NUMERIC(10,2),
  salary NUMERIC(12,2),
  pay_frequency TEXT DEFAULT 'biweekly' CHECK (pay_frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, employee_number)
);

CREATE INDEX idx_workforce_employees_org ON workforce_employees(organization_id);
CREATE INDEX idx_workforce_employees_status ON workforce_employees(organization_id, status);
CREATE INDEX idx_workforce_employees_dept ON workforce_employees(department_id);
CREATE INDEX idx_workforce_employees_manager ON workforce_employees(manager_id);
CREATE INDEX idx_workforce_employees_person ON workforce_employees(person_id);

-- ============================================================================
-- WORKFORCE EMPLOYEE ROLES (Employee Role Assignments)
-- ============================================================================

CREATE TABLE workforce_employee_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES workforce_roles(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  hourly_rate NUMERIC(10,2),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, role_id, effective_from)
);

CREATE INDEX idx_employee_roles_employee ON workforce_employee_roles(employee_id);
CREATE INDEX idx_employee_roles_role ON workforce_employee_roles(role_id);

-- ============================================================================
-- WORKFORCE TIME ENTRIES
-- ============================================================================

CREATE TABLE workforce_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  role_id UUID REFERENCES workforce_roles(id),
  work_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  hours NUMERIC(5,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
  break_hours NUMERIC(4,2) DEFAULT 0,
  overtime_hours NUMERIC(4,2) DEFAULT 0,
  hourly_rate NUMERIC(10,2),
  total_pay NUMERIC(10,2),
  status time_entry_status NOT NULL DEFAULT 'pending',
  description TEXT,
  location TEXT,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_entries_org ON workforce_time_entries(organization_id, work_date DESC);
CREATE INDEX idx_time_entries_employee ON workforce_time_entries(employee_id, work_date DESC);
CREATE INDEX idx_time_entries_project ON workforce_time_entries(project_id);
CREATE INDEX idx_time_entries_event ON workforce_time_entries(event_id);
CREATE INDEX idx_time_entries_status ON workforce_time_entries(organization_id, status);

-- ============================================================================
-- WORKFORCE CERTIFICATIONS
-- ============================================================================

CREATE TABLE workforce_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  certification_name TEXT NOT NULL,
  issuing_authority TEXT,
  certification_number TEXT,
  issue_date DATE,
  expiration_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ,
  document_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_certifications_org ON workforce_certifications(organization_id);
CREATE INDEX idx_certifications_employee ON workforce_certifications(employee_id);
CREATE INDEX idx_certifications_type ON workforce_certifications(certification_type);
CREATE INDEX idx_certifications_expiry ON workforce_certifications(expiration_date) WHERE expiration_date IS NOT NULL;

-- ============================================================================
-- WORKFORCE SHIFTS (Scheduling)
-- ============================================================================

CREATE TABLE workforce_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE CASCADE,
  location_id UUID REFERENCES legend_places(id),
  role_id UUID REFERENCES workforce_roles(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTERVAL DEFAULT '0 minutes',
  headcount_required INTEGER DEFAULT 1,
  headcount_filled INTEGER DEFAULT 0,
  hourly_rate NUMERIC(10,2),
  notes TEXT,
  status shift_status NOT NULL DEFAULT 'scheduled',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shifts_org ON workforce_shifts(organization_id, shift_date);
CREATE INDEX idx_shifts_project ON workforce_shifts(project_id);
CREATE INDEX idx_shifts_event ON workforce_shifts(event_id);
CREATE INDEX idx_shifts_role ON workforce_shifts(role_id);
CREATE INDEX idx_shifts_date ON workforce_shifts(shift_date, start_time);

-- ============================================================================
-- WORKFORCE SHIFT ASSIGNMENTS
-- ============================================================================

CREATE TABLE workforce_shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES workforce_shifts(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  status shift_status NOT NULL DEFAULT 'scheduled',
  confirmed_at TIMESTAMPTZ,
  check_in_at TIMESTAMPTZ,
  check_out_at TIMESTAMPTZ,
  actual_hours NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shift_id, employee_id)
);

CREATE INDEX idx_shift_assignments_shift ON workforce_shift_assignments(shift_id);
CREATE INDEX idx_shift_assignments_employee ON workforce_shift_assignments(employee_id);

-- ============================================================================
-- TIME CLOCK ENTRIES (Real-time clock in/out)
-- ============================================================================

CREATE TABLE time_clock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  shift_assignment_id UUID REFERENCES workforce_shift_assignments(id),
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  clock_in_location JSONB,
  clock_out_location JSONB,
  clock_in_method TEXT DEFAULT 'manual' CHECK (clock_in_method IN ('manual', 'kiosk', 'mobile', 'badge', 'biometric')),
  clock_out_method TEXT CHECK (clock_out_method IN ('manual', 'kiosk', 'mobile', 'badge', 'biometric', 'auto')),
  break_start TIMESTAMPTZ,
  break_end TIMESTAMPTZ,
  total_break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clock_entries_org ON time_clock_entries(organization_id, clock_in DESC);
CREATE INDEX idx_clock_entries_employee ON time_clock_entries(employee_id, clock_in DESC);
CREATE INDEX idx_clock_entries_shift ON time_clock_entries(shift_assignment_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE workforce_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce_employee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce_shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_clock_entries ENABLE ROW LEVEL SECURITY;

-- Workforce Roles policies
CREATE POLICY workforce_roles_select ON workforce_roles FOR SELECT USING (org_matches(organization_id));
CREATE POLICY workforce_roles_manage ON workforce_roles FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));

-- Workforce Employees policies
CREATE POLICY workforce_employees_select ON workforce_employees FOR SELECT USING (org_matches(organization_id));
CREATE POLICY workforce_employees_insert ON workforce_employees FOR INSERT WITH CHECK (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY workforce_employees_update ON workforce_employees FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY workforce_employees_delete ON workforce_employees FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Employee Roles policies
CREATE POLICY employee_roles_select ON workforce_employee_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM workforce_employees e WHERE e.id = employee_id AND org_matches(e.organization_id))
);
CREATE POLICY employee_roles_manage ON workforce_employee_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM workforce_employees e WHERE e.id = employee_id AND org_matches(e.organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'))
);

-- Time Entries policies
CREATE POLICY time_entries_select ON workforce_time_entries FOR SELECT USING (
  org_matches(organization_id) AND (
    employee_id IN (SELECT id FROM workforce_employees WHERE person_id = (SELECT person_id FROM platform_users WHERE id = current_platform_user_id()))
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
);
CREATE POLICY time_entries_insert ON workforce_time_entries FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY time_entries_update ON workforce_time_entries FOR UPDATE USING (
  org_matches(organization_id) AND (
    (status = 'pending' AND employee_id IN (SELECT id FROM workforce_employees WHERE person_id = (SELECT person_id FROM platform_users WHERE id = current_platform_user_id())))
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN')
  )
);
CREATE POLICY time_entries_delete ON workforce_time_entries FOR DELETE USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Certifications policies
CREATE POLICY certifications_select ON workforce_certifications FOR SELECT USING (org_matches(organization_id));
CREATE POLICY certifications_manage ON workforce_certifications FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));

-- Shifts policies
CREATE POLICY shifts_select ON workforce_shifts FOR SELECT USING (org_matches(organization_id));
CREATE POLICY shifts_manage ON workforce_shifts FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));

-- Shift Assignments policies
CREATE POLICY shift_assignments_select ON workforce_shift_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM workforce_shifts s WHERE s.id = shift_id AND org_matches(s.organization_id))
);
CREATE POLICY shift_assignments_manage ON workforce_shift_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM workforce_shifts s WHERE s.id = shift_id AND org_matches(s.organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'))
);

-- Time Clock policies
CREATE POLICY clock_entries_select ON time_clock_entries FOR SELECT USING (
  org_matches(organization_id) AND (
    employee_id IN (SELECT id FROM workforce_employees WHERE person_id = (SELECT person_id FROM platform_users WHERE id = current_platform_user_id()))
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN')
  )
);
CREATE POLICY clock_entries_insert ON time_clock_entries FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY clock_entries_update ON time_clock_entries FOR UPDATE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN')
);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON workforce_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workforce_employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workforce_employee_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workforce_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workforce_certifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workforce_shifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workforce_shift_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON time_clock_entries TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER workforce_roles_updated_at BEFORE UPDATE ON workforce_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER workforce_employees_updated_at BEFORE UPDATE ON workforce_employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER workforce_time_entries_updated_at BEFORE UPDATE ON workforce_time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER workforce_certifications_updated_at BEFORE UPDATE ON workforce_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER workforce_shifts_updated_at BEFORE UPDATE ON workforce_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER workforce_shift_assignments_updated_at BEFORE UPDATE ON workforce_shift_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
