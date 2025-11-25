-- 0049_activity_feeds.sql
-- Activity feed and timeline tracking system

-- Activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text,
  action text NOT NULL, -- created, updated, deleted, completed, assigned, etc.
  resource_type text NOT NULL, -- project, task, budget, vendor, etc.
  resource_id uuid NOT NULL,
  resource_name text,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_feed_org ON activity_feed(organization_id, created_at DESC);
CREATE INDEX idx_activity_feed_actor ON activity_feed(actor_id);
CREATE INDEX idx_activity_feed_resource ON activity_feed(resource_type, resource_id);
CREATE INDEX idx_activity_feed_project ON activity_feed(project_id) WHERE project_id IS NOT NULL;

-- RLS for activity feed
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_feed_select ON activity_feed
  FOR SELECT USING (
    org_matches(organization_id) AND
    (is_public = true OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  );

-- Function to create activity
CREATE OR REPLACE FUNCTION create_activity(
  p_org_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_resource_name text,
  p_project_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_is_public boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id uuid;
  v_actor_name text;
BEGIN
  -- Get actor name
  SELECT COALESCE(first_name || ' ' || last_name, email)
  INTO v_actor_name
  FROM auth.users
  WHERE id = auth.uid();
  
  INSERT INTO activity_feed (
    organization_id, actor_id, actor_name, action, resource_type,
    resource_id, resource_name, project_id, description, metadata, is_public
  ) VALUES (
    p_org_id, auth.uid(), v_actor_name, p_action, p_resource_type,
    p_resource_id, p_resource_name, p_project_id, p_description, p_metadata, p_is_public
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Get activity feed for organization
CREATE OR REPLACE FUNCTION get_activity_feed(
  p_org_id uuid,
  p_project_id uuid DEFAULT NULL,
  p_resource_type text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  actor_name text,
  action text,
  resource_type text,
  resource_name text,
  project_id uuid,
  description text,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    af.id,
    af.actor_name,
    af.action,
    af.resource_type,
    af.resource_name,
    af.project_id,
    af.description,
    af.metadata,
    af.created_at
  FROM activity_feed af
  WHERE af.organization_id = p_org_id
    AND (p_project_id IS NULL OR af.project_id = p_project_id)
    AND (p_resource_type IS NULL OR af.resource_type = p_resource_type)
    AND af.is_public = true
  ORDER BY af.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Auto-create activity on project changes
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_activity(
      NEW.organization_id,
      'created',
      'project',
      NEW.id,
      NEW.name,
      NEW.id,
      'Created project: ' || NEW.name
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      PERFORM create_activity(
        NEW.organization_id,
        'status_changed',
        'project',
        NEW.id,
        NEW.name,
        NEW.id,
        'Changed project status from ' || OLD.status || ' to ' || NEW.status
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_project_activity_trigger
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_activity();

-- Auto-create activity on task changes
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
BEGIN
  SELECT organization_id INTO v_org_id FROM projects WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  IF TG_OP = 'INSERT' THEN
    PERFORM create_activity(
      v_org_id,
      'created',
      'task',
      NEW.id,
      NEW.title,
      NEW.project_id,
      'Created task: ' || NEW.title
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      PERFORM create_activity(
        v_org_id,
        CASE WHEN NEW.status = 'completed' THEN 'completed' ELSE 'status_changed' END,
        'task',
        NEW.id,
        NEW.title,
        NEW.project_id,
        'Changed task status to ' || NEW.status
      );
    END IF;
    
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      PERFORM create_activity(
        v_org_id,
        'assigned',
        'task',
        NEW.id,
        NEW.title,
        NEW.project_id,
        'Task assigned'
      );
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_task_activity_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_activity();

GRANT SELECT ON activity_feed TO authenticated;
GRANT EXECUTE ON FUNCTION create_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_feed TO authenticated;

COMMENT ON TABLE activity_feed IS 'Activity timeline and audit trail for user-facing events';
COMMENT ON FUNCTION create_activity IS 'Creates an activity feed entry';
COMMENT ON FUNCTION get_activity_feed IS 'Retrieves activity feed with filtering';
