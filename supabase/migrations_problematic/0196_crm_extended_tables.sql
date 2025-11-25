-- Migration: Extended CRM Tables
-- Description: Tables for communications, opportunities, and client management

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note', 'sms', 'chat', 'video_call')),
  direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound', 'internal')),
  subject VARCHAR(500),
  content TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  participants TEXT[],
  attachments JSONB,
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  tags TEXT[],
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMPTZ,
  follow_up_completed BOOLEAN,
  follow_up_notes TEXT,
  follow_up_completed_at TIMESTAMPTZ,
  metadata JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  type VARCHAR(30) NOT NULL CHECK (type IN ('new_business', 'upsell', 'cross_sell', 'renewal', 'expansion')),
  stage VARCHAR(30) NOT NULL CHECK (stage IN ('identified', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  value DECIMAL(14, 2) NOT NULL,
  probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
  weighted_value DECIMAL(14, 2),
  expected_close_date TIMESTAMPTZ NOT NULL,
  source VARCHAR(100),
  description TEXT,
  products TEXT[],
  competitors TEXT[],
  owner_id UUID NOT NULL REFERENCES platform_users(id),
  next_step TEXT,
  next_step_date TIMESTAMPTZ,
  loss_reason TEXT,
  closed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client health scores table
CREATE TABLE IF NOT EXISTS client_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  score_date TIMESTAMPTZ NOT NULL,
  factors JSONB,
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  churn_probability DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Renewal tracking table
CREATE TABLE IF NOT EXISTS renewal_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  contract_id UUID REFERENCES contracts(id),
  renewal_date TIMESTAMPTZ NOT NULL,
  current_value DECIMAL(14, 2) NOT NULL,
  proposed_value DECIMAL(14, 2),
  status VARCHAR(30) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'renewed', 'churned', 'downgraded')),
  owner_id UUID REFERENCES platform_users(id),
  last_contact_date TIMESTAMPTZ,
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client segments table
CREATE TABLE IF NOT EXISTS client_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  is_dynamic BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client segment members table
CREATE TABLE IF NOT EXISTS client_segment_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES client_segments(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(segment_id, contact_id)
);

-- Add last_contacted_at to contacts if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'last_contacted_at') THEN
    ALTER TABLE contacts ADD COLUMN last_contacted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_communications_contact ON communications(contact_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_occurred ON communications(occurred_at);
CREATE INDEX IF NOT EXISTS idx_communications_deal ON communications(deal_id);
CREATE INDEX IF NOT EXISTS idx_communications_follow_up ON communications(follow_up_required, follow_up_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_client_health_scores_contact ON client_health_scores(contact_id);
CREATE INDEX IF NOT EXISTS idx_renewal_tracking_contact ON renewal_tracking(contact_id);
CREATE INDEX IF NOT EXISTS idx_renewal_tracking_date ON renewal_tracking(renewal_date);
CREATE INDEX IF NOT EXISTS idx_client_segment_members_segment ON client_segment_members(segment_id);
CREATE INDEX IF NOT EXISTS idx_client_segment_members_contact ON client_segment_members(contact_id);

-- RLS Policies
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_segment_members ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY communications_view ON communications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY opportunities_view ON opportunities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY client_health_scores_view ON client_health_scores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY renewal_tracking_view ON renewal_tracking FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY client_segments_view ON client_segments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY client_segment_members_view ON client_segment_members FOR SELECT USING (auth.uid() IS NOT NULL);

-- Manage policies
CREATE POLICY communications_manage ON communications FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY opportunities_manage ON opportunities FOR ALL USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY renewal_tracking_manage ON renewal_tracking FOR ALL USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

-- Function to calculate client health score
CREATE OR REPLACE FUNCTION calculate_client_health_score(p_contact_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 50;
  v_last_contact TIMESTAMPTZ;
  v_open_opportunities INTEGER;
  v_recent_communications INTEGER;
  v_revenue DECIMAL;
BEGIN
  -- Get last contact date
  SELECT last_contacted_at INTO v_last_contact
  FROM contacts WHERE id = p_contact_id;

  -- Recency score (max 25 points)
  IF v_last_contact IS NOT NULL THEN
    IF v_last_contact > NOW() - INTERVAL '7 days' THEN
      v_score := v_score + 25;
    ELSIF v_last_contact > NOW() - INTERVAL '30 days' THEN
      v_score := v_score + 15;
    ELSIF v_last_contact > NOW() - INTERVAL '90 days' THEN
      v_score := v_score + 5;
    ELSE
      v_score := v_score - 10;
    END IF;
  END IF;

  -- Communication frequency (max 15 points)
  SELECT COUNT(*) INTO v_recent_communications
  FROM communications
  WHERE contact_id = p_contact_id
    AND occurred_at > NOW() - INTERVAL '30 days';

  IF v_recent_communications >= 5 THEN
    v_score := v_score + 15;
  ELSIF v_recent_communications >= 2 THEN
    v_score := v_score + 10;
  ELSIF v_recent_communications >= 1 THEN
    v_score := v_score + 5;
  END IF;

  -- Open opportunities (max 10 points)
  SELECT COUNT(*) INTO v_open_opportunities
  FROM opportunities
  WHERE contact_id = p_contact_id
    AND stage NOT IN ('closed_won', 'closed_lost');

  IF v_open_opportunities > 0 THEN
    v_score := v_score + 10;
  END IF;

  RETURN LEAST(100, GREATEST(0, v_score));
END;
$$ LANGUAGE plpgsql;
