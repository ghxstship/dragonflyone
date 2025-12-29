-- ============================================================================
-- 0028_compvss_logistics_docs.sql
-- COMPVSS Logistics & Documentation - 3NF Single Source of Truth
-- GHXSTSHIP Platform - Site Surveys, Permits, Deliveries, QA, Knowledge Base
-- ============================================================================

-- ============================================================================
-- SECTION 1: SITE SURVEYS & TECHNICAL DOCUMENTATION
-- ============================================================================

CREATE TABLE site_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  survey_type TEXT NOT NULL,
  survey_date DATE NOT NULL,
  surveyor_id UUID NOT NULL REFERENCES platform_users(id),
  surveyor_name TEXT,
  status TEXT DEFAULT 'draft',
  venue_capacity INTEGER,
  stage_dimensions JSONB,
  loading_dock_info JSONB,
  power_available JSONB,
  rigging_points JSONB,
  house_audio JSONB,
  house_lighting JSONB,
  house_video JSONB,
  backline_available JSONB,
  dressing_rooms JSONB,
  catering_facilities JSONB,
  load_in_access JSONB,
  parking_info JSONB,
  curfew_time TIME,
  noise_restrictions TEXT,
  union_requirements TEXT,
  fire_exits JSONB,
  emergency_equipment JSONB,
  accessibility_features JSONB,
  permits_required JSONB,
  photos JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  recommendations TEXT,
  issues_identified JSONB DEFAULT '[]'::jsonb,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE technical_drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES legend_places(id),
  drawing_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  thumbnail_url TEXT,
  scale TEXT,
  dimensions TEXT,
  created_by UUID NOT NULL REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  is_current BOOLEAN DEFAULT true,
  supersedes_id UUID REFERENCES technical_drawings(id),
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE spec_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  spec_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  file_url TEXT,
  is_template BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 2: PERMITS & COMPLIANCE
-- ============================================================================

CREATE TABLE permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES legend_places(id),
  permit_number TEXT,
  permit_type TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  jurisdiction TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status permit_status NOT NULL DEFAULT 'draft',
  application_date DATE,
  submitted_date DATE,
  approval_date DATE,
  effective_date DATE,
  expiration_date DATE,
  fee_amount NUMERIC(10,2),
  fee_paid BOOLEAN DEFAULT false,
  fee_paid_date DATE,
  conditions JSONB DEFAULT '[]'::jsonb,
  required_documents JSONB DEFAULT '[]'::jsonb,
  submitted_documents JSONB DEFAULT '[]'::jsonb,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  inspector_name TEXT,
  inspection_date DATE,
  inspection_notes TEXT,
  renewal_required BOOLEAN DEFAULT false,
  renewal_reminder_days INTEGER DEFAULT 30,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 3: DELIVERIES & LOGISTICS
-- ============================================================================

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  delivery_number TEXT NOT NULL,
  vendor_id UUID REFERENCES procurement_vendors(id),
  purchase_order_id UUID REFERENCES finance_purchase_orders(id),
  delivery_type TEXT NOT NULL,
  status delivery_status NOT NULL DEFAULT 'scheduled',
  origin_name TEXT,
  origin_address TEXT,
  origin_contact TEXT,
  origin_phone TEXT,
  destination_id UUID REFERENCES legend_places(id),
  destination_name TEXT,
  destination_address TEXT,
  destination_contact TEXT,
  destination_phone TEXT,
  delivery_instructions TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  carrier_name TEXT,
  carrier_contact TEXT,
  carrier_phone TEXT,
  tracking_number TEXT,
  vehicle_type TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total_pieces INTEGER,
  total_weight NUMERIC(10,2),
  weight_unit TEXT DEFAULT 'lbs',
  special_handling TEXT,
  received_by UUID REFERENCES platform_users(id),
  received_at TIMESTAMPTZ,
  condition_on_arrival TEXT,
  discrepancies JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  signature_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 4: QA CHECKPOINTS & PUNCH LISTS
-- ============================================================================

