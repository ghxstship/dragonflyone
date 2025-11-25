-- Migration: Seating & Venue Maps System
-- Description: Tables for venue seating charts, seat maps, and seat selection

-- Venue seating charts table
CREATE TABLE IF NOT EXISTS venue_seating_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('reserved', 'general_admission', 'mixed', 'table', 'custom')),
  svg_data TEXT,
  json_data JSONB,
  image_url TEXT,
  thumbnail_url TEXT,
  total_capacity INT NOT NULL DEFAULT 0,
  sections JSONB,
  rows_config JSONB,
  accessibility_info JSONB,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_seating_charts_venue ON venue_seating_charts(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_seating_charts_default ON venue_seating_charts(venue_id, is_default);

-- Seating sections table
CREATE TABLE IF NOT EXISTS seating_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seating_chart_id UUID NOT NULL REFERENCES venue_seating_charts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('floor', 'lower', 'upper', 'balcony', 'mezzanine', 'box', 'vip', 'accessible', 'standing', 'table')),
  capacity INT NOT NULL DEFAULT 0,
  row_count INT DEFAULT 0,
  seats_per_row INT DEFAULT 0,
  price_tier TEXT,
  color TEXT,
  svg_path TEXT,
  coordinates JSONB,
  entrance TEXT,
  amenities TEXT[],
  restrictions TEXT[],
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seating_chart_id, code)
);

CREATE INDEX IF NOT EXISTS idx_seating_sections_chart ON seating_sections(seating_chart_id);
CREATE INDEX IF NOT EXISTS idx_seating_sections_type ON seating_sections(section_type);

-- Seating rows table
CREATE TABLE IF NOT EXISTS seating_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES seating_sections(id) ON DELETE CASCADE,
  row_name TEXT NOT NULL,
  row_number INT NOT NULL,
  seat_count INT NOT NULL DEFAULT 0,
  row_type TEXT DEFAULT 'standard' CHECK (row_type IN ('standard', 'accessible', 'premium', 'restricted')),
  coordinates JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, row_name)
);

CREATE INDEX IF NOT EXISTS idx_seating_rows_section ON seating_rows(section_id);

-- Individual seats table
CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id UUID NOT NULL REFERENCES seating_rows(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES seating_sections(id) ON DELETE CASCADE,
  seating_chart_id UUID NOT NULL REFERENCES venue_seating_charts(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  seat_label TEXT,
  seat_type TEXT DEFAULT 'standard' CHECK (seat_type IN ('standard', 'accessible', 'companion', 'premium', 'vip', 'obstructed', 'restricted', 'aisle', 'table')),
  x_position NUMERIC(10,2),
  y_position NUMERIC(10,2),
  rotation NUMERIC(5,2) DEFAULT 0,
  amenities TEXT[],
  restrictions TEXT[],
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(row_id, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_seats_row ON seats(row_id);
CREATE INDEX IF NOT EXISTS idx_seats_section ON seats(section_id);
CREATE INDEX IF NOT EXISTS idx_seats_chart ON seats(seating_chart_id);
CREATE INDEX IF NOT EXISTS idx_seats_type ON seats(seat_type);

-- Event seat inventory table
CREATE TABLE IF NOT EXISTS event_seat_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES seats(id),
  section_id UUID NOT NULL REFERENCES seating_sections(id),
  ticket_type_id UUID REFERENCES ticket_types(id),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'held', 'sold', 'blocked', 'comp')),
  price NUMERIC(10,2),
  price_tier TEXT,
  hold_token TEXT,
  held_by UUID REFERENCES platform_users(id),
  held_until TIMESTAMPTZ,
  sold_to UUID REFERENCES platform_users(id),
  order_id UUID REFERENCES orders(id),
  ticket_id UUID REFERENCES tickets(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, seat_id)
);

CREATE INDEX IF NOT EXISTS idx_event_seat_inventory_event ON event_seat_inventory(event_id);
CREATE INDEX IF NOT EXISTS idx_event_seat_inventory_seat ON event_seat_inventory(seat_id);
CREATE INDEX IF NOT EXISTS idx_event_seat_inventory_status ON event_seat_inventory(status);
CREATE INDEX IF NOT EXISTS idx_event_seat_inventory_hold ON event_seat_inventory(hold_token);

-- Seat holds table (temporary reservations)
CREATE TABLE IF NOT EXISTS seat_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  seat_ids UUID[] NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  session_id TEXT,
  hold_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'converted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  converted_order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seat_holds_event ON seat_holds(event_id);
CREATE INDEX IF NOT EXISTS idx_seat_holds_token ON seat_holds(hold_token);
CREATE INDEX IF NOT EXISTS idx_seat_holds_status ON seat_holds(status);
CREATE INDEX IF NOT EXISTS idx_seat_holds_expires ON seat_holds(expires_at);

-- Best available seats algorithm config
CREATE TABLE IF NOT EXISTS best_available_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) UNIQUE,
  algorithm TEXT DEFAULT 'center_first' CHECK (algorithm IN ('center_first', 'front_first', 'back_first', 'aisle_first', 'custom')),
  section_priority TEXT[],
  row_priority TEXT[],
  avoid_single_seats BOOLEAN DEFAULT true,
  prefer_consecutive BOOLEAN DEFAULT true,
  max_row_spread INT DEFAULT 2,
  accessibility_priority BOOLEAN DEFAULT true,
  custom_weights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_best_available_config_event ON best_available_config(event_id);

