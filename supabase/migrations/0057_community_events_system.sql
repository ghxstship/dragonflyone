-- Migration: Community Events System
-- Description: Tables for community events, RSVPs, and group member management

-- Community events table
CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  group_id UUID REFERENCES community_groups(id),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  venue_id UUID REFERENCES venues(id),
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  attendees_count INT DEFAULT 0,
  max_attendees INT,
  organizer_id UUID REFERENCES platform_users(id),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  event_type TEXT DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'watch_party', 'pre_party', 'after_party', 'discussion', 'workshop', 'other')),
  is_virtual BOOLEAN DEFAULT false,
  virtual_link TEXT,
  cover_image TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_events_group ON community_events(group_id);
CREATE INDEX IF NOT EXISTS idx_community_events_date ON community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_community_events_status ON community_events(status);
CREATE INDEX IF NOT EXISTS idx_community_events_organizer ON community_events(organizer_id);

-- Community event RSVPs table
CREATE TABLE IF NOT EXISTS community_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  guests_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_event_rsvps_event ON community_event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_community_event_rsvps_user ON community_event_rsvps(user_id);

-- Add member_count column to community_groups if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_groups' AND column_name = 'members_count') THEN
    ALTER TABLE community_groups ADD COLUMN members_count INT DEFAULT 0;
  END IF;
END $$;

-- Community group members table (if not exists from previous migration)
CREATE TABLE IF NOT EXISTS community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Function to update attendees count
CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE community_events SET
      attendees_count = (
        SELECT COUNT(*) FROM community_event_rsvps 
        WHERE event_id = NEW.event_id AND status = 'going'
      ),
      updated_at = NOW()
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_events SET
      attendees_count = (
        SELECT COUNT(*) FROM community_event_rsvps 
        WHERE event_id = OLD.event_id AND status = 'going'
      ),
      updated_at = NOW()
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS event_attendees_count_trigger ON community_event_rsvps;
CREATE TRIGGER event_attendees_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON community_event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_event_attendees_count();

-- Function to update group members count
CREATE OR REPLACE FUNCTION update_group_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE community_groups SET
      member_count = (
        SELECT COUNT(*) FROM group_members 
        WHERE group_id = NEW.group_id AND status = 'active'
      ),
      updated_at = NOW()
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_groups SET
      member_count = (
        SELECT COUNT(*) FROM group_members 
        WHERE group_id = OLD.group_id AND status = 'active'
      ),
      updated_at = NOW()
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS group_members_count_trigger ON group_members;
CREATE TRIGGER group_members_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_members_count();

-- RLS policies
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON community_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_event_rsvps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_group_members TO authenticated;
