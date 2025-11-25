-- Migration: Venues System
-- Description: Tables for venues, contacts, rooms, and availability

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  venue_code TEXT,
  venue_type TEXT NOT NULL CHECK (venue_type IN ('arena', 'stadium', 'club', 'outdoor', 'theater', 'convention_center', 'amphitheater', 'ballroom', 'warehouse', 'other')),
  address TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  timezone TEXT DEFAULT 'America/New_York',
  capacity INT NOT NULL,
  seating_capacity INT,
  standing_capacity INT,
  parking_capacity INT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  description TEXT,
  amenities TEXT[],
  accessibility_features TEXT[],
  load_in_info TEXT,
  technical_specs JSONB,
  photos TEXT[],
  floor_plans TEXT[],
  virtual_tour_url TEXT,
  rental_rate_hourly NUMERIC(10,2),
  rental_rate_daily NUMERIC(10,2),
  rental_rate_event NUMERIC(10,2),
  minimum_rental_hours INT,
  setup_time_hours INT DEFAULT 4,
  teardown_time_hours INT DEFAULT 2,
  curfew_time TIME,
  noise_restrictions TEXT,
  insurance_requirements TEXT,
  preferred_vendors JSONB,
  blackout_dates DATE[],
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2),
  review_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_org ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_state ON venues(state);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON venues(capacity);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues USING gist (
  ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Venue contacts table
CREATE TABLE IF NOT EXISTS venue_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_contacts_venue ON venue_contacts(venue_id);

-- Venue rooms/spaces table
CREATE TABLE IF NOT EXISTS venue_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT CHECK (room_type IN ('main_hall', 'stage', 'backstage', 'green_room', 'dressing_room', 'vip_area', 'production_office', 'storage', 'loading_dock', 'other')),
  capacity INT,
  square_feet INT,
  floor_level INT,
  amenities TEXT[],
  technical_specs JSONB,
  photos TEXT[],
  rental_rate_hourly NUMERIC(10,2),
  is_bookable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_rooms_venue ON venue_rooms(venue_id);

-- Venue availability table
CREATE TABLE IF NOT EXISTS venue_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  room_id UUID REFERENCES venue_rooms(id),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT NOT NULL CHECK (status IN ('available', 'tentative', 'booked', 'blocked', 'maintenance')),
  event_id UUID REFERENCES events(id),
  hold_expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_availability_venue ON venue_availability(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_availability_date ON venue_availability(date);
CREATE INDEX IF NOT EXISTS idx_venue_availability_status ON venue_availability(status);

-- Venue bookings table
CREATE TABLE IF NOT EXISTS venue_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id),
  room_id UUID REFERENCES venue_rooms(id),
  event_id UUID REFERENCES events(id),
  project_id UUID REFERENCES projects(id),
  booking_type TEXT NOT NULL CHECK (booking_type IN ('event', 'rehearsal', 'load_in', 'load_out', 'hold', 'other')),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  setup_start TIMESTAMPTZ,
  teardown_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  rental_rate NUMERIC(10,2),
  total_cost NUMERIC(15,2),
  deposit_amount NUMERIC(15,2),
  deposit_paid BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  contract_url TEXT,
  special_requirements TEXT,
  notes TEXT,
  booked_by UUID REFERENCES platform_users(id),
  confirmed_by UUID REFERENCES platform_users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_bookings_venue ON venue_bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_event ON venue_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_dates ON venue_bookings(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_status ON venue_bookings(status);

-- Venue reviews table
CREATE TABLE IF NOT EXISTS venue_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID REFERENCES events(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  would_recommend BOOLEAN,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue ON venue_reviews(venue_id);

-- Function to check venue availability
CREATE OR REPLACE FUNCTION check_venue_availability(
  p_venue_id UUID,
  p_start_datetime TIMESTAMPTZ,
  p_end_datetime TIMESTAMPTZ,
  p_room_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_conflict_count INT;
BEGIN
  SELECT COUNT(*) INTO v_conflict_count
  FROM venue_bookings
  WHERE venue_id = p_venue_id
    AND (p_room_id IS NULL OR room_id = p_room_id)
    AND status IN ('pending', 'confirmed')
    AND (start_datetime, end_datetime) OVERLAPS (p_start_datetime, p_end_datetime);
  
  RETURN v_conflict_count = 0;
END;
$$;

-- Function to update venue rating
CREATE OR REPLACE FUNCTION update_venue_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE venues SET
    rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM venue_reviews WHERE venue_id = NEW.venue_id AND status = 'approved'),
    review_count = (SELECT COUNT(*) FROM venue_reviews WHERE venue_id = NEW.venue_id AND status = 'approved'),
    updated_at = NOW()
  WHERE id = NEW.venue_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS venue_review_rating_trigger ON venue_reviews;
CREATE TRIGGER venue_review_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON venue_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_rating();

-- RLS policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reviews ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON venues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON venue_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON venue_rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE ON venue_availability TO authenticated;
GRANT SELECT, INSERT, UPDATE ON venue_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON venue_reviews TO authenticated;
GRANT EXECUTE ON FUNCTION check_venue_availability(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO authenticated;
