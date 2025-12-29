-- =====================================================
-- RISKS MANAGEMENT SYSTEM
-- =====================================================
-- Enterprise risk management for ATLVS
-- Tracks operational, financial, compliance, and strategic risks

-- =====================================================
-- RISKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Risk identification
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  risk_code TEXT, -- Custom risk identifier
  
  -- Categorization
  risk_category TEXT NOT NULL CHECK (risk_category IN (
    'operational', 'financial', 'compliance', 'strategic', 'reputational',
    'technology', 'legal', 'environmental', 'human_resources', 'market'
  )),
  risk_type TEXT, -- More specific type within category
  
  -- Assessment
  probability TEXT NOT NULL CHECK (probability IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  impact TEXT NOT NULL CHECK (impact IN ('negligible', 'minor', 'moderate', 'major', 'critical')),
  
  -- Calculated risk score (1-25)
  risk_score INTEGER GENERATED ALWAYS AS (
    CASE probability
      WHEN 'very_low' THEN 1
      WHEN 'low' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'high' THEN 4
      WHEN 'very_high' THEN 5
    END *
    CASE impact
      WHEN 'negligible' THEN 1
      WHEN 'minor' THEN 2
      WHEN 'moderate' THEN 3
      WHEN 'major' THEN 4
      WHEN 'critical' THEN 5
    END
  ) STORED,
  
  -- Risk level derived from score
  risk_level TEXT GENERATED ALWAYS AS (
    CASE
      WHEN (
        CASE probability WHEN 'very_low' THEN 1 WHEN 'low' THEN 2 WHEN 'medium' THEN 3 WHEN 'high' THEN 4 WHEN 'very_high' THEN 5 END *
        CASE impact WHEN 'negligible' THEN 1 WHEN 'minor' THEN 2 WHEN 'moderate' THEN 3 WHEN 'major' THEN 4 WHEN 'critical' THEN 5 END
      ) <= 4 THEN 'low'
      WHEN (
        CASE probability WHEN 'very_low' THEN 1 WHEN 'low' THEN 2 WHEN 'medium' THEN 3 WHEN 'high' THEN 4 WHEN 'very_high' THEN 5 END *
        CASE impact WHEN 'negligible' THEN 1 WHEN 'minor' THEN 2 WHEN 'moderate' THEN 3 WHEN 'major' THEN 4 WHEN 'critical' THEN 5 END
      ) <= 9 THEN 'medium'
      WHEN (
        CASE probability WHEN 'very_low' THEN 1 WHEN 'low' THEN 2 WHEN 'medium' THEN 3 WHEN 'high' THEN 4 WHEN 'very_high' THEN 5 END *
        CASE impact WHEN 'negligible' THEN 1 WHEN 'minor' THEN 2 WHEN 'moderate' THEN 3 WHEN 'major' THEN 4 WHEN 'critical' THEN 5 END
      ) <= 16 THEN 'high'
      ELSE 'critical'
    END
  ) STORED,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN (
    'identified', 'assessed', 'mitigated', 'accepted', 'transferred', 'closed', 'realized'
  )),
  
  -- Context
  source TEXT, -- How risk was identified
  triggers TEXT[], -- Warning signs
  affected_areas TEXT[], -- Which business areas are affected
  related_project_id UUID REFERENCES projects(id),
  
  -- Financial impact
  potential_cost_min NUMERIC(15, 2),
  potential_cost_max NUMERIC(15, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Timeline
  identified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_mitigation_date DATE,
  last_review_date DATE,
  review_frequency_days INTEGER DEFAULT 90,
  
  -- Ownership
  owner_id UUID REFERENCES platform_users(id),
  department_id UUID REFERENCES departments(id),
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  notes TEXT,
  tags TEXT[]
);

