-- =============================================================================
-- TASK TEMPLATES TABLE
-- Reusable templates for common production tasks
-- =============================================================================

-- Create task_templates table
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'other' CHECK (task_type IN ('setup', 'rehearsal', 'performance', 'teardown', 'meeting', 'other')),
  default_priority TEXT NOT NULL DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'critical')),
  default_duration_hours NUMERIC,
  department TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,
  dependencies_template JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_templates_task_type ON task_templates(task_type);
CREATE INDEX IF NOT EXISTS idx_task_templates_is_active ON task_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_task_templates_department ON task_templates(department);

-- Enable RLS
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop and recreate to be idempotent)
DROP POLICY IF EXISTS "task_templates_select_policy" ON task_templates;
CREATE POLICY "task_templates_select_policy" ON task_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "task_templates_insert_policy" ON task_templates;
CREATE POLICY "task_templates_insert_policy" ON task_templates
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "task_templates_update_policy" ON task_templates;
CREATE POLICY "task_templates_update_policy" ON task_templates
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "task_templates_delete_policy" ON task_templates;
CREATE POLICY "task_templates_delete_policy" ON task_templates
  FOR DELETE USING (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS set_task_templates_updated_at ON task_templates;
CREATE TRIGGER set_task_templates_updated_at
  BEFORE UPDATE ON task_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some seed data
INSERT INTO task_templates (name, description, task_type, default_priority, default_duration_hours, department, is_active, checklist) VALUES
  ('Stage Setup Checklist', 'Standard checklist for stage setup before events', 'setup', 'high', 4, 'Production', true, '["Verify stage dimensions", "Check electrical connections", "Test lighting rigs", "Sound check", "Safety inspection"]'::jsonb),
  ('Venue Teardown', 'Post-event venue breakdown procedure', 'teardown', 'medium', 3, 'Operations', true, '["Clear stage equipment", "Pack cables and gear", "Clean venue", "Final walkthrough", "Lock up"]'::jsonb),
  ('Sound Check', 'Pre-show sound check procedure', 'rehearsal', 'high', 2, 'Audio', true, '["Test main speakers", "Check monitors", "Verify microphone levels", "Test backup systems"]'::jsonb),
  ('Pre-Show Meeting', 'Team briefing before event start', 'meeting', 'medium', 1, 'All Departments', true, '["Review run of show", "Confirm positions", "Emergency procedures review", "Q&A"]'::jsonb),
  ('VIP Setup', 'VIP area preparation', 'setup', 'high', 2, 'Hospitality', true, '["Arrange seating", "Stock refreshments", "Check access credentials", "Brief staff"]'::jsonb)
ON CONFLICT DO NOTHING;
