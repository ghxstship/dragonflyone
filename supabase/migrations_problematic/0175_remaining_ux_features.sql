-- Migration: Remaining UX Features
-- Description: Tables for training videos, equipment specs, advanced search, guest chat, and venue maps

-- Training categories
CREATE TABLE IF NOT EXISTS training_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_categories_sort ON training_categories(sort_order);

-- Training videos
CREATE TABLE IF NOT EXISTS training_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES training_categories(id),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT,
  difficulty_level TEXT DEFAULT 'beginner',
  tags TEXT[],
  transcript TEXT,
  is_required BOOLEAN DEFAULT false,
  roles TEXT[],
  departments TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_videos_category ON training_videos(category_id);
CREATE INDEX IF NOT EXISTS idx_training_videos_status ON training_videos(status);
CREATE INDEX IF NOT EXISTS idx_training_videos_required ON training_videos(is_required);

-- Training progress
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  video_id UUID NOT NULL REFERENCES training_videos(id),
  watched_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ,
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_video ON training_progress(video_id);

-- Training quizzes
CREATE TABLE IF NOT EXISTS training_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES training_videos(id),
  title TEXT NOT NULL,
  passing_score INT DEFAULT 70,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_quizzes_video ON training_quizzes(video_id);

-- Training quiz questions
CREATE TABLE IF NOT EXISTS training_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES training_quizzes(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_training_quiz_questions_quiz ON training_quiz_questions(quiz_id);

-- Training quiz results
CREATE TABLE IF NOT EXISTS training_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES training_quizzes(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  score NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_quiz_results_quiz ON training_quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_training_quiz_results_user ON training_quiz_results(user_id);

-- Equipment specifications
CREATE TABLE IF NOT EXISTS equipment_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  specifications JSONB NOT NULL,
  power_requirements JSONB,
  dimensions JSONB,
  images TEXT[],
  manuals JSONB,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_specs_category ON equipment_specs(category);
CREATE INDEX IF NOT EXISTS idx_equipment_specs_manufacturer ON equipment_specs(manufacturer);
CREATE INDEX IF NOT EXISTS idx_equipment_specs_status ON equipment_specs(status);

-- Equipment favorites
CREATE TABLE IF NOT EXISTS equipment_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  spec_id UUID NOT NULL REFERENCES equipment_specs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, spec_id)
);

CREATE INDEX IF NOT EXISTS idx_equipment_favorites_user ON equipment_favorites(user_id);

-- Equipment spec requests
CREATE TABLE IF NOT EXISTS equipment_spec_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment spec corrections
CREATE TABLE IF NOT EXISTS equipment_spec_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_id UUID NOT NULL REFERENCES equipment_specs(id),
  field TEXT NOT NULL,
  current_value TEXT,
  suggested_value TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search analytics
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL UNIQUE,
  count INT DEFAULT 1,
  last_searched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_count ON search_analytics(count);

-- Event categories
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  subject TEXT,
  category TEXT DEFAULT 'general',
  event_id UUID REFERENCES events(id),
  order_id UUID,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'waiting_agent', 'with_agent', 'closed')),
  assigned_agent_id UUID REFERENCES platform_users(id),
  agent_requested_at TIMESTAMPTZ,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  rated_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_agent ON chat_conversations(assigned_agent_id);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'agent', 'bot', 'system')),
  sender_id UUID REFERENCES platform_users(id),
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(is_read);

-- Chat FAQs
CREATE TABLE IF NOT EXISTS chat_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  keywords TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_faqs_category ON chat_faqs(category);