-- =====================================================
-- RISK MITIGATION STRATEGIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS risk_mitigation_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  
  -- Strategy details
  strategy_type TEXT NOT NULL CHECK (strategy_type IN (
    'avoid', 'reduce', 'transfer', 'accept', 'monitor'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Implementation
  action_steps TEXT[],
  responsible_party_id UUID REFERENCES platform_users(id),
  
  -- Timeline
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN (
    'planned', 'in_progress', 'completed', 'on_hold', 'cancelled'
  )),
  
  -- Effectiveness
  expected_risk_reduction INTEGER, -- Percentage
  actual_risk_reduction INTEGER, -- Post-implementation assessment
  
  -- Cost
  implementation_cost NUMERIC(12, 2),
  ongoing_cost NUMERIC(12, 2), -- Annual or periodic cost
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  notes TEXT
);

-- =====================================================
-- RISK EVENTS TABLE (Incidents/Realizations)
-- =====================================================

CREATE TABLE IF NOT EXISTS risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'near_miss', 'partial_realization', 'full_realization', 'false_alarm'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- When it occurred
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_hours INTEGER,
  
  -- Impact
  actual_impact TEXT CHECK (actual_impact IN ('negligible', 'minor', 'moderate', 'major', 'critical')),
  financial_impact NUMERIC(15, 2),
  
  -- Response
  response_actions TEXT[],
  resolved_at TIMESTAMPTZ,
  
  -- Lessons learned
  lessons_learned TEXT,
  improvements_needed TEXT[],
  
  -- Reporting
  reported_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  notes TEXT,
  attachments TEXT[]
);

-- =====================================================
-- RISK ASSESSMENTS TABLE (Periodic Reviews)
-- =====================================================

CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  
  -- Assessment details
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessor_id UUID REFERENCES platform_users(id),
  
  -- Updated ratings
  probability TEXT NOT NULL CHECK (probability IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  impact TEXT NOT NULL CHECK (impact IN ('negligible', 'minor', 'moderate', 'major', 'critical')),
  
  -- Changes
  probability_changed BOOLEAN DEFAULT false,
  impact_changed BOOLEAN DEFAULT false,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'worsening')),
  
  -- Comments
  findings TEXT,
  recommendations TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_risks_org ON risks(organization_id);
CREATE INDEX idx_risks_category ON risks(risk_category);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_level ON risks(risk_level);
CREATE INDEX idx_risks_score ON risks(risk_score DESC);
CREATE INDEX idx_risks_owner ON risks(owner_id);
CREATE INDEX idx_risks_department ON risks(department_id);
CREATE INDEX idx_risks_project ON risks(related_project_id);
CREATE INDEX idx_risks_review ON risks(last_review_date, review_frequency_days);

CREATE INDEX idx_mitigation_risk ON risk_mitigation_strategies(risk_id);
CREATE INDEX idx_mitigation_status ON risk_mitigation_strategies(status);
CREATE INDEX idx_mitigation_responsible ON risk_mitigation_strategies(responsible_party_id);

CREATE INDEX idx_risk_events_risk ON risk_events(risk_id);
CREATE INDEX idx_risk_events_type ON risk_events(event_type);
CREATE INDEX idx_risk_events_date ON risk_events(occurred_at);

