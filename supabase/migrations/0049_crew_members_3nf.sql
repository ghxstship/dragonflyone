-- Migration: Crew Members Table (3NF Compliant)
-- Creates crew_members and related tables following Third Normal Form

-- =============================================================================
-- DEPARTMENTS LOOKUP TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_departments_org_id ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON public.departments(parent_department_id);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_select_policy" ON public.departments
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "departments_insert_policy" ON public.departments
    FOR INSERT WITH CHECK (org_matches(organization_id));

CREATE POLICY "departments_update_policy" ON public.departments
    FOR UPDATE USING (org_matches(organization_id));

-- =============================================================================
-- CREW ROLES LOOKUP TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.crew_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_crew_roles_org_id ON public.crew_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_roles_department ON public.crew_roles(department_id);

ALTER TABLE public.crew_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_roles_select_policy" ON public.crew_roles
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "crew_roles_insert_policy" ON public.crew_roles
    FOR INSERT WITH CHECK (org_matches(organization_id));

-- =============================================================================
-- CREW MEMBERS TABLE (3NF Compliant)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.platform_users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role_id UUID REFERENCES public.crew_roles(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    hourly_rate NUMERIC(10, 2),
    day_rate NUMERIC(10, 2),
    availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_leave')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'terminated')),
    hire_date DATE,
    termination_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.platform_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_crew_members_org_id ON public.crew_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_user_id ON public.crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_role_id ON public.crew_members(role_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_department_id ON public.crew_members(department_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_status ON public.crew_members(status);
CREATE INDEX IF NOT EXISTS idx_crew_members_email ON public.crew_members(email);

ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_members_select_policy" ON public.crew_members
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "crew_members_insert_policy" ON public.crew_members
    FOR INSERT WITH CHECK (org_matches(organization_id));

CREATE POLICY "crew_members_update_policy" ON public.crew_members
    FOR UPDATE USING (org_matches(organization_id));

CREATE POLICY "crew_members_delete_policy" ON public.crew_members
    FOR DELETE USING (org_matches(organization_id));

-- =============================================================================
-- SKILLS LOOKUP TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select_policy" ON public.skills
    FOR SELECT USING (true);

CREATE POLICY "skills_insert_policy" ON public.skills
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- CERTIFICATIONS LOOKUP TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    issuing_body TEXT,
    category TEXT,
    description TEXT,
    validity_period_months INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_select_policy" ON public.certifications
    FOR SELECT USING (true);

CREATE POLICY "certifications_insert_policy" ON public.certifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- CREW MEMBER SKILLS JUNCTION TABLE (1NF Compliant)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.crew_member_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.platform_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(crew_member_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_member_skills_member ON public.crew_member_skills(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_member_skills_skill ON public.crew_member_skills(skill_id);

ALTER TABLE public.crew_member_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_member_skills_select_policy" ON public.crew_member_skills
    FOR SELECT USING (true);

CREATE POLICY "crew_member_skills_insert_policy" ON public.crew_member_skills
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "crew_member_skills_delete_policy" ON public.crew_member_skills
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================================================
-- CREW MEMBER CERTIFICATIONS JUNCTION TABLE (1NF Compliant)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.crew_member_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
    issue_date DATE,
    expiry_date DATE,
    certificate_number TEXT,
    issuing_authority TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.platform_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(crew_member_id, certification_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_member_certs_member ON public.crew_member_certifications(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_member_certs_cert ON public.crew_member_certifications(certification_id);
CREATE INDEX IF NOT EXISTS idx_crew_member_certs_expiry ON public.crew_member_certifications(expiry_date);

ALTER TABLE public.crew_member_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_member_certs_select_policy" ON public.crew_member_certifications
    FOR SELECT USING (true);

CREATE POLICY "crew_member_certs_insert_policy" ON public.crew_member_certifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "crew_member_certs_delete_policy" ON public.crew_member_certifications
    FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================================================
-- GRANTS
-- =============================================================================
GRANT ALL ON public.departments TO authenticated;
GRANT SELECT ON public.departments TO anon;

GRANT ALL ON public.crew_roles TO authenticated;
GRANT SELECT ON public.crew_roles TO anon;

GRANT ALL ON public.crew_members TO authenticated;
GRANT SELECT ON public.crew_members TO anon;

GRANT ALL ON public.crew_member_skills TO authenticated;
GRANT SELECT ON public.crew_member_skills TO anon;

GRANT ALL ON public.crew_member_certifications TO authenticated;
GRANT SELECT ON public.crew_member_certifications TO anon;
