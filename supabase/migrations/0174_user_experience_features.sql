-- Migration: User Experience Features (Month 9-10)
-- Description: Tables for workflows, e-signatures, CRM pipeline, knowledge base, crew performance, and loyalty

-- Workflows
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  trigger JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active);

-- Workflow executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  trigger_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  started_by UUID REFERENCES platform_users(id)
);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

-- Documents (e-signature)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  deal_id UUID REFERENCES deals(id),
  expiration_date TIMESTAMPTZ,
  reminder_days INT DEFAULT 3,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'completed', 'declined', 'voided', 'expired')),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);

-- Document signers
CREATE TABLE IF NOT EXISTS document_signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  signing_order INT DEFAULT 1,
  access_token TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined')),
  signed_at TIMESTAMPTZ,
  signature_data TEXT,
  signature_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_signers_document ON document_signers(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signers_email ON document_signers(email);
CREATE INDEX IF NOT EXISTS idx_document_signers_token ON document_signers(access_token);

-- Document fields
CREATE TABLE IF NOT EXISTS document_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL,
  page INT NOT NULL,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  width NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  signer_index INT NOT NULL,
  required BOOLEAN DEFAULT true,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_document_fields_document ON document_fields(document_id);

-- Document audit trail
CREATE TABLE IF NOT EXISTS document_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_audit_trail_document ON document_audit_trail(document_id);

-- Sales forecasts
CREATE TABLE IF NOT EXISTS sales_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  categories JSONB,
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_forecasts_period ON sales_forecasts(period);

-- Deal stage history
CREATE TABLE IF NOT EXISTS deal_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id),
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES platform_users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal ON deal_stage_history(deal_id);

-- Knowledge base categories
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES kb_categories(id),
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_categories_parent ON kb_categories(parent_id);

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES kb_categories(id),
  tags TEXT[],
  is_sop BOOLEAN DEFAULT false,
  sop_type TEXT,
  department TEXT,
  access_level TEXT DEFAULT 'internal',
  attachments TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version INT DEFAULT 1,
  change_notes TEXT,
  view_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES platform_users(id),
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON kb_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON kb_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_sop ON kb_articles(is_sop);

-- Knowledge base article versions
CREATE TABLE IF NOT EXISTS kb_article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id),
  version INT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_article_versions_article ON kb_article_versions(article_id);

-- Knowledge base feedback
CREATE TABLE IF NOT EXISTS kb_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES kb_articles(id),
  user_id UUID REFERENCES platform_users(id),
  helpful BOOLEAN NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_article_feedback_article ON kb_article_feedback(article_id);

-- Crew performance reviews
CREATE TABLE IF NOT EXISTS crew_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES platform_users(id),
  project_id UUID NOT NULL REFERENCES compvss_projects(id),
  reviewer_id UUID NOT NULL REFERENCES platform_users(id),
  overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  categories JSONB,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  comments TEXT,
  would_rehire BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_performance_reviews_crew ON crew_performance_reviews(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_performance_reviews_project ON crew_performance_reviews(project_id);

-- Crew performance summary
CREATE TABLE IF NOT EXISTS crew_performance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  average_rating NUMERIC(3,2),
  total_projects INT DEFAULT 0,
  rehire_rate NUMERIC(5,2),
  on_time_rate NUMERIC(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_performance_summary_crew ON crew_performance_summary(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_performance_summary_rating ON crew_performance_summary(average_rating);

-- Crew skill endorsements
CREATE TABLE IF NOT EXISTS crew_skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES platform_users(id),
  skill TEXT NOT NULL,
  notes TEXT,
  endorsed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_skill_endorsements_crew ON crew_skill_endorsements(crew_id);

-- Crew badges
CREATE TABLE IF NOT EXISTS crew_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES platform_users(id),
  badge_type TEXT NOT NULL,
  reason TEXT,
  project_id UUID REFERENCES compvss_projects(id),
  awarded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_badges_crew ON crew_badges(crew_id);

-- Crew performance goals
CREATE TABLE IF NOT EXISTS crew_performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES platform_users(id),
  goals JSONB NOT NULL,
  period TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  set_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_performance_goals_crew ON crew_performance_goals(crew_id);

-- Loyalty tiers
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_points INT NOT NULL,
  benefits JSONB,
  multiplier NUMERIC(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_points ON loyalty_tiers(min_points);

-- Loyalty accounts
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  points_balance INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  tier_id UUID REFERENCES loyalty_tiers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_user ON loyalty_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tier ON loyalty_accounts(tier_id);

-- Loyalty rewards
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  reward_type TEXT NOT NULL,
  value NUMERIC(10,2),
  quantity_available INT,
  expiration_days INT,
  terms TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_points ON loyalty_rewards(points_required);

-- Loyalty transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redemption', 'bonus', 'adjustment', 'expiry')),
  points INT NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);

-- Loyalty redemptions
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  reward_id UUID NOT NULL REFERENCES loyalty_rewards(id),
  points_spent INT NOT NULL,
  redemption_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_user ON loyalty_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_code ON loyalty_redemptions(redemption_code);

-- Add review_status to crew_assignments
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending';

-- Functions
CREATE OR REPLACE FUNCTION increment_helpful_count(p_article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE kb_articles
  SET helpful_count = helpful_count + 1
  WHERE id = p_article_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_not_helpful_count(p_article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE kb_articles
  SET not_helpful_count = not_helpful_count + 1
  WHERE id = p_article_id;
END;
$$;

-- RLS policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_performance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE ON workflow_executions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON document_signers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON document_fields TO authenticated;
GRANT SELECT, INSERT ON document_audit_trail TO authenticated;
GRANT SELECT, INSERT ON sales_forecasts TO authenticated;
GRANT SELECT, INSERT ON deal_stage_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kb_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kb_articles TO authenticated;
GRANT SELECT, INSERT ON kb_article_versions TO authenticated;
GRANT SELECT, INSERT ON kb_article_feedback TO authenticated;
GRANT SELECT, INSERT ON crew_performance_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crew_performance_summary TO authenticated;
GRANT SELECT, INSERT ON crew_skill_endorsements TO authenticated;
GRANT SELECT, INSERT ON crew_badges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crew_performance_goals TO authenticated;
GRANT SELECT ON loyalty_tiers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON loyalty_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON loyalty_rewards TO authenticated;
GRANT SELECT, INSERT ON loyalty_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON loyalty_redemptions TO authenticated;
GRANT EXECUTE ON FUNCTION increment_helpful_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_not_helpful_count(UUID) TO authenticated;

-- Insert default loyalty tiers
INSERT INTO loyalty_tiers (name, min_points, multiplier, benefits) VALUES
('Bronze', 0, 1.0, '{"perks": ["Member pricing", "Birthday bonus"]}'),
('Silver', 1000, 1.25, '{"perks": ["Member pricing", "Birthday bonus", "Early access", "10% bonus points"]}'),
('Gold', 5000, 1.5, '{"perks": ["Member pricing", "Birthday bonus", "Early access", "25% bonus points", "Priority support"]}'),
('Platinum', 15000, 2.0, '{"perks": ["Member pricing", "Birthday bonus", "VIP early access", "50% bonus points", "Dedicated support", "Exclusive events"]}')
ON CONFLICT DO NOTHING;