-- Function to hold seats
CREATE OR REPLACE FUNCTION hold_seats(
  p_event_id UUID,
  p_seat_ids UUID[],
  p_user_id UUID,
  p_session_id TEXT,
  p_hold_duration_minutes INT DEFAULT 10
)
RETURNS TABLE (
  success BOOLEAN,
  hold_token TEXT,
  expires_at TIMESTAMPTZ,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_hold_token TEXT;
  v_expires_at TIMESTAMPTZ;
  v_unavailable_seats UUID[];
BEGIN
  -- Check if any seats are unavailable
  SELECT ARRAY_AGG(seat_id) INTO v_unavailable_seats
  FROM event_seat_inventory
  WHERE event_id = p_event_id
    AND seat_id = ANY(p_seat_ids)
    AND status != 'available';
  
  IF v_unavailable_seats IS NOT NULL AND ARRAY_LENGTH(v_unavailable_seats, 1) > 0 THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TIMESTAMPTZ, 'Some seats are no longer available';
    RETURN;
  END IF;
  
  -- Generate hold token
  v_hold_token := 'HOLD-' || gen_random_uuid()::TEXT;
  v_expires_at := NOW() + (p_hold_duration_minutes || ' minutes')::INTERVAL;
  
  -- Update seat inventory
  UPDATE event_seat_inventory SET
    status = 'held',
    hold_token = v_hold_token,
    held_by = p_user_id,
    held_until = v_expires_at,
    updated_at = NOW()
  WHERE event_id = p_event_id
    AND seat_id = ANY(p_seat_ids)
    AND status = 'available';
  
  -- Create hold record
  INSERT INTO seat_holds (event_id, seat_ids, user_id, session_id, hold_token, expires_at)
  VALUES (p_event_id, p_seat_ids, p_user_id, p_session_id, v_hold_token, v_expires_at);
  
  RETURN QUERY SELECT TRUE, v_hold_token, v_expires_at, NULL::TEXT;
END;
$$;

-- Function to release seats
CREATE OR REPLACE FUNCTION release_seats(p_hold_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_hold RECORD;
BEGIN
  SELECT * INTO v_hold FROM seat_holds WHERE hold_token = p_hold_token AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Release seats
  UPDATE event_seat_inventory SET
    status = 'available',
    hold_token = NULL,
    held_by = NULL,
    held_until = NULL,
    updated_at = NOW()
  WHERE event_id = v_hold.event_id
    AND seat_id = ANY(v_hold.seat_ids)
    AND hold_token = p_hold_token;
  
  -- Update hold record
  UPDATE seat_holds SET status = 'released' WHERE hold_token = p_hold_token;
  
  RETURN TRUE;
END;
$$;

-- Function to find best available seats
CREATE OR REPLACE FUNCTION find_best_available_seats(
  p_event_id UUID,
  p_quantity INT,
  p_section_id UUID DEFAULT NULL,
  p_price_tier TEXT DEFAULT NULL,
  p_accessible BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  seat_id UUID,
  section_name TEXT,
  row_name TEXT,
  seat_number TEXT,
  price NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    esi.seat_id,
    ss.name as section_name,
    sr.row_name,
    s.seat_number,
    esi.price
  FROM event_seat_inventory esi
  JOIN seats s ON s.id = esi.seat_id
  JOIN seating_rows sr ON sr.id = s.row_id
  JOIN seating_sections ss ON ss.id = s.section_id
  WHERE esi.event_id = p_event_id
    AND esi.status = 'available'
    AND (p_section_id IS NULL OR s.section_id = p_section_id)
    AND (p_price_tier IS NULL OR esi.price_tier = p_price_tier)
    AND (NOT p_accessible OR s.seat_type = 'accessible')
  ORDER BY 
    ss.sort_order,
    sr.row_number,
    s.seat_number::INT
  LIMIT p_quantity;
END;
$$;

-- Function to expire seat holds
CREATE OR REPLACE FUNCTION expire_seat_holds()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_expired INT;
BEGIN
  -- Release expired holds
  WITH expired AS (
    UPDATE seat_holds SET status = 'expired'
    WHERE status = 'active' AND expires_at < NOW()
    RETURNING event_id, seat_ids, hold_token
  )
  UPDATE event_seat_inventory SET
    status = 'available',
    hold_token = NULL,
    held_by = NULL,
    held_until = NULL,
    updated_at = NOW()
  FROM expired e
  WHERE event_seat_inventory.event_id = e.event_id
    AND event_seat_inventory.seat_id = ANY(e.seat_ids)
    AND event_seat_inventory.hold_token = e.hold_token;
  
  GET DIAGNOSTICS v_expired = ROW_COUNT;
  
  RETURN v_expired;
END;
$$;

-- RLS policies
ALTER TABLE venue_seating_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_seat_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_available_config ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON venue_seating_charts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON seating_sections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON seating_rows TO authenticated;
GRANT SELECT, INSERT, UPDATE ON seats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_seat_inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE ON seat_holds TO authenticated;
GRANT SELECT, INSERT, UPDATE ON best_available_config TO authenticated;
GRANT EXECUTE ON FUNCTION hold_seats(UUID, UUID[], UUID, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION release_seats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION find_best_available_seats(UUID, INT, UUID, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_seat_holds() TO authenticated;
