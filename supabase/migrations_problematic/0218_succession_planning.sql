-- Migration: Succession Planning System
-- Description: Track succession plans, key positions, talent pools, and development paths

-- Key positions for succession planning
CREATE TABLE IF NOT EXISTS key_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  current_holder_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  criticality_level VARCHAR(50) DEFAULT 'medium' CHECK (criticality_level IN ('critical', 'high', 'medium', 'low')),
  risk_of_vacancy VARCHAR(50) DEFAULT 'medium' CHECK (risk_of_vacancy IN ('high', 'medium', 'low')),
  impact_of_vacancy TEXT,
  required_competencies JSONB DEFAULT '[]',
  required_certifications JSONB DEFAULT '[]',
  minimum_experience_years INTEGER,
  job_description TEXT,
  salary_range JSONB DEFAULT '{}',
  succession_readiness VARCHAR(50) DEFAULT 'not_ready' CHECK (succession_readiness IN ('ready_now', 'ready_1_year', 'ready_2_years', 'not_ready')),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Succession candidates
CREATE TABLE IF NOT EXISTS succession_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES key_positions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  readiness_level VARCHAR(50) NOT NULL CHECK (readiness_level IN ('ready_now', 'ready_1_year', 'ready_2_years', 'ready_3_plus_years', 'not_suitable')),
  priority_rank INTEGER DEFAULT 1,
  strengths JSONB DEFAULT '[]',
  development_needs JSONB DEFAULT '[]',
  competency_gaps JSONB DEFAULT '[]',
  potential_rating VARCHAR(50) CHECK (potential_rating IN ('high', 'medium', 'low')),
  performance_rating VARCHAR(50) CHECK (performance_rating IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory')),
  flight_risk VARCHAR(50) DEFAULT 'low' CHECK (flight_risk IN ('high', 'medium', 'low')),
  retention_actions JSONB DEFAULT '[]',
  assessment_date DATE,
  assessed_by UUID REFERENCES platform_users(id),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'promoted', 'withdrawn', 'not_interested', 'left_company')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_id, candidate_id)
);

-- Development plans for succession candidates
CREATE TABLE IF NOT EXISTS succession_development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES succession_candidates(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  target_completion_date DATE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'on_hold', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  mentor_id UUID REFERENCES platform_users(id),
  sponsor_id UUID REFERENCES platform_users(id),
  budget DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Development activities/actions
CREATE TABLE IF NOT EXISTS succession_development_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES succession_development_plans(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'training', 'mentoring', 'coaching', 'job_rotation', 'stretch_assignment',
    'shadowing', 'certification', 'education', 'project_lead', 'committee', 'other'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  competency_addressed VARCHAR(255),
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'deferred')),
  outcome TEXT,
  evidence_url TEXT,
  cost DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Talent pools
CREATE TABLE IF NOT EXISTS talent_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pool_type VARCHAR(50) NOT NULL CHECK (pool_type IN ('high_potential', 'leadership', 'technical', 'emerging', 'executive', 'specialist')),
  criteria JSONB DEFAULT '{}',
  target_positions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Talent pool members
CREATE TABLE IF NOT EXISTS talent_pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES talent_pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  added_date DATE DEFAULT CURRENT_DATE,
  added_by UUID REFERENCES platform_users(id),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'removed', 'on_hold')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_id, user_id)
);

-- Succession reviews/assessments
CREATE TABLE IF NOT EXISTS succession_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_name VARCHAR(255) NOT NULL,
  review_date DATE NOT NULL,
  review_type VARCHAR(50) NOT NULL CHECK (review_type IN ('annual', 'quarterly', 'ad_hoc', 'emergency')),
  scope VARCHAR(50) DEFAULT 'organization' CHECK (scope IN ('organization', 'department', 'position')),
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES key_positions(id),
  participants JSONB DEFAULT '[]',
  findings TEXT,
  recommendations JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_key_positions_department ON key_positions(department_id);
CREATE INDEX IF NOT EXISTS idx_key_positions_holder ON key_positions(current_holder_id);
CREATE INDEX IF NOT EXISTS idx_key_positions_criticality ON key_positions(criticality_level);
CREATE INDEX IF NOT EXISTS idx_succession_candidates_position ON succession_candidates(position_id);
CREATE INDEX IF NOT EXISTS idx_succession_candidates_candidate ON succession_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_succession_candidates_readiness ON succession_candidates(readiness_level);
CREATE INDEX IF NOT EXISTS idx_development_plans_candidate ON succession_development_plans(candidate_id);
CREATE INDEX IF NOT EXISTS idx_development_activities_plan ON succession_development_activities(plan_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_pool ON talent_pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_members_user ON talent_pool_members(user_id);

-- RLS Policies
ALTER TABLE key_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE succession_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE succession_development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE succession_development_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE succession_reviews ENABLE ROW LEVEL SECURITY;

-- Key positions policies (HR/Admin only)
CREATE POLICY "key_positions_select" ON key_positions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "key_positions_manage" ON key_positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Succession candidates policies
CREATE POLICY "succession_candidates_select" ON succession_candidates
  FOR SELECT USING (
    candidate_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "succession_candidates_manage" ON succession_candidates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Development plans policies
CREATE POLICY "development_plans_select" ON succession_development_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM succession_candidates sc
      WHERE sc.id = candidate_id AND sc.candidate_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "development_plans_manage" ON succession_development_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Development activities policies
CREATE POLICY "development_activities_select" ON succession_development_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM succession_development_plans sdp
      JOIN succession_candidates sc ON sc.id = sdp.candidate_id
      WHERE sdp.id = plan_id AND sc.candidate_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "development_activities_manage" ON succession_development_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Talent pools policies
CREATE POLICY "talent_pools_select" ON talent_pools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "talent_pools_manage" ON talent_pools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Talent pool members policies
CREATE POLICY "talent_pool_members_select" ON talent_pool_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "talent_pool_members_manage" ON talent_pool_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Succession reviews policies
CREATE POLICY "succession_reviews_select" ON succession_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "succession_reviews_manage" ON succession_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- View for succession planning dashboard
CREATE OR REPLACE VIEW succession_dashboard AS
SELECT 
  kp.id as position_id,
  kp.title as position_title,
  kp.criticality_level,
  kp.risk_of_vacancy,
  kp.succession_readiness,
  d.name as department_name,
  holder.full_name as current_holder_name,
  (
    SELECT COUNT(*) FROM succession_candidates sc 
    WHERE sc.position_id = kp.id AND sc.status = 'active'
  ) as candidate_count,
  (
    SELECT COUNT(*) FROM succession_candidates sc 
    WHERE sc.position_id = kp.id AND sc.status = 'active' AND sc.readiness_level = 'ready_now'
  ) as ready_now_count,
  (
    SELECT json_agg(json_build_object(
      'id', sc.id,
      'name', c.full_name,
      'readiness', sc.readiness_level,
      'priority', sc.priority_rank
    ) ORDER BY sc.priority_rank)
    FROM succession_candidates sc
    JOIN platform_users c ON c.id = sc.candidate_id
    WHERE sc.position_id = kp.id AND sc.status = 'active'
    LIMIT 5
  ) as top_candidates
FROM key_positions kp
LEFT JOIN departments d ON d.id = kp.department_id
LEFT JOIN platform_users holder ON holder.id = kp.current_holder_id
WHERE kp.is_active = TRUE
ORDER BY 
  CASE kp.criticality_level 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    ELSE 4 
  END,
  kp.title;
