-- Migration: Event Templates System
-- Description: Tables for event templates, cloning, and series management

-- Event templates table
CREATE TABLE IF NOT EXISTS event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('concert', 'festival', 'conference', 'theater', 'sports', 'comedy', 'nightlife', 'experiential', 'workshop', 'custom')),
  category TEXT,
  subcategory TEXT,
  default_duration_minutes INT,
  default_capacity INT,
  default_venue_id UUID REFERENCES venues(id),
  ticket_type_config JSONB,
  pricing_config JSONB,
  addon_config JSONB,
  required_fields TEXT[],
  optional_fields TEXT[],
  default_description TEXT,
  default_terms TEXT,
  default_refund_policy TEXT,
  default_age_restriction TEXT,
  default_tags TEXT[],
  default_images JSONB,
  seo_config JSONB,
  email_config JSONB,
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  usage_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_templates_org ON event_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_templates_type ON event_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_event_templates_public ON event_templates(is_public);

-- Event series table
CREATE TABLE IF NOT EXISTS event_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  series_type TEXT NOT NULL CHECK (series_type IN ('recurring', 'tour', 'season', 'festival', 'residency')),
  template_id UUID REFERENCES event_templates(id),
  start_date DATE,
  end_date DATE,
  recurrence_rule TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  default_venue_id UUID REFERENCES venues(id),
  default_ticket_config JSONB,
  default_pricing JSONB,
  total_events INT DEFAULT 0,
  published_events INT DEFAULT 0,
  total_tickets_sold INT DEFAULT 0,
  total_revenue NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  cover_image_url TEXT,
  metadata JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_series_org ON event_series(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_series_type ON event_series(series_type);
CREATE INDEX IF NOT EXISTS idx_event_series_status ON event_series(status);

-- Event series instances (links events to series)
CREATE TABLE IF NOT EXISTS event_series_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES event_series(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  instance_number INT NOT NULL,
  instance_date DATE NOT NULL,
  is_cancelled BOOLEAN DEFAULT false,
  override_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, event_id),
  UNIQUE(series_id, instance_number)
);

CREATE INDEX IF NOT EXISTS idx_event_series_instances_series ON event_series_instances(series_id);
CREATE INDEX IF NOT EXISTS idx_event_series_instances_event ON event_series_instances(event_id);

-- Event clones tracking
CREATE TABLE IF NOT EXISTS event_clones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_event_id UUID NOT NULL REFERENCES events(id),
  cloned_event_id UUID NOT NULL REFERENCES events(id),
  clone_type TEXT NOT NULL CHECK (clone_type IN ('full', 'template', 'series')),
  cloned_fields TEXT[],
  excluded_fields TEXT[],
  cloned_by UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_clones_source ON event_clones(source_event_id);
CREATE INDEX IF NOT EXISTS idx_event_clones_cloned ON event_clones(cloned_event_id);

