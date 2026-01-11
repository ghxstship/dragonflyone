-- ============================================================================
-- 0056_gvteway_experiences.sql
-- GVTEWAY Experiences & White-Label System
-- GHXSTSHIP Platform - Enterprise Grade
-- ============================================================================

-- ============================================================================
-- WHITE-LABEL CONFIGURATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.whitelabel_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7) NOT NULL DEFAULT '#7B68EE',
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  display_font VARCHAR(255),
  body_font VARCHAR(255),
  custom_domain VARCHAR(255) UNIQUE,
  domain_verified BOOLEAN DEFAULT false,
  domain_verified_at TIMESTAMPTZ,

  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '{
    "bookingEnabled": true,
    "reviewsEnabled": true,
    "socialSharingEnabled": true,
    "chatEnabled": false
  }'::jsonb,

  -- Content customization (JSONB)
  content JSONB DEFAULT '{
    "customNavLinks": [],
    "footerContent": "",
    "legalLinks": []
  }'::jsonb,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT whitelabel_configs_org_unique UNIQUE (organization_id)
);

CREATE INDEX IF NOT EXISTS idx_whitelabel_configs_org ON whitelabel_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_whitelabel_configs_domain ON whitelabel_configs(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_whitelabel_configs_active ON whitelabel_configs(is_active) WHERE is_active = true;

COMMENT ON TABLE whitelabel_configs IS 'White-label branding configurations for organizations';

-- ============================================================================
-- EXPERIENCE CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experience_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experience_categories_code ON experience_categories(code);
CREATE INDEX IF NOT EXISTS idx_experience_categories_active ON experience_categories(is_active) WHERE is_active = true;

-- Seed categories
INSERT INTO experience_categories (code, name, description, icon, sort_order) VALUES
  ('adventure', 'Adventure', 'Outdoor and adventure experiences', 'mountain', 1),
  ('sailing', 'Sailing & Yachting', 'Yacht trips and sailing adventures', 'anchor', 2),
  ('wellness', 'Wellness & Retreat', 'Wellness retreats and spa experiences', 'spa', 3),
  ('culinary', 'Culinary', 'Food and wine experiences', 'utensils', 4),
  ('cultural', 'Cultural', 'Cultural tours and experiences', 'landmark', 5),
  ('sports', 'Sports & Fitness', 'Active sports experiences', 'dumbbell', 6),
  ('music', 'Music & Festivals', 'Music events and festivals', 'music', 7),
  ('nature', 'Nature & Wildlife', 'Wildlife and nature experiences', 'tree', 8),
  ('luxury', 'Luxury', 'Premium luxury experiences', 'gem', 9),
  ('team_building', 'Team Building', 'Corporate team building events', 'users', 10)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- EXPERIENCE STATUSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experience_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO experience_statuses (code, name, description, sort_order) VALUES
  ('draft', 'Draft', 'Experience is being created', 1),
  ('published', 'Published', 'Experience is live and bookable', 2),
  ('archived', 'Archived', 'Experience is no longer available', 3)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- EXPERIENCES (Main Table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES experience_categories(id),
  status_id UUID NOT NULL REFERENCES experience_statuses(id),

  -- Basic information
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 1,

  -- Location
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  coordinates JSONB, -- {latitude: number, longitude: number}

  -- Venue (optional)
  venue_name TEXT,
  venue_address TEXT,
  venue_description TEXT,

  -- Group size
  min_group_size INTEGER NOT NULL DEFAULT 1,
  max_group_size INTEGER NOT NULL DEFAULT 100,

  -- Pricing (base currency in USD, convert at runtime)
  base_price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  starting_price NUMERIC(10,2), -- Lowest tier for display

  -- Media (JSONB array of media items)
  media JSONB DEFAULT '[]'::jsonb,

  -- Inclusions (JSONB)
  inclusions JSONB DEFAULT '{
    "included": [],
    "excluded": []
  }'::jsonb,

  -- Highlights (JSONB array)
  highlights JSONB DEFAULT '[]'::jsonb,

  -- Cancellation policy
  cancellation_policy_type TEXT DEFAULT 'moderate',
  cancellation_policy_json JSONB,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT experiences_org_slug_unique UNIQUE (organization_id, slug),
  CONSTRAINT experiences_group_size_check CHECK (min_group_size <= max_group_size),
  CONSTRAINT experiences_price_positive CHECK (base_price > 0)
);

CREATE INDEX IF NOT EXISTS idx_experiences_org ON experiences(organization_id);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category_id);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status_id);
CREATE INDEX IF NOT EXISTS idx_experiences_slug ON experiences(organization_id, slug);
CREATE INDEX IF NOT EXISTS idx_experiences_published ON experiences(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_experiences_created ON experiences(created_at DESC);

COMMENT ON TABLE experiences IS 'GVTEWAY experiences/events offered by organizations';

-- ============================================================================
-- EXPERIENCE ITINERARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experience_itinerary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Activities (JSONB array)
  activities JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT experience_itinerary_unique UNIQUE (experience_id, day_number),
  CONSTRAINT experience_itinerary_day_positive CHECK (day_number > 0)
);

