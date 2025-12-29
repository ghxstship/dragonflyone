-- ============================================================================
-- 0030_atlvs_business_ops.sql
-- ATLVS Business Operations - Blog, Careers, Benefits, Proposals, RFP, Training
-- GHXSTSHIP Platform - 100% ATLVS Feature Coverage
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================

CREATE TYPE content_status AS ENUM ('draft', 'review', 'scheduled', 'published', 'archived');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised');
CREATE TYPE rfp_status AS ENUM ('open', 'closed', 'evaluating', 'awarded', 'cancelled');
CREATE TYPE job_status AS ENUM ('draft', 'open', 'paused', 'closed', 'filled');
CREATE TYPE application_status AS ENUM ('submitted', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn');
CREATE TYPE training_status AS ENUM ('not_started', 'in_progress', 'completed', 'expired', 'waived');

-- ============================================================================
-- SECTION 2: BLOG & CONTENT
-- ============================================================================

CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES platform_users(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  status content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  tags JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES legend_people(id),
  author_name TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 3: CAREERS & RECRUITMENT
-- ============================================================================

CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES legend_departments(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  employment_type TEXT NOT NULL,
  location TEXT,
  location_type TEXT DEFAULT 'onsite',
  salary_min NUMERIC(12,2),
  salary_max NUMERIC(12,2),
  salary_currency TEXT DEFAULT 'USD',
  benefits JSONB DEFAULT '[]'::jsonb,
  status job_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  is_remote BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES legend_people(id),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  status application_status NOT NULL DEFAULT 'submitted',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 4: BENEFITS
-- ============================================================================

CREATE TABLE benefit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  provider TEXT,
  description TEXT,
  coverage_details JSONB DEFAULT '{}'::jsonb,
  cost_employee NUMERIC(10,2),
  cost_employer NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES benefit_plans(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  coverage_level TEXT NOT NULL,
  dependents JSONB DEFAULT '[]'::jsonb,
  enrollment_date DATE NOT NULL,
  effective_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan_id, employee_id)
);

-- ============================================================================
-- SECTION 5: PROPOSALS & QUOTES
-- ============================================================================

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id),
  proposal_number TEXT NOT NULL,
  title TEXT NOT NULL,
  status proposal_status NOT NULL DEFAULT 'draft',
  valid_until DATE,
  currency TEXT DEFAULT 'USD',
  subtotal NUMERIC(14,2) DEFAULT 0,
  discount_amount NUMERIC(14,2) DEFAULT 0,
  tax_amount NUMERIC(14,2) DEFAULT 0,
  total_amount NUMERIC(14,2) DEFAULT 0,
  terms_and_conditions TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  signature_url TEXT,
  created_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE proposal_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES legend_products(id),
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(14,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id),
  quote_number TEXT NOT NULL,
  title TEXT NOT NULL,
  status proposal_status NOT NULL DEFAULT 'draft',
  valid_until DATE,
  currency TEXT DEFAULT 'USD',
  total_amount NUMERIC(14,2) DEFAULT 0,
  line_items JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 6: RFP MANAGEMENT
-- ============================================================================

CREATE TABLE rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rfp_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status rfp_status NOT NULL DEFAULT 'open',
  due_date TIMESTAMPTZ NOT NULL,
  budget_min NUMERIC(14,2),
  budget_max NUMERIC(14,2),
  requirements JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  awarded_to UUID REFERENCES procurement_vendors(id),
  created_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rfp_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES procurement_vendors(id) ON DELETE CASCADE,
  proposed_amount NUMERIC(14,2),
  proposal_summary TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'submitted',
  score NUMERIC(5,2),
  is_winner BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rfp_id, vendor_id)
);

-- ============================================================================
-- SECTION 7: REVENUE & TAXES
-- ============================================================================

CREATE TABLE revenue_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  total_amount NUMERIC(14,2) NOT NULL,
  recognized_amount NUMERIC(14,2) DEFAULT 0,
  deferred_amount NUMERIC(14,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  recognition_method TEXT DEFAULT 'straight_line',
  schedule JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rate NUMERIC(6,4) NOT NULL,
  tax_type TEXT NOT NULL,
  jurisdiction TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tax_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tax_rate_id UUID REFERENCES tax_rates(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  taxable_sales NUMERIC(14,2) DEFAULT 0,
  tax_collected NUMERIC(14,2) DEFAULT 0,
  tax_due NUMERIC(14,2) DEFAULT 0,
  due_date DATE,
  filed_date DATE,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 8: SUBSIDIARIES & SCENARIOS
-- ============================================================================

CREATE TABLE subsidiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subsidiary_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ownership_percentage NUMERIC(5,2) NOT NULL,
  relationship_type TEXT NOT NULL,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_organization_id, subsidiary_organization_id)
);

CREATE TABLE financial_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL,
  base_budget_id UUID REFERENCES budgets(id),
  assumptions JSONB DEFAULT '{}'::jsonb,
  projected_revenue NUMERIC(14,2),
  projected_expenses NUMERIC(14,2),
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 9: TRAINING & LEARNING
-- ============================================================================

CREATE TABLE training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES knowledge_categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  format TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  passing_score INTEGER DEFAULT 70,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT NOT NULL,
  content_url TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  status training_status NOT NULL DEFAULT 'not_started',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0,
  score INTEGER,
  certificate_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(course_id, employee_id)
);