-- Venue maps
CREATE TABLE IF NOT EXISTS venue_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  name TEXT NOT NULL,
  map_type TEXT NOT NULL CHECK (map_type IN ('seating', 'floor', 'overview', 'accessibility')),
  svg_data TEXT,
  image_url TEXT,
  sections JSONB,
  amenities JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_maps_venue ON venue_maps(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_maps_type ON venue_maps(map_type);

-- Venue sections
CREATE TABLE IF NOT EXISTS venue_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  map_id UUID REFERENCES venue_maps(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB,
  capacity INT,
  price_tier TEXT,
  has_accessible_seating BOOLEAN DEFAULT false,
  accessible_seats INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_sections_venue ON venue_sections(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_sections_map ON venue_sections(map_id);

-- Venue seats
CREATE TABLE IF NOT EXISTS venue_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  section_id UUID NOT NULL REFERENCES venue_sections(id),
  row_name TEXT,
  seat_number TEXT NOT NULL,
  coordinates JSONB,
  is_accessible BOOLEAN DEFAULT false,
  is_aisle BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_seats_section ON venue_seats(section_id);

-- Venue amenities
CREATE TABLE IF NOT EXISTS venue_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB,
  floor INT,
  accessible BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_amenities_venue ON venue_amenities(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_amenities_type ON venue_amenities(type);

-- Venue accessibility
CREATE TABLE IF NOT EXISTS venue_accessibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  feature_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_accessibility_venue ON venue_accessibility(venue_id);

-- Seat holds
CREATE TABLE IF NOT EXISTS seat_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  seat_id UUID NOT NULL REFERENCES venue_seats(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  status TEXT DEFAULT 'held',
  hold_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seat_holds_event ON seat_holds(event_id);
CREATE INDEX IF NOT EXISTS idx_seat_holds_user ON seat_holds(user_id);
CREATE INDEX IF NOT EXISTS idx_seat_holds_expires ON seat_holds(hold_expires_at);

-- Add fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES event_categories(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS min_price NUMERIC(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_price NUMERIC(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS tickets_sold INT DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS parking_info TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS doors_open TEXT;

-- Add section_ids to ticket_types
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS section_ids UUID[];

-- Add seat fields to tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS seat_id UUID REFERENCES venue_seats(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES venue_sections(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS row_id TEXT;

-- RLS policies
ALTER TABLE training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_spec_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_spec_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_accessibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_holds ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON training_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON training_videos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON training_progress TO authenticated;
GRANT SELECT, INSERT ON training_quizzes TO authenticated;
GRANT SELECT ON training_quiz_questions TO authenticated;
GRANT SELECT, INSERT ON training_quiz_results TO authenticated;
GRANT SELECT, INSERT, UPDATE ON equipment_specs TO authenticated;
GRANT SELECT, INSERT, DELETE ON equipment_favorites TO authenticated;
GRANT SELECT, INSERT ON equipment_spec_requests TO authenticated;
GRANT SELECT, INSERT ON equipment_spec_corrections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON search_analytics TO authenticated;
GRANT SELECT ON event_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_messages TO authenticated;
GRANT SELECT ON chat_faqs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON venue_maps TO authenticated;
GRANT SELECT, INSERT ON venue_sections TO authenticated;
GRANT SELECT ON venue_seats TO authenticated;
GRANT SELECT, INSERT ON venue_amenities TO authenticated;
GRANT SELECT ON venue_accessibility TO authenticated;
GRANT SELECT, INSERT, DELETE ON seat_holds TO authenticated;

-- Insert default training categories
INSERT INTO training_categories (name, description, sort_order) VALUES
('Safety', 'Safety procedures and protocols', 1),
('Equipment', 'Equipment operation and maintenance', 2),
('Software', 'Software and tools training', 3),
('Production', 'Production techniques and best practices', 4),
('Customer Service', 'Guest interaction and service standards', 5)
ON CONFLICT DO NOTHING;

-- Insert default event categories
INSERT INTO event_categories (name, slug, sort_order) VALUES
('Concerts', 'concerts', 1),
('Sports', 'sports', 2),
('Theater', 'theater', 3),
('Comedy', 'comedy', 4),
('Festivals', 'festivals', 5),
('Family', 'family', 6),
('Other', 'other', 99)
ON CONFLICT (slug) DO NOTHING;

-- Insert default chat FAQs
INSERT INTO chat_faqs (question, answer, category, sort_order) VALUES
('How do I get a refund?', 'To request a refund, go to your order history, select the order, and click "Request Refund". Refunds are processed within 5-7 business days if the event allows refunds.', 'tickets', 1),
('Can I transfer my tickets?', 'Yes! Go to "My Tickets", select the tickets you want to transfer, and enter the recipient''s email address. They''ll receive instructions to claim the tickets.', 'tickets', 2),
('Where can I park?', 'Parking information is available on each event''s detail page. Most venues offer on-site parking, and we recommend arriving early for the best spots.', 'venue', 3),
('What accessibility options are available?', 'We offer wheelchair-accessible seating, assistive listening devices, and accessible restrooms at most venues. Contact us for specific accessibility needs.', 'accessibility', 4),
('How do I contact support?', 'You can reach us at support@gvteway.com or call 1-800-GVTEWAY. Our hours are Mon-Fri 9am-9pm EST, Sat-Sun 10am-6pm EST.', 'general', 5)
ON CONFLICT DO NOTHING;
