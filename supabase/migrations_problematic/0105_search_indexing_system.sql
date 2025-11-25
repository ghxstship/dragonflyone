-- Migration: Search & Indexing System
-- Description: Full-text search indexes, search history, and saved searches

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  query TEXT NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('global', 'crew', 'projects', 'assets', 'venues', 'events', 'documents', 'tickets', 'orders')),
  filters JSONB,
  results_count INT,
  clicked_result_id UUID,
  clicked_result_type TEXT,
  search_duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_org ON search_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history USING gin(query gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT NOT NULL,
  filters JSONB,
  is_default BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT false,
  notification_frequency TEXT CHECK (notification_frequency IN ('instant', 'daily', 'weekly')),
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_org ON saved_searches(organization_id);

-- Search suggestions table
CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  suggestion TEXT NOT NULL,
  category TEXT,
  weight INT DEFAULT 1,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_suggestions_org ON search_suggestions(organization_id);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_text ON search_suggestions USING gin(suggestion gin_trgm_ops);

-- Full-text search indexes on key tables

-- Projects full-text search
ALTER TABLE projects ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION projects_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.client_name, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_search_vector_trigger ON projects;
CREATE TRIGGER projects_search_vector_trigger
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION projects_search_vector_update();

CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING gin(search_vector);

-- Events full-text search
ALTER TABLE events ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION events_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_search_vector_trigger ON events;
CREATE TRIGGER events_search_vector_trigger
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION events_search_vector_update();

CREATE INDEX IF NOT EXISTS idx_events_search ON events USING gin(search_vector);

-- Assets full-text search
ALTER TABLE assets ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION assets_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.asset_tag, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.manufacturer, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.model, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assets_search_vector_trigger ON assets;
CREATE TRIGGER assets_search_vector_trigger
  BEFORE INSERT OR UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION assets_search_vector_update();

CREATE INDEX IF NOT EXISTS idx_assets_search ON assets USING gin(search_vector);

-- Venues full-text search
ALTER TABLE venues ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION venues_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.state, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS venues_search_vector_trigger ON venues;
CREATE TRIGGER venues_search_vector_trigger
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION venues_search_vector_update();

CREATE INDEX IF NOT EXISTS idx_venues_search ON venues USING gin(search_vector);

-- Platform users full-text search
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION platform_users_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS platform_users_search_vector_trigger ON platform_users;
CREATE TRIGGER platform_users_search_vector_trigger
  BEFORE INSERT OR UPDATE ON platform_users
  FOR EACH ROW
  EXECUTE FUNCTION platform_users_search_vector_update();

CREATE INDEX IF NOT EXISTS idx_platform_users_search ON platform_users USING gin(search_vector);

-- Global search function
CREATE OR REPLACE FUNCTION global_search(
  p_query TEXT,
  p_org_id UUID DEFAULT NULL,
  p_types TEXT[] DEFAULT ARRAY['projects', 'events', 'assets', 'venues', 'users'],
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  result_type TEXT,
  result_id UUID,
  result_name TEXT,
  result_description TEXT,
  relevance REAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tsquery tsquery;
BEGIN
  v_tsquery := plainto_tsquery('english', p_query);
  
  RETURN QUERY
  WITH search_results AS (
    -- Projects
    SELECT 
      'project'::TEXT as result_type,
      p.id as result_id,
      p.name as result_name,
      p.description as result_description,
      ts_rank(p.search_vector, v_tsquery) as relevance
    FROM projects p
    WHERE 'projects' = ANY(p_types)
      AND (p_org_id IS NULL OR p.organization_id = p_org_id)
      AND p.search_vector @@ v_tsquery
    
    UNION ALL
    
    -- Events
    SELECT 
      'event'::TEXT,
      e.id,
      e.name,
      e.description,
      ts_rank(e.search_vector, v_tsquery)
    FROM events e
    WHERE 'events' = ANY(p_types)
      AND (p_org_id IS NULL OR e.organization_id = p_org_id)
      AND e.search_vector @@ v_tsquery
    
    UNION ALL
    
    -- Assets
    SELECT 
      'asset'::TEXT,
      a.id,
      a.name,
      a.description,
      ts_rank(a.search_vector, v_tsquery)
    FROM assets a
    WHERE 'assets' = ANY(p_types)
      AND (p_org_id IS NULL OR a.organization_id = p_org_id)
      AND a.search_vector @@ v_tsquery
    
    UNION ALL
    
    -- Venues
    SELECT 
      'venue'::TEXT,
      v.id,
      v.name,
      v.city || ', ' || v.state,
      ts_rank(v.search_vector, v_tsquery)
    FROM venues v
    WHERE 'venues' = ANY(p_types)
      AND (p_org_id IS NULL OR v.organization_id = p_org_id)
      AND v.search_vector @@ v_tsquery
    
    UNION ALL
    
    -- Users
    SELECT 
      'user'::TEXT,
      u.id,
      u.full_name,
      u.email,
      ts_rank(u.search_vector, v_tsquery)
    FROM platform_users u
    WHERE 'users' = ANY(p_types)
      AND (p_org_id IS NULL OR u.organization_id = p_org_id)
      AND u.search_vector @@ v_tsquery
  )
  SELECT * FROM search_results
  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$;

-- Function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
  p_query TEXT,
  p_org_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  suggestion TEXT,
  category TEXT,
  weight INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.suggestion,
    ss.category,
    ss.weight
  FROM search_suggestions ss
  WHERE ss.is_active = TRUE
    AND (p_org_id IS NULL OR ss.organization_id = p_org_id OR ss.organization_id IS NULL)
    AND ss.suggestion ILIKE p_query || '%'
  ORDER BY ss.weight DESC, ss.usage_count DESC
  LIMIT p_limit;
END;
$$;

-- Function to log search and update suggestions
CREATE OR REPLACE FUNCTION log_search(
  p_user_id UUID,
  p_org_id UUID,
  p_query TEXT,
  p_search_type TEXT,
  p_results_count INT,
  p_duration_ms INT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_search_id UUID;
BEGIN
  -- Log the search
  INSERT INTO search_history (user_id, organization_id, query, search_type, results_count, search_duration_ms)
  VALUES (p_user_id, p_org_id, p_query, p_search_type, p_results_count, p_duration_ms)
  RETURNING id INTO v_search_id;
  
  -- Update or create suggestion
  INSERT INTO search_suggestions (organization_id, suggestion, category, usage_count)
  VALUES (p_org_id, p_query, p_search_type, 1)
  ON CONFLICT (organization_id, suggestion) WHERE organization_id IS NOT NULL
  DO UPDATE SET usage_count = search_suggestions.usage_count + 1, updated_at = NOW();
  
  RETURN v_search_id;
END;
$$;

-- RLS policies
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON search_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_searches TO authenticated;
GRANT SELECT, INSERT, UPDATE ON search_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION global_search(TEXT, UUID, TEXT[], INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_suggestions(TEXT, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_search(UUID, UUID, TEXT, TEXT, INT, INT) TO authenticated;