CREATE INDEX IF NOT EXISTS idx_experience_itinerary_exp ON experience_itinerary(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_itinerary_day ON experience_itinerary(experience_id, day_number);

COMMENT ON TABLE experience_itinerary IS 'Day-by-day itinerary for experiences';

-- ============================================================================
-- EXPERIENCE FAQS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experience_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experience_faqs_exp ON experience_faqs(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_faqs_order ON experience_faqs(experience_id, sort_order);

COMMENT ON TABLE experience_faqs IS 'Frequently asked questions for experiences';

-- ============================================================================
-- EXPERIENCE AVAILABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experience_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_spots INTEGER NOT NULL,
  available_spots INTEGER NOT NULL,
  price_override NUMERIC(10,2), -- Dynamic pricing
  status TEXT DEFAULT 'available', -- available, limited, sold_out
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT experience_availability_dates_valid CHECK (start_date <= end_date),
  CONSTRAINT experience_availability_spots_valid CHECK (available_spots >= 0 AND available_spots <= total_spots)
);

CREATE INDEX IF NOT EXISTS idx_experience_availability_exp ON experience_availability(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_availability_dates ON experience_availability(experience_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_experience_availability_status ON experience_availability(status);

COMMENT ON TABLE experience_availability IS 'Available date ranges for experiences';

-- ============================================================================
-- EXPERIENCE ADD-ONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experience_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  max_quantity INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT experience_addons_price_positive CHECK (price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_experience_addons_exp ON experience_addons(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_addons_active ON experience_addons(experience_id, is_active) WHERE is_active = true;

COMMENT ON TABLE experience_addons IS 'Optional add-ons for experiences';

-- ============================================================================
-- EXPERIENCE REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experience_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  author_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,

  -- Review content
  rating INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Organizer response
  response TEXT,
  response_at TIMESTAMPTZ,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,

  -- Moderation
  is_published BOOLEAN DEFAULT true,
  moderated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT experience_reviews_rating_valid CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_experience_reviews_exp ON experience_reviews(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_reviews_author ON experience_reviews(author_id);
CREATE INDEX IF NOT EXISTS idx_experience_reviews_published ON experience_reviews(experience_id, is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_experience_reviews_rating ON experience_reviews(experience_id, rating);
CREATE INDEX IF NOT EXISTS idx_experience_reviews_created ON experience_reviews(created_at DESC);

COMMENT ON TABLE experience_reviews IS 'Guest reviews for experiences';

-- ============================================================================
-- BOOKINGS (Enhanced for experiences)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE RESTRICT,
  availability_id UUID NOT NULL REFERENCES experience_availability(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,

  -- Booking details
  booking_number TEXT NOT NULL UNIQUE,
  num_guests INTEGER NOT NULL,

  -- Contact information
  contact_first_name TEXT NOT NULL,
  contact_last_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  special_requests TEXT,

  -- Pricing
  subtotal NUMERIC(10,2) NOT NULL,
  addons_total NUMERIC(10,2) DEFAULT 0,
  service_fee NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Selected add-ons (JSONB)
  selected_addons JSONB DEFAULT '[]'::jsonb,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed

  -- Payment
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  refund_amount NUMERIC(10,2),
  refunded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT bookings_guests_positive CHECK (num_guests > 0),
  CONSTRAINT bookings_total_positive CHECK (total > 0)
);

CREATE INDEX IF NOT EXISTS idx_bookings_org ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_experience ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_availability ON bookings(availability_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

COMMENT ON TABLE bookings IS 'Experience bookings by guests';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whitelabel_configs_updated_at BEFORE UPDATE ON whitelabel_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_itinerary_updated_at BEFORE UPDATE ON experience_itinerary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_faqs_updated_at BEFORE UPDATE ON experience_faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_availability_updated_at BEFORE UPDATE ON experience_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_addons_updated_at BEFORE UPDATE ON experience_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_reviews_updated_at BEFORE UPDATE ON experience_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE whitelabel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read access to published experiences
CREATE POLICY "Public can view published experiences"
  ON experiences FOR SELECT
  USING (
    status_id IN (SELECT id FROM experience_statuses WHERE code = 'published')
  );

-- Organizers can manage their own experiences
CREATE POLICY "Organizers can manage their experiences"
  ON experiences FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM legend_people WHERE id = auth.uid()
  ));

-- Public can view whitelabel configs
CREATE POLICY "Public can view whitelabel configs"
  ON whitelabel_configs FOR SELECT
  USING (is_active = true);

-- Organizers can manage their whitelabel config
CREATE POLICY "Organizers can manage their whitelabel config"
  ON whitelabel_configs FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM legend_people WHERE id = auth.uid()
  ));

-- Public can view published reviews
CREATE POLICY "Public can view published reviews"
  ON experience_reviews FOR SELECT
  USING (is_published = true);

-- Authenticated users can create bookings
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can view their own bookings
CREATE POLICY "Users can view their bookings"
  ON bookings FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate experience rating
CREATE OR REPLACE FUNCTION calculate_experience_rating(exp_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_reviews INTEGER,
  rating_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating), 1) as average_rating,
    COUNT(*)::INTEGER as total_reviews,
    jsonb_build_object(
      '5', COUNT(*) FILTER (WHERE rating = 5),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '1', COUNT(*) FILTER (WHERE rating = 1)
    ) as rating_breakdown
  FROM experience_reviews
  WHERE experience_id = exp_id AND is_published = true;
END;
$$ LANGUAGE plpgsql;

-- Get experience availability summary
CREATE OR REPLACE FUNCTION get_experience_availability_summary(exp_id UUID)
RETURNS TABLE (
  total_dates INTEGER,
  dates_available INTEGER,
  earliest_date DATE,
  latest_date DATE,
  total_spots INTEGER,
  spots_booked INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_dates,
    COUNT(*) FILTER (WHERE available_spots > 0)::INTEGER as dates_available,
    MIN(start_date) as earliest_date,
    MAX(end_date) as latest_date,
    SUM(total_spots)::INTEGER as total_spots,
    SUM(total_spots - available_spots)::INTEGER as spots_booked
  FROM experience_availability
  WHERE experience_id = exp_id AND start_date >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETE
-- ============================================================================

COMMENT ON SCHEMA public IS 'GVTEWAY Experiences & White-Label System - Migration 0056';
