-- 0059_version_control.sql
-- Version control and change tracking for critical entities

-- Entity versions table
CREATE TABLE IF NOT EXISTS entity_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  version_number integer NOT NULL,
  snapshot jsonb NOT NULL,
  change_summary text,
  changed_fields text[],
  changed_by uuid REFERENCES auth.users(id),
  changed_by_name text,
  change_type text NOT NULL, -- created, updated, deleted, restored
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, version_number)
);

-- Change requests (approval workflow)
CREATE TABLE IF NOT EXISTS change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  requested_by uuid REFERENCES auth.users(id),
  requested_by_name text,
  request_type text NOT NULL, -- update, delete
  current_state jsonb,
  proposed_changes jsonb NOT NULL,
  justification text,
  status text DEFAULT 'pending', -- pending, approved, rejected, cancelled
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Field-level change history
CREATE TABLE IF NOT EXISTS field_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entity_versions_entity ON entity_versions(entity_type, entity_id, version_number DESC);
CREATE INDEX idx_entity_versions_org ON entity_versions(organization_id);
CREATE INDEX idx_change_requests_entity ON change_requests(entity_type, entity_id);
CREATE INDEX idx_change_requests_status ON change_requests(status, created_at);
CREATE INDEX idx_field_history_entity ON field_history(entity_type, entity_id, field_name);

-- RLS policies
ALTER TABLE entity_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY entity_versions_select ON entity_versions
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY change_requests_select ON change_requests
  FOR SELECT USING (
    org_matches(organization_id) OR
    requested_by = auth.uid()
  );

CREATE POLICY change_requests_insert ON change_requests
  FOR INSERT WITH CHECK (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY change_requests_update ON change_requests
  FOR UPDATE USING (
    org_matches(organization_id) AND
    (requested_by = auth.uid() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  );

CREATE POLICY field_history_select ON field_history
  FOR SELECT USING (true); -- Public for audit purposes

-- Create version snapshot
CREATE OR REPLACE FUNCTION create_version_snapshot(
  p_org_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_snapshot jsonb,
  p_change_type text,
  p_change_summary text DEFAULT NULL,
  p_changed_fields text[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_number integer;
  v_version_id uuid;
  v_user_name text;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM entity_versions
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id;
  
  -- Get user name
  SELECT COALESCE(first_name || ' ' || last_name, email)
  INTO v_user_name
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Insert version
  INSERT INTO entity_versions (
    organization_id, entity_type, entity_id, version_number,
    snapshot, change_summary, changed_fields, changed_by, changed_by_name, change_type
  ) VALUES (
    p_org_id, p_entity_type, p_entity_id, v_version_number,
    p_snapshot, p_change_summary, p_changed_fields, auth.uid(), v_user_name, p_change_type
  ) RETURNING id INTO v_version_id;
  
  RETURN v_version_id;
END;
$$;

-- Get version history
CREATE OR REPLACE FUNCTION get_version_history(
  p_entity_type text,
  p_entity_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  version_number integer,
  change_type text,
  change_summary text,
  changed_by_name text,
  changed_fields text[],
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ev.version_number,
    ev.change_type,
    ev.change_summary,
    ev.changed_by_name,
    ev.changed_fields,
    ev.created_at
  FROM entity_versions ev
  WHERE ev.entity_type = p_entity_type
    AND ev.entity_id = p_entity_id
  ORDER BY ev.version_number DESC
  LIMIT p_limit;
END;
$$;

-- Compare versions
CREATE OR REPLACE FUNCTION compare_versions(
  p_entity_type text,
  p_entity_id uuid,
  p_version_1 integer,
  p_version_2 integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_snapshot_1 jsonb;
  v_snapshot_2 jsonb;
  v_diff jsonb;
BEGIN
  SELECT snapshot INTO v_snapshot_1
  FROM entity_versions
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND version_number = p_version_1;
  
  SELECT snapshot INTO v_snapshot_2
  FROM entity_versions
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND version_number = p_version_2;
  
  -- Simple diff (in production, use more sophisticated JSON diff)
  SELECT jsonb_build_object(
    'version_1', v_snapshot_1,
    'version_2', v_snapshot_2
  ) INTO v_diff;
  
  RETURN v_diff;
END;
$$;

-- Create change request
CREATE OR REPLACE FUNCTION create_change_request(
  p_org_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_request_type text,
  p_proposed_changes jsonb,
  p_justification text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id uuid;
  v_user_name text;
BEGIN
  SELECT COALESCE(first_name || ' ' || last_name, email)
  INTO v_user_name
  FROM auth.users
  WHERE id = auth.uid();
  
  INSERT INTO change_requests (
    organization_id, entity_type, entity_id, requested_by, requested_by_name,
    request_type, proposed_changes, justification
  ) VALUES (
    p_org_id, p_entity_type, p_entity_id, auth.uid(), v_user_name,
    p_request_type, p_proposed_changes, p_justification
  ) RETURNING id INTO v_request_id;
  
  -- Create notification for admins
  PERFORM create_notification(
    NULL, -- will notify all admins
    p_org_id,
    'change_request_created',
    'New Change Request',
    'A change request needs review',
    'info',
    '/admin/change-requests/' || v_request_id,
    'Review Request',
    'change_request',
    v_request_id
  );
  
  RETURN v_request_id;
END;
$$;

GRANT SELECT ON entity_versions TO authenticated;
GRANT SELECT ON change_requests TO authenticated;
GRANT SELECT ON field_history TO authenticated;
GRANT EXECUTE ON FUNCTION create_version_snapshot TO authenticated;
GRANT EXECUTE ON FUNCTION get_version_history TO authenticated;
GRANT EXECUTE ON FUNCTION compare_versions TO authenticated;
GRANT EXECUTE ON FUNCTION create_change_request TO authenticated;

COMMENT ON TABLE entity_versions IS 'Version control snapshots for entities';
COMMENT ON TABLE change_requests IS 'Change approval workflow requests';
COMMENT ON TABLE field_history IS 'Field-level change tracking';
COMMENT ON FUNCTION create_version_snapshot IS 'Creates a version snapshot of an entity';
COMMENT ON FUNCTION get_version_history IS 'Retrieves version history for an entity';
COMMENT ON FUNCTION compare_versions IS 'Compares two versions of an entity';
