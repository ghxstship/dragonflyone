-- Migration: COMPVSS Advanced Features
-- Description: Tables for cue system, safety compliance, and post-event reporting

-- Cues for run of show
CREATE TABLE IF NOT EXISTS cues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_of_show_id UUID NOT NULL REFERENCES run_of_show(id),
  cue_number TEXT NOT NULL,
  cue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  trigger_type TEXT DEFAULT 'manual',
  trigger_value TEXT,
  duration_seconds INT,
  notes TEXT,
  department TEXT,
  assigned_to UUID REFERENCES platform_users(id),
  dependencies UUID[],
  is_standby BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'standby', 'executed', 'skipped')),
  sort_order INT NOT NULL,
  executed_at TIMESTAMPTZ,
  executed_by UUID REFERENCES platform_users(id),
  standby_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cues_ros ON cues(run_of_show_id);
CREATE INDEX IF NOT EXISTS idx_cues_department ON cues(department);
CREATE INDEX IF NOT EXISTS idx_cues_sort ON cues(sort_order);

-- Live show status
CREATE TABLE IF NOT EXISTS live_show_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_of_show_id UUID NOT NULL REFERENCES run_of_show(id) UNIQUE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'running', 'hold', 'completed', 'cancelled')),
  current_cue_id UUID REFERENCES cues(id),
  last_cue_at TIMESTAMPTZ,
  elapsed_time INT,
  hold_reason TEXT,
  hold_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  started_by UUID REFERENCES platform_users(id),
  ended_at TIMESTAMPTZ,
  ended_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_show_status_ros ON live_show_status(run_of_show_id);

-- Show logs
CREATE TABLE IF NOT EXISTS show_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_of_show_id UUID NOT NULL REFERENCES run_of_show(id),
  cue_id UUID REFERENCES cues(id),
  event_type TEXT NOT NULL,
  notes TEXT,
  logged_by UUID REFERENCES platform_users(id),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_show_logs_ros ON show_logs(run_of_show_id);
CREATE INDEX IF NOT EXISTS idx_show_logs_event ON show_logs(event_type);

-- Safety checklists
CREATE TABLE IF NOT EXISTS safety_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES compvss_projects(id),
  checklist_type TEXT NOT NULL,
  items JSONB NOT NULL,
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES platform_users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  responses JSONB,
  notes TEXT,
  completed_by UUID REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_checklists_project ON safety_checklists(project_id);
CREATE INDEX IF NOT EXISTS idx_safety_checklists_status ON safety_checklists(status);
CREATE INDEX IF NOT EXISTS idx_safety_checklists_type ON safety_checklists(checklist_type);

-- Incident reports
CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES compvss_projects(id),
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  witnesses TEXT[],
  immediate_actions TEXT,
  attachments TEXT[],
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  reported_by UUID REFERENCES platform_users(id),
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_reports_project ON incident_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON incident_reports(status);

-- Crew certifications
CREATE TABLE IF NOT EXISTS crew_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  certification_type TEXT NOT NULL,
  certification_number TEXT,
  issued_date DATE NOT NULL,
  expiration_date DATE,
  issuing_authority TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending_renewal')),
  document_url TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_certifications_user ON crew_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_certifications_type ON crew_certifications(certification_type);
CREATE INDEX IF NOT EXISTS idx_crew_certifications_expiration ON crew_certifications(expiration_date);

-- Safety briefings
CREATE TABLE IF NOT EXISTS safety_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES compvss_projects(id),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  agenda TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_briefings_project ON safety_briefings(project_id);
CREATE INDEX IF NOT EXISTS idx_safety_briefings_scheduled ON safety_briefings(scheduled_at);

-- Safety briefing attendees
CREATE TABLE IF NOT EXISTS safety_briefing_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id UUID NOT NULL REFERENCES safety_briefings(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  is_required BOOLEAN DEFAULT false,
  attended BOOLEAN DEFAULT false,
  attended_at TIMESTAMPTZ,
  UNIQUE(briefing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_safety_briefing_attendees_briefing ON safety_briefing_attendees(briefing_id);

-- Post-event reports
CREATE TABLE IF NOT EXISTS post_event_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES compvss_projects(id),
  report_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  highlights TEXT[],
  challenges TEXT[],
  recommendations TEXT[],
  metrics JSONB,
  attachments TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_event_reports_project ON post_event_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_post_event_reports_type ON post_event_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_post_event_reports_status ON post_event_reports(status);

-- Crew feedback
CREATE TABLE IF NOT EXISTS crew_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES compvss_projects(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  categories JSONB,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_feedback_project ON crew_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_feedback_user ON crew_feedback(user_id);

-- Add actual dates to compvss_projects
ALTER TABLE compvss_projects ADD COLUMN IF NOT EXISTS actual_start_date TIMESTAMPTZ;
ALTER TABLE compvss_projects ADD COLUMN IF NOT EXISTS actual_end_date TIMESTAMPTZ;

-- RLS policies
ALTER TABLE cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_show_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_briefing_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_feedback ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON cues TO authenticated;
GRANT SELECT, INSERT, UPDATE ON live_show_status TO authenticated;
GRANT SELECT, INSERT ON show_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON safety_checklists TO authenticated;
GRANT SELECT, INSERT, UPDATE ON incident_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crew_certifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON safety_briefings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON safety_briefing_attendees TO authenticated;
GRANT SELECT, INSERT, UPDATE ON post_event_reports TO authenticated;
GRANT SELECT, INSERT ON crew_feedback TO authenticated;
