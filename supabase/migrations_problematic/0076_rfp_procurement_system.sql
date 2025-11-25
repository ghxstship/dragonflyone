-- Migration: RFP & Procurement System
-- Description: Tables for RFPs, proposals, vendor bids, and procurement workflows

-- RFPs table
CREATE TABLE IF NOT EXISTS rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  rfp_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  project_type TEXT,
  category TEXT,
  budget_min NUMERIC(15,2),
  budget_max NUMERIC(15,2),
  deadline TIMESTAMPTZ NOT NULL,
  submission_deadline TIMESTAMPTZ NOT NULL,
  requirements TEXT[],
  evaluation_criteria JSONB,
  attachments JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'evaluating', 'awarded', 'cancelled')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'invited', 'private')),
  invited_vendors UUID[],
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  awarded_to UUID ,
  awarded_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfps_org ON rfps(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfps_status ON rfps(status);
CREATE INDEX IF NOT EXISTS idx_rfps_deadline ON rfps(submission_deadline);

-- RFP responses/proposals table
CREATE TABLE IF NOT EXISTS rfp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL ,
  proposal_number TEXT NOT NULL,
  cover_letter TEXT,
  technical_proposal TEXT,
  pricing_proposal JSONB,
  total_price NUMERIC(15,2),
  timeline_days INT,
  attachments JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'shortlisted', 'rejected', 'awarded')),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  evaluation_notes TEXT,
  evaluated_by UUID REFERENCES platform_users(id),
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfp_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_rfp_responses_rfp ON rfp_responses(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_vendor ON rfp_responses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_status ON rfp_responses(status);

-- RFP questions table
CREATE TABLE IF NOT EXISTS rfp_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id UUID ,
  question TEXT NOT NULL,
  answer TEXT,
  is_public BOOLEAN DEFAULT true,
  asked_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ,
  answered_by UUID REFERENCES platform_users(id)
);

CREATE INDEX IF NOT EXISTS idx_rfp_questions_rfp ON rfp_questions(rfp_id);

-- Vendor qualifications table
CREATE TABLE IF NOT EXISTS vendor_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL ,
  qualification_type TEXT NOT NULL CHECK (qualification_type IN ('certification', 'license', 'insurance', 'reference', 'financial', 'experience')),
  name TEXT NOT NULL,
  description TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiration_date DATE,
  document_url TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_qualifications_vendor ON vendor_qualifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_qualifications_type ON vendor_qualifications(qualification_type);

-- Vendor ratings table
CREATE TABLE IF NOT EXISTS vendor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL ,
  project_id UUID REFERENCES projects(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  rated_by UUID NOT NULL REFERENCES platform_users(id),
  overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5),
  delivery_rating INT CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
  comments TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);

-- Generate RFP number function
CREATE OR REPLACE FUNCTION generate_rfp_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(
    CASE WHEN rfp_number ~ ('^RFP' || year_suffix || '-[0-9]+$')
    THEN CAST(SUBSTRING(rfp_number FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM rfps WHERE organization_id = org_id AND rfp_number LIKE 'RFP' || year_suffix || '-%';
  
  RETURN 'RFP' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$;

-- Generate proposal number function
CREATE OR REPLACE FUNCTION generate_proposal_number(p_rfp_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  rfp_num TEXT;
  sequence_num INT;
BEGIN
  SELECT rfp_number INTO rfp_num FROM rfps WHERE id = p_rfp_id;
  
  SELECT COALESCE(COUNT(*), 0) + 1 INTO sequence_num
  FROM rfp_responses WHERE rfp_id = p_rfp_id;
  
  RETURN rfp_num || '-P' || LPAD(sequence_num::TEXT, 2, '0');
END;
$$;

-- Update vendor average rating function
CREATE OR REPLACE FUNCTION update_vendor_average_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE vendors SET
    average_rating = (
      SELECT ROUND(AVG(overall_rating)::NUMERIC, 2)
      FROM vendor_ratings WHERE vendor_id = NEW.vendor_id
    ),
    rating_count = (
      SELECT COUNT(*) FROM vendor_ratings WHERE vendor_id = NEW.vendor_id
    ),
    updated_at = NOW()
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendor_rating_trigger ON vendor_ratings;
CREATE TRIGGER vendor_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON vendor_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_average_rating();

-- RLS policies
ALTER TABLE rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON rfps TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rfp_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rfp_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vendor_qualifications TO authenticated;
GRANT SELECT, INSERT ON vendor_ratings TO authenticated;
GRANT EXECUTE ON FUNCTION generate_rfp_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_proposal_number(UUID) TO authenticated;
