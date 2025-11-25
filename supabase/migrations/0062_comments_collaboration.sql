-- 0057_comments_collaboration.sql
-- Comments and collaboration system for any entity

-- Comments table (universal commenting system)
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type text NOT NULL, -- project, task, budget, vendor, etc.
  resource_id uuid NOT NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  content text NOT NULL,
  mentions uuid[], -- array of mentioned user IDs
  attachments jsonb DEFAULT '[]'::jsonb, -- array of attachment metadata
  is_edited boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(content) > 0 AND length(content) <= 10000)
);

-- Comment reactions (likes, emoji reactions)
CREATE TABLE IF NOT EXISTS comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL, -- like, love, laugh, celebrate, etc.
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Mentions tracking
CREATE TABLE IF NOT EXISTS mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, mentioned_user_id)
);

-- @mentions notifications
CREATE TABLE IF NOT EXISTS at_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioning_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  context text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_resource ON comments(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX idx_mentions_user ON mentions(mentioned_user_id, is_read);
CREATE INDEX idx_at_mentions_user ON at_mentions(mentioned_user_id, is_read);

-- RLS policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE at_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY comments_select ON comments
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY comments_insert ON comments
  FOR INSERT WITH CHECK (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY comments_update ON comments
  FOR UPDATE USING (
    org_matches(organization_id) AND
    (author_id = auth.uid() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  );

CREATE POLICY comments_delete ON comments
  FOR DELETE USING (
    org_matches(organization_id) AND
    (author_id = auth.uid() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  );

CREATE POLICY comment_reactions_all ON comment_reactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM comments WHERE id = comment_reactions.comment_id AND org_matches(organization_id))
  );

CREATE POLICY mentions_select ON mentions
  FOR SELECT USING (mentioned_user_id = auth.uid());

CREATE POLICY at_mentions_select ON at_mentions
  FOR SELECT USING (mentioned_user_id = auth.uid() OR org_matches(organization_id));

-- Get comments for resource
CREATE OR REPLACE FUNCTION get_comments(
  p_resource_type text,
  p_resource_id uuid,
  p_include_resolved boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  author_name text,
  content text,
  is_pinned boolean,
  is_resolved boolean,
  reply_count bigint,
  reaction_count bigint,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.author_name,
    c.content,
    c.is_pinned,
    c.is_resolved,
    COUNT(DISTINCT replies.id) as reply_count,
    COUNT(DISTINCT cr.id) as reaction_count,
    c.created_at,
    c.updated_at
  FROM comments c
  LEFT JOIN comments replies ON replies.parent_comment_id = c.id
  LEFT JOIN comment_reactions cr ON cr.comment_id = c.id
  WHERE c.resource_type = p_resource_type
    AND c.resource_id = p_resource_id
    AND c.parent_comment_id IS NULL
    AND (p_include_resolved OR NOT c.is_resolved)
  GROUP BY c.id, c.author_name, c.content, c.is_pinned, c.is_resolved, c.created_at, c.updated_at
  ORDER BY c.is_pinned DESC, c.created_at DESC;
END;
$$;

-- Add comment with mention notifications
CREATE OR REPLACE FUNCTION add_comment(
  p_org_id uuid,
  p_resource_type text,
  p_resource_id uuid,
  p_content text,
  p_parent_comment_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_id uuid;
  v_author_name text;
  v_mentioned_user uuid;
BEGIN
  -- Get author name
  SELECT COALESCE(first_name || ' ' || last_name, email)
  INTO v_author_name
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Insert comment
  INSERT INTO comments (
    organization_id, resource_type, resource_id, parent_comment_id,
    author_id, author_name, content
  ) VALUES (
    p_org_id, p_resource_type, p_resource_id, p_parent_comment_id,
    auth.uid(), v_author_name, p_content
  ) RETURNING id INTO v_comment_id;
  
  -- Extract mentions from content (simple @user pattern)
  -- In production, parse @username mentions and resolve to user IDs
  
  -- Create activity
  PERFORM create_activity(
    p_org_id,
    'commented',
    p_resource_type,
    p_resource_id,
    NULL,
    NULL,
    'Added a comment',
    jsonb_build_object('comment_id', v_comment_id)
  );
  
  RETURN v_comment_id;
END;
$$;

-- Toggle comment reaction
CREATE OR REPLACE FUNCTION toggle_comment_reaction(
  p_comment_id uuid,
  p_reaction_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  -- Check if reaction exists
  SELECT EXISTS (
    SELECT 1 FROM comment_reactions
    WHERE comment_id = p_comment_id
      AND user_id = auth.uid()
      AND reaction_type = p_reaction_type
  ) INTO v_exists;
  
  IF v_exists THEN
    -- Remove reaction
    DELETE FROM comment_reactions
    WHERE comment_id = p_comment_id
      AND user_id = auth.uid()
      AND reaction_type = p_reaction_type;
    RETURN false;
  ELSE
    -- Add reaction
    INSERT INTO comment_reactions (comment_id, user_id, reaction_type)
    VALUES (p_comment_id, auth.uid(), p_reaction_type);
    RETURN true;
  END IF;
END;
$$;

-- Pin/unpin comment
CREATE OR REPLACE FUNCTION toggle_comment_pin(p_comment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_pinned boolean;
BEGIN
  UPDATE comments
  SET is_pinned = NOT is_pinned
  WHERE id = p_comment_id
  RETURNING is_pinned INTO v_is_pinned;
  
  RETURN v_is_pinned;
END;
$$;

-- Resolve/unresolve comment
CREATE OR REPLACE FUNCTION toggle_comment_resolution(p_comment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_resolved boolean;
BEGIN
  UPDATE comments
  SET 
    is_resolved = NOT is_resolved,
    resolved_by = CASE WHEN NOT is_resolved THEN auth.uid() ELSE NULL END,
    resolved_at = CASE WHEN NOT is_resolved THEN now() ELSE NULL END
  WHERE id = p_comment_id
  RETURNING is_resolved INTO v_is_resolved;
  
  RETURN v_is_resolved;
END;
$$;

GRANT SELECT ON comments TO authenticated;
GRANT SELECT ON comment_reactions TO authenticated;
GRANT SELECT ON mentions TO authenticated;
GRANT SELECT ON at_mentions TO authenticated;
GRANT EXECUTE ON FUNCTION get_comments TO authenticated;
GRANT EXECUTE ON FUNCTION add_comment TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_comment_reaction TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_comment_pin TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_comment_resolution TO authenticated;

COMMENT ON TABLE comments IS 'Universal commenting system for any entity';
COMMENT ON TABLE comment_reactions IS 'Emoji reactions on comments';
COMMENT ON TABLE mentions IS 'User mentions in comments';
COMMENT ON TABLE at_mentions IS '@mention notifications';
COMMENT ON FUNCTION add_comment IS 'Adds a comment to any resource';
COMMENT ON FUNCTION toggle_comment_reaction IS 'Toggles a reaction on a comment';
