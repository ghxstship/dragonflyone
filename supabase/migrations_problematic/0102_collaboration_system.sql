-- Migration: Collaboration System
-- Description: Tables for comments, mentions, activity feeds, and team collaboration

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('project', 'task', 'asset', 'event', 'ticket', 'order', 'document', 'invoice', 'contract', 'crew_member', 'vendor')),
  resource_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES platform_users(id),
  content TEXT NOT NULL,
  content_html TEXT,
  attachments JSONB,
  mentions UUID[],
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  reactions JSONB DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_mentions ON comments USING gin(mentions);

-- Activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  actor_id UUID NOT NULL REFERENCES platform_users(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'commented', 'assigned', 'unassigned', 'completed', 'approved', 'rejected', 'shared', 'mentioned', 'uploaded', 'downloaded', 'viewed', 'archived', 'restored', 'moved', 'copied', 'linked', 'unlinked')),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  resource_name TEXT,
  target_type TEXT,
  target_id UUID,
  target_name TEXT,
  metadata JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_org ON activity_feed(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor ON activity_feed(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_resource ON activity_feed(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at);

-- Mentions table
CREATE TABLE IF NOT EXISTS mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES platform_users(id),
  mentioned_by_id UUID NOT NULL REFERENCES platform_users(id),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentions_user ON mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_mentions_unread ON mentions(mentioned_user_id, is_read) WHERE is_read = FALSE;

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebrate', 'support', 'insightful', 'curious', 'thumbs_up', 'thumbs_down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type),
  UNIQUE(activity_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_comment ON reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- Shared items table
CREATE TABLE IF NOT EXISTS shared_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  shared_by_id UUID NOT NULL REFERENCES platform_users(id),
  shared_with_id UUID REFERENCES platform_users(id),
  shared_with_team_id UUID,
  shared_with_email TEXT,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit', 'admin')),
  share_link TEXT UNIQUE,
  link_expires_at TIMESTAMPTZ,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  access_count INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shared_items_resource ON shared_items(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_shared_by ON shared_items(shared_by_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_shared_with ON shared_items(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_link ON shared_items(share_link);

-- Bookmarks/Favorites table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  resource_name TEXT,
  folder TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource ON bookmarks(resource_type, resource_id);

-- Collaboration sessions table (for real-time collaboration)
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  session_token TEXT NOT NULL UNIQUE,
  cursor_position JSONB,
  selection JSONB,
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_resource ON collaboration_sessions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_user ON collaboration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_active ON collaboration_sessions(resource_type, resource_id, is_active) WHERE is_active = TRUE;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_org_id UUID,
  p_actor_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_resource_name TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_target_name TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_feed (
    organization_id, actor_id, action, resource_type, resource_id, 
    resource_name, target_type, target_id, target_name, metadata
  ) VALUES (
    p_org_id, p_actor_id, p_action, p_resource_type, p_resource_id,
    p_resource_name, p_target_type, p_target_id, p_target_name, p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Function to process mentions in comment
CREATE OR REPLACE FUNCTION process_comment_mentions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.mentions IS NOT NULL AND array_length(NEW.mentions, 1) > 0 THEN
    INSERT INTO mentions (comment_id, mentioned_user_id, mentioned_by_id, resource_type, resource_id)
    SELECT NEW.id, unnest(NEW.mentions), NEW.author_id, NEW.resource_type, NEW.resource_id;
    
    -- Create notifications for mentioned users
    INSERT INTO notifications (user_id, type, title, message, data, priority)
    SELECT 
      unnest(NEW.mentions),
      'mention',
      'You were mentioned in a comment',
      SUBSTRING(NEW.content FROM 1 FOR 100),
      jsonb_build_object('comment_id', NEW.id, 'resource_type', NEW.resource_type, 'resource_id', NEW.resource_id),
      'medium';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comment_mentions_trigger ON comments;
CREATE TRIGGER comment_mentions_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION process_comment_mentions();

-- Function to update comment reaction counts
CREATE OR REPLACE FUNCTION update_comment_reactions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.comment_id IS NOT NULL THEN
    UPDATE comments SET
      reactions = (
        SELECT jsonb_object_agg(reaction_type, cnt)
        FROM (
          SELECT reaction_type, COUNT(*) as cnt
          FROM reactions
          WHERE comment_id = NEW.comment_id
          GROUP BY reaction_type
        ) r
      ),
      updated_at = NOW()
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' AND OLD.comment_id IS NOT NULL THEN
    UPDATE comments SET
      reactions = COALESCE((
        SELECT jsonb_object_agg(reaction_type, cnt)
        FROM (
          SELECT reaction_type, COUNT(*) as cnt
          FROM reactions
          WHERE comment_id = OLD.comment_id
          GROUP BY reaction_type
        ) r
      ), '{}'),
      updated_at = NOW()
    WHERE id = OLD.comment_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS reaction_count_trigger ON reactions;
CREATE TRIGGER reaction_count_trigger
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reactions();

-- RLS policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON comments TO authenticated;
GRANT SELECT, INSERT ON activity_feed TO authenticated;
GRANT SELECT, INSERT, UPDATE ON mentions TO authenticated;
GRANT SELECT, INSERT, DELETE ON reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shared_items TO authenticated;
GRANT SELECT, INSERT, DELETE ON bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON collaboration_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION log_activity(UUID, UUID, TEXT, TEXT, UUID, TEXT, TEXT, UUID, TEXT, JSONB) TO authenticated;