-- Event drafts (auto-save)
CREATE TABLE IF NOT EXISTS event_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID REFERENCES events(id),
  template_id UUID REFERENCES event_templates(id),
  draft_data JSONB NOT NULL,
  step_completed INT DEFAULT 0,
  is_complete BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_drafts_org ON event_drafts(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_drafts_user ON event_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_event_drafts_event ON event_drafts(event_id);

-- Function to clone event
CREATE OR REPLACE FUNCTION clone_event(
  p_source_event_id UUID,
  p_user_id UUID,
  p_new_date TIMESTAMPTZ DEFAULT NULL,
  p_new_name TEXT DEFAULT NULL,
  p_clone_tickets BOOLEAN DEFAULT TRUE,
  p_clone_addons BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_source_event RECORD;
  v_new_event_id UUID;
  v_ticket_type RECORD;
  v_addon RECORD;
BEGIN
  -- Get source event
  SELECT * INTO v_source_event FROM events WHERE id = p_source_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source event not found';
  END IF;
  
  -- Create new event
  INSERT INTO events (
    organization_id, venue_id, name, event_type, description, short_description,
    start_date, end_date, doors_time, show_time, timezone, status, visibility,
    age_restriction, capacity, cover_image_url, tags, categories, genres,
    refund_policy, terms_conditions, parking_info, accessibility_info,
    created_by
  )
  VALUES (
    v_source_event.organization_id,
    v_source_event.venue_id,
    COALESCE(p_new_name, v_source_event.name || ' (Copy)'),
    v_source_event.event_type,
    v_source_event.description,
    v_source_event.short_description,
    COALESCE(p_new_date, v_source_event.start_date + INTERVAL '7 days'),
    CASE WHEN v_source_event.end_date IS NOT NULL 
      THEN COALESCE(p_new_date, v_source_event.start_date + INTERVAL '7 days') + (v_source_event.end_date - v_source_event.start_date)
      ELSE NULL END,
    v_source_event.doors_time,
    v_source_event.show_time,
    v_source_event.timezone,
    'draft',
    v_source_event.visibility,
    v_source_event.age_restriction,
    v_source_event.capacity,
    v_source_event.cover_image_url,
    v_source_event.tags,
    v_source_event.categories,
    v_source_event.genres,
    v_source_event.refund_policy,
    v_source_event.terms_conditions,
    v_source_event.parking_info,
    v_source_event.accessibility_info,
    p_user_id
  )
  RETURNING id INTO v_new_event_id;
  
  -- Clone ticket types
  IF p_clone_tickets THEN
    FOR v_ticket_type IN SELECT * FROM ticket_types WHERE event_id = p_source_event_id LOOP
      INSERT INTO ticket_types (
        event_id, name, description, price, original_price, quantity, available,
        min_per_order, max_per_order, ticket_category, section, includes,
        restrictions, visibility, sort_order, is_active
      )
      VALUES (
        v_new_event_id, v_ticket_type.name, v_ticket_type.description,
        v_ticket_type.price, v_ticket_type.original_price, v_ticket_type.quantity,
        v_ticket_type.quantity, v_ticket_type.min_per_order, v_ticket_type.max_per_order,
        v_ticket_type.ticket_category, v_ticket_type.section, v_ticket_type.includes,
        v_ticket_type.restrictions, v_ticket_type.visibility, v_ticket_type.sort_order,
        v_ticket_type.is_active
      );
    END LOOP;
  END IF;
  
  -- Clone addons
  IF p_clone_addons THEN
    FOR v_addon IN SELECT * FROM ticket_addons WHERE event_id = p_source_event_id LOOP
      INSERT INTO ticket_addons (
        event_id, name, description, category, price, quantity_available,
        max_per_order, image_url, is_active, created_by
      )
      VALUES (
        v_new_event_id, v_addon.name, v_addon.description, v_addon.category,
        v_addon.price, v_addon.quantity_available, v_addon.max_per_order,
        v_addon.image_url, v_addon.is_active, p_user_id
      );
    END LOOP;
  END IF;
  
  -- Record clone
  INSERT INTO event_clones (source_event_id, cloned_event_id, clone_type, cloned_by)
  VALUES (p_source_event_id, v_new_event_id, 'full', p_user_id);
  
  RETURN v_new_event_id;
END;
$$;

-- Function to update series stats
CREATE OR REPLACE FUNCTION update_event_series_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE event_series SET
    total_events = (SELECT COUNT(*) FROM event_series_instances WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)),
    published_events = (SELECT COUNT(*) FROM event_series_instances esi JOIN events e ON e.id = esi.event_id WHERE esi.series_id = COALESCE(NEW.series_id, OLD.series_id) AND e.status = 'on_sale'),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.series_id, OLD.series_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS event_series_stats_trigger ON event_series_instances;
CREATE TRIGGER event_series_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_series_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_event_series_stats();

-- Insert default system templates
INSERT INTO event_templates (name, description, template_type, default_duration_minutes, default_capacity, ticket_type_config, is_system, is_public)
VALUES 
  ('Concert', 'Live music performance template', 'concert', 180, 500, '{"types": ["General Admission", "VIP", "Meet & Greet"]}', true, true),
  ('Festival', 'Multi-day music or arts festival', 'festival', 720, 10000, '{"types": ["Single Day", "Weekend Pass", "VIP Weekend", "Camping"]}', true, true),
  ('Conference', 'Professional conference or summit', 'conference', 480, 1000, '{"types": ["General", "Premium", "Speaker Pass", "Virtual"]}', true, true),
  ('Theater', 'Theater production or show', 'theater', 150, 300, '{"types": ["Orchestra", "Mezzanine", "Balcony"]}', true, true),
  ('Sports', 'Sporting event or game', 'sports', 180, 20000, '{"types": ["General", "Club Level", "Suite"]}', true, true),
  ('Nightlife', 'Club night or DJ event', 'nightlife', 300, 500, '{"types": ["General", "VIP Table", "Bottle Service"]}', true, true),
  ('Experiential', 'Immersive or interactive experience', 'experiential', 90, 100, '{"types": ["Standard", "Premium", "Private Group"]}', true, true)
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_series_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_drafts ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON event_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_series TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_series_instances TO authenticated;
GRANT SELECT, INSERT ON event_clones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_drafts TO authenticated;
GRANT EXECUTE ON FUNCTION clone_event(UUID, UUID, TIMESTAMPTZ, TEXT, BOOLEAN, BOOLEAN) TO authenticated;