CREATE INDEX idx_risk_assessments_risk ON risk_assessments(risk_id);
CREATE INDEX idx_risk_assessments_date ON risk_assessments(assessment_date DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_mitigation_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Risks policies
CREATE POLICY "Users can view risks in their organization"
  ON risks FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage risks"
  ON risks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = risks.organization_id
      AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Mitigation strategies policies
CREATE POLICY "Users can view mitigation strategies"
  ON risk_mitigation_strategies FOR SELECT
  TO authenticated
  USING (
    risk_id IN (
      SELECT id FROM risks
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins and risk owners can manage strategies"
  ON risk_mitigation_strategies FOR ALL
  TO authenticated
  USING (
    risk_id IN (
      SELECT id FROM risks
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users 
        WHERE id = auth.uid()
        AND (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN') OR id = risks.owner_id)
      )
    )
  );

-- Risk events policies
CREATE POLICY "Users can view risk events"
  ON risk_events FOR SELECT
  TO authenticated
  USING (
    risk_id IN (
      SELECT id FROM risks
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can report risk events"
  ON risk_events FOR INSERT
  TO authenticated
  WITH CHECK (
    risk_id IN (
      SELECT id FROM risks
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

-- Risk assessments policies
CREATE POLICY "Users can view assessments"
  ON risk_assessments FOR SELECT
  TO authenticated
  USING (
    risk_id IN (
      SELECT id FROM risks
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can create assessments"
  ON risk_assessments FOR INSERT
  TO authenticated
  WITH CHECK (
    risk_id IN (
      SELECT id FROM risks
      WHERE organization_id IN (
        SELECT organization_id FROM platform_users 
        WHERE id = auth.uid()
        AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
      )
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get risk heat map data
CREATE OR REPLACE FUNCTION get_risk_heatmap(org_id UUID)
RETURNS TABLE (
  probability TEXT,
  impact TEXT,
  count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.probability,
    r.impact,
    COUNT(*)::INTEGER as count
  FROM risks r
  WHERE r.organization_id = org_id
    AND r.status NOT IN ('closed', 'realized')
  GROUP BY r.probability, r.impact
  ORDER BY r.probability, r.impact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get risks requiring review
CREATE OR REPLACE FUNCTION get_risks_due_for_review(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  risk_id UUID,
  title TEXT,
  last_review_date DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.last_review_date,
    (CURRENT_DATE - (r.last_review_date + r.review_frequency_days))::INTEGER as days_overdue
  FROM risks r
  WHERE r.status NOT IN ('closed', 'realized')
    AND (
      r.last_review_date IS NULL
      OR (r.last_review_date + r.review_frequency_days) <= (CURRENT_DATE + days_ahead)
    )
  ORDER BY days_overdue DESC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate overall risk exposure
CREATE OR REPLACE FUNCTION calculate_risk_exposure(org_id UUID)
RETURNS TABLE (
  total_risks INTEGER,
  critical_risks INTEGER,
  high_risks INTEGER,
  medium_risks INTEGER,
  low_risks INTEGER,
  total_potential_cost NUMERIC,
  risks_overdue_review INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE risk_level = 'critical')::INTEGER,
    COUNT(*) FILTER (WHERE risk_level = 'high')::INTEGER,
    COUNT(*) FILTER (WHERE risk_level = 'medium')::INTEGER,
    COUNT(*) FILTER (WHERE risk_level = 'low')::INTEGER,
    COALESCE(SUM(potential_cost_max), 0),
    COUNT(*) FILTER (
      WHERE last_review_date IS NULL 
      OR (last_review_date + review_frequency_days) < CURRENT_DATE
    )::INTEGER
  FROM risks
  WHERE organization_id = org_id
    AND status NOT IN ('closed', 'realized');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE TRIGGER update_risks_timestamp
  BEFORE UPDATE ON risks
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

CREATE TRIGGER update_mitigation_timestamp
  BEFORE UPDATE ON risk_mitigation_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

-- Update risk when new assessment is created
CREATE OR REPLACE FUNCTION update_risk_from_assessment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE risks
  SET 
    probability = NEW.probability,
    impact = NEW.impact,
    last_review_date = NEW.assessment_date,
    updated_at = NOW()
  WHERE id = NEW.risk_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apply_assessment_to_risk
  AFTER INSERT ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_from_assessment();

COMMENT ON TABLE risks IS 'Enterprise risk register tracking operational, financial, and strategic risks';
COMMENT ON TABLE risk_mitigation_strategies IS 'Action plans to reduce or eliminate identified risks';
COMMENT ON TABLE risk_events IS 'Incidents and near-misses related to identified risks';
COMMENT ON TABLE risk_assessments IS 'Periodic reviews and reassessments of risk ratings';