CREATE TABLE qa_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  checklist_type TEXT NOT NULL,
  department TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE qa_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  checklist_id UUID REFERENCES qa_checklists(id),
  checkpoint_name TEXT NOT NULL,
  checkpoint_type TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ,
  completed_time TIMESTAMPTZ,
  status qa_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES platform_users(id),
  completed_by UUID REFERENCES platform_users(id),
  items_checked JSONB DEFAULT '[]'::jsonb,
  items_passed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  items_total INTEGER DEFAULT 0,
  pass_percentage NUMERIC(5,2),
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  signature_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE punch_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  due_date DATE,
  assigned_to UUID REFERENCES platform_users(id),
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  closed_by UUID REFERENCES platform_users(id),
  closed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE punch_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punch_list_id UUID NOT NULL REFERENCES punch_lists(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL,
  category TEXT,
  location TEXT,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES platform_users(id),
  due_date DATE,
  completed_by UUID REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ,
  verified_by UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ,
  photos_before JSONB DEFAULT '[]'::jsonb,
  photos_after JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 5: KNOWLEDGE BASE & SOPs
-- ============================================================================

CREATE TABLE knowledge_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  document_type kb_document_type NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  content_format TEXT DEFAULT 'markdown',
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  visibility TEXT DEFAULT 'organization',
  allowed_roles JSONB DEFAULT '[]'::jsonb,
  allowed_departments JSONB DEFAULT '[]'::jsonb,
  author_id UUID NOT NULL REFERENCES platform_users(id),
  reviewer_id UUID REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  related_articles JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  review_interval_days INTEGER,
  next_review_date DATE,
  last_reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE knowledge_article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  change_summary TEXT,
  changed_by UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 6: BACKGROUND CHECKS
-- ============================================================================

CREATE TABLE background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES workforce_employees(id) ON DELETE SET NULL,
  check_type TEXT NOT NULL,
  provider TEXT,
  provider_reference TEXT,
  status background_check_status NOT NULL DEFAULT 'pending',
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  submitted_date DATE,
  completed_date DATE,
  expiration_date DATE,
  result TEXT,
  result_details JSONB DEFAULT '{}'::jsonb,
  flags JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  consent_obtained BOOLEAN DEFAULT false,
  consent_date DATE,
  consent_document_url TEXT,
  requested_by UUID REFERENCES platform_users(id),
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  is_valid BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 7: FINANCIAL SETTLEMENT
-- ============================================================================

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  settlement_number TEXT NOT NULL,
  settlement_type TEXT NOT NULL,
  counterparty_id UUID,
  counterparty_type TEXT,
  counterparty_name TEXT NOT NULL,
  status settlement_status NOT NULL DEFAULT 'draft',
  currency TEXT DEFAULT 'USD',
  gross_revenue NUMERIC(14,2) DEFAULT 0,
  total_expenses NUMERIC(14,2) DEFAULT 0,
  net_revenue NUMERIC(14,2) DEFAULT 0,
  guarantee_amount NUMERIC(14,2),
  bonus_amount NUMERIC(14,2) DEFAULT 0,
  deductions NUMERIC(14,2) DEFAULT 0,
  adjustments NUMERIC(14,2) DEFAULT 0,
  final_amount NUMERIC(14,2) DEFAULT 0,
  ticket_revenue NUMERIC(14,2) DEFAULT 0,
  merchandise_revenue NUMERIC(14,2) DEFAULT 0,
  sponsorship_revenue NUMERIC(14,2) DEFAULT 0,
  other_revenue NUMERIC(14,2) DEFAULT 0,
  revenue_details JSONB DEFAULT '[]'::jsonb,
  production_expenses NUMERIC(14,2) DEFAULT 0,
  venue_expenses NUMERIC(14,2) DEFAULT 0,
  marketing_expenses NUMERIC(14,2) DEFAULT 0,
  staffing_expenses NUMERIC(14,2) DEFAULT 0,
  other_expenses NUMERIC(14,2) DEFAULT 0,
  expense_details JSONB DEFAULT '[]'::jsonb,
  payment_terms TEXT,
  payment_due_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  paid_amount NUMERIC(14,2) DEFAULT 0,
  paid_date DATE,
  prepared_by UUID REFERENCES platform_users(id),
  prepared_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  counterparty_approved BOOLEAN DEFAULT false,
  counterparty_approved_at TIMESTAMPTZ,
  counterparty_signature_url TEXT,
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  dispute_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE settlement_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(14,2) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 8: INDEXES
-- ============================================================================

CREATE INDEX idx_site_surveys_org ON site_surveys(organization_id, survey_date DESC);
CREATE INDEX idx_site_surveys_venue ON site_surveys(venue_id);
CREATE INDEX idx_technical_drawings_org ON technical_drawings(organization_id, drawing_type);
CREATE INDEX idx_spec_sheets_org ON spec_sheets(organization_id, spec_type);
CREATE INDEX idx_permits_org ON permits(organization_id, status);
CREATE INDEX idx_permits_expiration ON permits(organization_id, expiration_date) WHERE status = 'approved';
CREATE INDEX idx_deliveries_org ON deliveries(organization_id, status);
CREATE INDEX idx_deliveries_date ON deliveries(organization_id, scheduled_date);
CREATE INDEX idx_qa_checklists_org ON qa_checklists(organization_id, checklist_type);
CREATE INDEX idx_qa_checkpoints_org ON qa_checkpoints(organization_id, status);
CREATE INDEX idx_punch_lists_org ON punch_lists(organization_id, status);
CREATE INDEX idx_punch_list_items_list ON punch_list_items(punch_list_id, status);
CREATE INDEX idx_knowledge_categories_org ON knowledge_categories(organization_id, parent_id);
CREATE INDEX idx_knowledge_articles_org ON knowledge_articles(organization_id, status, document_type);
CREATE INDEX idx_knowledge_articles_fts ON knowledge_articles USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')));
CREATE INDEX idx_background_checks_org ON background_checks(organization_id, status);
CREATE INDEX idx_settlements_org ON settlements(organization_id, status);
CREATE INDEX idx_settlement_line_items_settlement ON settlement_line_items(settlement_id);

-- ============================================================================
-- SECTION 9: RLS POLICIES
-- ============================================================================

ALTER TABLE site_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_surveys_org_access ON site_surveys FOR ALL USING (org_matches(organization_id));
CREATE POLICY technical_drawings_org_access ON technical_drawings FOR ALL USING (org_matches(organization_id));
CREATE POLICY spec_sheets_org_access ON spec_sheets FOR ALL USING (org_matches(organization_id));
CREATE POLICY permits_org_access ON permits FOR ALL USING (org_matches(organization_id));
CREATE POLICY deliveries_org_access ON deliveries FOR ALL USING (org_matches(organization_id));
CREATE POLICY qa_checklists_org_access ON qa_checklists FOR ALL USING (org_matches(organization_id));
CREATE POLICY qa_checkpoints_org_access ON qa_checkpoints FOR ALL USING (org_matches(organization_id));
CREATE POLICY punch_lists_org_access ON punch_lists FOR ALL USING (org_matches(organization_id));
CREATE POLICY punch_list_items_access ON punch_list_items FOR ALL USING (EXISTS (SELECT 1 FROM punch_lists pl WHERE pl.id = punch_list_id AND org_matches(pl.organization_id)));
CREATE POLICY knowledge_categories_org_access ON knowledge_categories FOR ALL USING (org_matches(organization_id));
CREATE POLICY knowledge_articles_org_access ON knowledge_articles FOR ALL USING (org_matches(organization_id));
CREATE POLICY knowledge_article_versions_access ON knowledge_article_versions FOR ALL USING (EXISTS (SELECT 1 FROM knowledge_articles ka WHERE ka.id = article_id AND org_matches(ka.organization_id)));
CREATE POLICY background_checks_org_access ON background_checks FOR ALL USING (org_matches(organization_id));
CREATE POLICY settlements_org_access ON settlements FOR ALL USING (org_matches(organization_id));
CREATE POLICY settlement_line_items_access ON settlement_line_items FOR ALL USING (EXISTS (SELECT 1 FROM settlements s WHERE s.id = settlement_id AND org_matches(s.organization_id)));

-- ============================================================================
-- SECTION 10: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON site_surveys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON technical_drawings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON spec_sheets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON permits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON qa_checklists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON qa_checkpoints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON punch_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON punch_list_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_articles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_article_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON background_checks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON settlements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON settlement_line_items TO authenticated;

-- ============================================================================
-- SECTION 11: TRIGGERS
-- ============================================================================

CREATE TRIGGER site_surveys_updated_at BEFORE UPDATE ON site_surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER technical_drawings_updated_at BEFORE UPDATE ON technical_drawings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER spec_sheets_updated_at BEFORE UPDATE ON spec_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER permits_updated_at BEFORE UPDATE ON permits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER qa_checklists_updated_at BEFORE UPDATE ON qa_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER qa_checkpoints_updated_at BEFORE UPDATE ON qa_checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER punch_lists_updated_at BEFORE UPDATE ON punch_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER punch_list_items_updated_at BEFORE UPDATE ON punch_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER knowledge_categories_updated_at BEFORE UPDATE ON knowledge_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER background_checks_updated_at BEFORE UPDATE ON background_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