-- ============================================================================
-- SECTION 10: CHANGELOG
-- ============================================================================

CREATE TABLE changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  release_date DATE NOT NULL,
  category TEXT NOT NULL,
  changes JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 11: INDEXES
-- ============================================================================

CREATE INDEX idx_blog_posts_org ON blog_posts(organization_id, status);
CREATE INDEX idx_blog_posts_fts ON blog_posts USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')));
CREATE INDEX idx_job_postings_org ON job_postings(organization_id, status);
CREATE INDEX idx_job_applications_job ON job_applications(job_id, status);
CREATE INDEX idx_benefit_plans_org ON benefit_plans(organization_id, is_active);
CREATE INDEX idx_proposals_org ON proposals(organization_id, status);
CREATE INDEX idx_rfps_org ON rfps(organization_id, status);
CREATE INDEX idx_training_courses_org ON training_courses(organization_id, is_active);
CREATE INDEX idx_training_enrollments_employee ON training_enrollments(employee_id);

-- ============================================================================
-- SECTION 12: RLS POLICIES
-- ============================================================================

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_categories_org ON blog_categories FOR ALL USING (org_matches(organization_id));
CREATE POLICY blog_posts_org ON blog_posts FOR ALL USING (org_matches(organization_id));
CREATE POLICY blog_comments_access ON blog_comments FOR ALL USING (EXISTS (SELECT 1 FROM blog_posts bp WHERE bp.id = post_id AND org_matches(bp.organization_id)));
CREATE POLICY job_postings_org ON job_postings FOR ALL USING (org_matches(organization_id));
CREATE POLICY job_applications_access ON job_applications FOR ALL USING (EXISTS (SELECT 1 FROM job_postings jp WHERE jp.id = job_id AND org_matches(jp.organization_id)));
CREATE POLICY benefit_plans_org ON benefit_plans FOR ALL USING (org_matches(organization_id));
CREATE POLICY benefit_enrollments_access ON benefit_enrollments FOR ALL USING (EXISTS (SELECT 1 FROM benefit_plans bp WHERE bp.id = plan_id AND org_matches(bp.organization_id)));
CREATE POLICY proposals_org ON proposals FOR ALL USING (org_matches(organization_id));
CREATE POLICY proposal_line_items_access ON proposal_line_items FOR ALL USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND org_matches(p.organization_id)));
CREATE POLICY quotes_org ON quotes FOR ALL USING (org_matches(organization_id));
CREATE POLICY rfps_org ON rfps FOR ALL USING (org_matches(organization_id));
CREATE POLICY rfp_submissions_access ON rfp_submissions FOR ALL USING (EXISTS (SELECT 1 FROM rfps r WHERE r.id = rfp_id AND org_matches(r.organization_id)));
CREATE POLICY revenue_schedules_org ON revenue_schedules FOR ALL USING (org_matches(organization_id));
CREATE POLICY tax_rates_org ON tax_rates FOR ALL USING (org_matches(organization_id));
CREATE POLICY tax_filings_org ON tax_filings FOR ALL USING (org_matches(organization_id));
CREATE POLICY subsidiaries_org ON subsidiaries FOR ALL USING (org_matches(parent_organization_id));
CREATE POLICY financial_scenarios_org ON financial_scenarios FOR ALL USING (org_matches(organization_id));
CREATE POLICY training_courses_org ON training_courses FOR ALL USING (org_matches(organization_id));
CREATE POLICY training_modules_access ON training_modules FOR ALL USING (EXISTS (SELECT 1 FROM training_courses tc WHERE tc.id = course_id AND org_matches(tc.organization_id)));
CREATE POLICY training_enrollments_access ON training_enrollments FOR ALL USING (EXISTS (SELECT 1 FROM training_courses tc WHERE tc.id = course_id AND org_matches(tc.organization_id)));
CREATE POLICY changelog_entries_org ON changelog_entries FOR ALL USING (org_matches(organization_id));

-- ============================================================================
-- SECTION 13: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON blog_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON job_postings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON job_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON benefit_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON benefit_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON proposals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON proposal_line_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON rfps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON rfp_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON revenue_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tax_rates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tax_filings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subsidiaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON financial_scenarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON training_courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON training_modules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON training_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON changelog_entries TO authenticated;

-- ============================================================================
-- SECTION 14: TRIGGERS
-- ============================================================================

CREATE TRIGGER blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER blog_comments_updated_at BEFORE UPDATE ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER benefit_plans_updated_at BEFORE UPDATE ON benefit_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER benefit_enrollments_updated_at BEFORE UPDATE ON benefit_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER rfps_updated_at BEFORE UPDATE ON rfps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER rfp_submissions_updated_at BEFORE UPDATE ON rfp_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER revenue_schedules_updated_at BEFORE UPDATE ON revenue_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tax_rates_updated_at BEFORE UPDATE ON tax_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tax_filings_updated_at BEFORE UPDATE ON tax_filings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER subsidiaries_updated_at BEFORE UPDATE ON subsidiaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER financial_scenarios_updated_at BEFORE UPDATE ON financial_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER training_courses_updated_at BEFORE UPDATE ON training_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER training_modules_updated_at BEFORE UPDATE ON training_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER changelog_entries_updated_at BEFORE UPDATE ON changelog_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
