-- Migration: Event Programs and Setlists
-- Adds digital program and setlist functionality

-- Event Programs Table
CREATE TABLE IF NOT EXISTS event_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  notes TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program Sections Table
CREATE TABLE IF NOT EXISTS program_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES event_programs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_time TIME,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setlist Items Table
CREATE TABLE IF NOT EXISTS setlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES program_sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  duration VARCHAR(20),
  notes TEXT,
  is_encore BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Performers Table
CREATE TABLE IF NOT EXISTS event_performers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  image TEXT,
  bio TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Sponsors Table
CREATE TABLE IF NOT EXISTS event_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  logo TEXT,
  tier VARCHAR(50) DEFAULT 'sponsor',
  website TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_programs_event ON event_programs(event_id);
CREATE INDEX IF NOT EXISTS idx_program_sections_program ON program_sections(program_id);
CREATE INDEX IF NOT EXISTS idx_setlist_items_section ON setlist_items(section_id);
CREATE INDEX IF NOT EXISTS idx_event_performers_event ON event_performers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_event ON event_sponsors(event_id);

-- RLS Policies
ALTER TABLE event_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;

-- Anyone can view published programs
CREATE POLICY "Anyone can view published programs" ON event_programs
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Anyone can view program sections" ON program_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_programs
      WHERE event_programs.id = program_sections.program_id
      AND event_programs.is_published = TRUE
    )
  );

CREATE POLICY "Anyone can view setlist items" ON setlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM program_sections
      JOIN event_programs ON event_programs.id = program_sections.program_id
      WHERE program_sections.id = setlist_items.section_id
      AND event_programs.is_published = TRUE
    )
  );

CREATE POLICY "Anyone can view performers" ON event_performers
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view sponsors" ON event_sponsors
  FOR SELECT USING (TRUE);

-- Admins can manage all program content
CREATE POLICY "Admins can manage programs" ON event_programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage sections" ON program_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage setlist items" ON setlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage performers" ON event_performers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage sponsors" ON event_sponsors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Updated at trigger
CREATE TRIGGER event_programs_updated_at
  BEFORE UPDATE ON event_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
