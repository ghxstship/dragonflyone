-- Migration: Production Documentation System
-- Description: Photos, notes, and documentation for production events

-- Production documentation albums
CREATE TABLE IF NOT EXISTS production_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  album_type VARCHAR(50) NOT NULL CHECK (album_type IN ('load_in', 'setup', 'show', 'strike', 'behind_scenes', 'marketing', 'safety', 'damage', 'general')),
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Production photos
CREATE TABLE IF NOT EXISTS production_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES production_albums(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  
  -- File info
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  
  -- Metadata
  title VARCHAR(255),
  description TEXT,
  caption TEXT,
  alt_text VARCHAR(500),
  
  -- Location and time
  taken_at TIMESTAMPTZ,
  location_name VARCHAR(255),
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  
  -- Categorization
  photo_type VARCHAR(50) CHECK (photo_type IN ('equipment', 'venue', 'crew', 'audience', 'artist', 'setup', 'damage', 'safety', 'marketing', 'other')),
  tags JSONB DEFAULT '[]',
  
  -- AI-generated metadata
  ai_tags JSONB DEFAULT '[]',
  ai_description TEXT,
  faces_detected INTEGER DEFAULT 0,
  
  -- Permissions
  is_public BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  
  -- Usage tracking
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES platform_users(id)
);

-- Production notes
CREATE TABLE IF NOT EXISTS production_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Note content
  title VARCHAR(255),
  content TEXT NOT NULL,
  formatted_content TEXT,
  note_type VARCHAR(50) NOT NULL CHECK (note_type IN ('general', 'technical', 'safety', 'incident', 'client_feedback', 'crew_feedback', 'improvement', 'issue', 'resolution')),
  priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Categorization
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Related items
  related_photos JSONB DEFAULT '[]',
  related_notes JSONB DEFAULT '[]',
  related_tasks JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'resolved', 'archived')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES platform_users(id),
  
  -- Visibility
  is_private BOOLEAN DEFAULT FALSE,
  visible_to_roles JSONB DEFAULT '[]',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Production checklists
CREATE TABLE IF NOT EXISTS production_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  template_id UUID,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  checklist_type VARCHAR(50) NOT NULL CHECK (checklist_type IN ('load_in', 'setup', 'sound_check', 'show', 'strike', 'safety', 'equipment', 'venue', 'custom')),
  
  -- Progress
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  progress_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Timing
  due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Assignment
  assigned_to UUID REFERENCES platform_users(id),
  assigned_team UUID,
  
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Checklist items
CREATE TABLE IF NOT EXISTS production_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES production_checklists(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES production_checklist_items(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  
  -- Completion
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  
  -- Requirements
  is_required BOOLEAN DEFAULT TRUE,
  requires_photo BOOLEAN DEFAULT FALSE,
  requires_signature BOOLEAN DEFAULT FALSE,
  requires_note BOOLEAN DEFAULT FALSE,
  
  -- Evidence
  photo_urls JSONB DEFAULT '[]',
  signature_url TEXT,
  notes TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES platform_users(id),
  due_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production timelines/logs
CREATE TABLE IF NOT EXISTS production_timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN ('milestone', 'update', 'issue', 'resolution', 'photo', 'note', 'checklist', 'status_change', 'weather', 'delay', 'custom')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Timing
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,
  
  -- Related items
  related_photo_id UUID REFERENCES production_photos(id) ON DELETE SET NULL,
  related_note_id UUID REFERENCES production_notes(id) ON DELETE SET NULL,
  related_checklist_id UUID REFERENCES production_checklists(id) ON DELETE SET NULL,
  
  -- Categorization
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,
  is_highlighted BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_production_albums_project ON production_albums(project_id);
CREATE INDEX IF NOT EXISTS idx_production_albums_event ON production_albums(event_id);
CREATE INDEX IF NOT EXISTS idx_production_photos_album ON production_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_production_photos_project ON production_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_production_photos_event ON production_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_production_photos_type ON production_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_production_notes_project ON production_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_production_notes_event ON production_notes(event_id);
CREATE INDEX IF NOT EXISTS idx_production_notes_type ON production_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_production_checklists_project ON production_checklists(project_id);
CREATE INDEX IF NOT EXISTS idx_production_checklists_event ON production_checklists(event_id);
CREATE INDEX IF NOT EXISTS idx_production_checklist_items_checklist ON production_checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_production_timeline_project ON production_timeline_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_production_timeline_event ON production_timeline_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_production_timeline_occurred ON production_timeline_entries(occurred_at);

-- RLS Policies
ALTER TABLE production_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_timeline_entries ENABLE ROW LEVEL SECURITY;

-- Albums - project/event team members can access
CREATE POLICY "production_albums_select" ON production_albums
  FOR SELECT USING (
    is_public = TRUE
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "production_albums_manage" ON production_albums
  FOR ALL USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Photos
CREATE POLICY "production_photos_select" ON production_photos
  FOR SELECT USING (
    is_public = TRUE
    OR uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "production_photos_insert" ON production_photos
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "production_photos_manage" ON production_photos
  FOR ALL USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Notes
CREATE POLICY "production_notes_select" ON production_notes
  FOR SELECT USING (
    NOT is_private
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "production_notes_manage" ON production_notes
  FOR ALL USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Checklists
CREATE POLICY "production_checklists_select" ON production_checklists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'COMPVSS_CREW_LEAD', 'COMPVSS_CREW_MEMBER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "production_checklists_manage" ON production_checklists
  FOR ALL USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Checklist items
CREATE POLICY "production_checklist_items_select" ON production_checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM production_checklists pc
      WHERE pc.id = production_checklist_items.checklist_id
    )
  );

CREATE POLICY "production_checklist_items_manage" ON production_checklist_items
  FOR ALL USING (
    assigned_to = auth.uid()
    OR completed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM production_checklists pc
      WHERE pc.id = production_checklist_items.checklist_id
      AND (pc.created_by = auth.uid() OR pc.assigned_to = auth.uid())
    )
  );

-- Timeline entries
CREATE POLICY "production_timeline_select" ON production_timeline_entries
  FOR SELECT USING (
    is_public = TRUE
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['COMPVSS_ADMIN', 'COMPVSS_PRODUCTION_MANAGER', 'COMPVSS_CREW_LEAD', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "production_timeline_insert" ON production_timeline_entries
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Function to update checklist progress
CREATE OR REPLACE FUNCTION update_checklist_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE production_checklists
  SET 
    total_items = (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id)),
    completed_items = (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id) AND is_completed = TRUE),
    progress_percent = CASE 
      WHEN (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id)) = 0 THEN 0
      ELSE (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id) AND is_completed = TRUE)::DECIMAL / 
           (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id))::DECIMAL * 100
    END,
    status = CASE
      WHEN (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id) AND is_completed = FALSE) = 0 
           AND (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id)) > 0 THEN 'completed'
      WHEN (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id) AND is_completed = TRUE) > 0 THEN 'in_progress'
      ELSE 'pending'
    END,
    completed_at = CASE
      WHEN (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id) AND is_completed = FALSE) = 0 
           AND (SELECT COUNT(*) FROM production_checklist_items WHERE checklist_id = COALESCE(NEW.checklist_id, OLD.checklist_id)) > 0 THEN NOW()
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.checklist_id, OLD.checklist_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checklist_item_progress_update
  AFTER INSERT OR UPDATE OR DELETE ON production_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_progress();
