-- Migration: Create missing GVTEWAY tables (Part 8 - Tickets, Travel, UGC, User Preferences, Venues, VIP, VR, Watch Parties, Will Call)
-- These tables are referenced by API routes but don't exist in the schema

-- ============================================
-- TICKET TABLES (extended)
-- ============================================

CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  quantity_total INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  min_per_order INTEGER DEFAULT 1,
  max_per_order INTEGER DEFAULT 10,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'hidden', 'password', 'invite')),
  access_code TEXT,
  benefits TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  to_email TEXT,
  to_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  message TEXT,
  transfer_code TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  policy_number TEXT UNIQUE,
  coverage_type TEXT NOT NULL CHECK (coverage_type IN ('basic', 'premium', 'comprehensive')),
  coverage_amount DECIMAL(12,2) NOT NULL,
  premium DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired', 'cancelled')),
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_id UUID NOT NULL REFERENCES ticket_insurance(id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('cancellation', 'illness', 'emergency', 'weather', 'other')),
  description TEXT NOT NULL,
  documentation_urls TEXT[] DEFAULT '{}',
  amount_claimed DECIMAL(12,2) NOT NULL,
  amount_approved DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'denied', 'paid')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('purchased', 'transferred', 'scanned', 'refunded', 'upgraded', 'exchanged')),
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  checkin_type TEXT DEFAULT 'entry' CHECK (checkin_type IN ('entry', 'exit', 'reentry')),
  gate TEXT,
  method TEXT CHECK (method IN ('qr', 'barcode', 'rfid', 'manual', 'facial')),
  device_id TEXT,
  checked_in_by UUID REFERENCES auth.users(id),
  checked_in_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'wallet', 'mail', 'will_call')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  recipient_email TEXT,
  recipient_phone TEXT,
  tracking_number TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_print_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  print_type TEXT CHECK (print_type IN ('home', 'box_office', 'kiosk')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mobile_ticket_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('apple_wallet', 'google_wallet', 'sms', 'email')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  pass_url TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id),
  target_price DECIMAL(12,2) NOT NULL,
  alert_type TEXT DEFAULT 'below' CHECK (alert_type IN ('below', 'above', 'any_change')),
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TRAVEL TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS travel_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  package_type TEXT CHECK (package_type IN ('flight_hotel', 'hotel_only', 'transport_only', 'all_inclusive')),
  base_price DECIMAL(12,2) NOT NULL,
  includes_ticket BOOLEAN DEFAULT false,
  includes_hotel BOOLEAN DEFAULT false,
  includes_transport BOOLEAN DEFAULT false,
  hotel_details JSONB DEFAULT '{}'::jsonb,
  transport_details JSONB DEFAULT '{}'::jsonb,
  max_guests INTEGER DEFAULT 2,
  availability INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS travel_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  guest_count INTEGER NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price DECIMAL(12,2) NOT NULL,
  confirmation_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transport_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  transport_type TEXT NOT NULL CHECK (transport_type IN ('shuttle', 'rideshare', 'parking', 'public_transit')),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  pickup_locations JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '{}'::jsonb,
  capacity INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tourism_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  partner_type TEXT CHECK (partner_type IN ('hotel', 'airline', 'car_rental', 'attraction', 'restaurant')),
  discount_code TEXT,
  discount_percent DECIMAL(5,2),
  terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tourism_board_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  board_name TEXT NOT NULL,
  region TEXT,
  contact_info JSONB DEFAULT '{}'::jsonb,
  partnership_details JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- UGC TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS ugc_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  hashtags TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  moderation_enabled BOOLEAN DEFAULT true,
  prizes JSONB DEFAULT '[]'::jsonb,
  terms_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ugc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ugc_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  content_type TEXT CHECK (content_type IN ('photo', 'video', 'story', 'reel', 'tiktok')),
  content_url TEXT,
  caption TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ugc_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag TEXT UNIQUE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  post_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ugc_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag_id UUID REFERENCES ugc_hashtags(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  author_id TEXT,
  author_name TEXT,
  author_avatar TEXT,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'carousel')),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USER PREFERENCE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_marketing BOOLEAN DEFAULT true,
  email_transactional BOOLEAN DEFAULT true,
  email_reminders BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  push_events BOOLEAN DEFAULT true,
  push_social BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  sms_reminders BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'instant' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_attendance BOOLEAN DEFAULT true,
  show_reviews BOOLEAN DEFAULT true,
  show_photos BOOLEAN DEFAULT true,
  allow_friend_requests BOOLEAN DEFAULT true,
  allow_messages TEXT DEFAULT 'friends' CHECK (allow_messages IN ('everyone', 'friends', 'none')),
  data_sharing_analytics BOOLEAN DEFAULT true,
  data_sharing_marketing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_accessibility_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  needs_wheelchair_access BOOLEAN DEFAULT false,
  needs_hearing_assistance BOOLEAN DEFAULT false,
  needs_visual_assistance BOOLEAN DEFAULT false,
  needs_mobility_assistance BOOLEAN DEFAULT false,
  dietary_restrictions TEXT[] DEFAULT '{}',
  other_requirements TEXT,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_dietary_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dietary_type TEXT CHECK (dietary_type IN ('none', 'vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'gluten_free')),
  allergies TEXT[] DEFAULT '{}',
  preferences TEXT[] DEFAULT '{}',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_music_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  favorite_genres TEXT[] DEFAULT '{}',
  favorite_artists UUID[] DEFAULT '{}',
  spotify_connected BOOLEAN DEFAULT false,
  apple_music_connected BOOLEAN DEFAULT false,
  top_tracks JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  steps_completed TEXT[] DEFAULT '{}',
  current_step TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  step_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT false,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  reported_content_type TEXT CHECK (reported_content_type IN ('user', 'post', 'comment', 'review', 'message')),
  reported_content_id UUID,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  perk_type TEXT NOT NULL,
  perk_value JSONB DEFAULT '{}'::jsonb,
  source TEXT,
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  is_profile_photo BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_store_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('refund', 'promotion', 'referral', 'compensation', 'gift')),
  source_id UUID,
  expires_at TIMESTAMPTZ,
  used_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VENUE TABLES (extended)
-- ============================================

CREATE TABLE IF NOT EXISTS venue_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  map_type TEXT CHECK (map_type IN ('floor_plan', 'seating', 'parking', 'accessibility', 'interactive')),
  image_url TEXT,
  svg_data TEXT,
  interactive_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venue_map_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES venue_maps(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('section', 'row', 'seat', 'amenity', 'entrance', 'exit')),
  element_id TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venue_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section_type TEXT CHECK (section_type IN ('general', 'reserved', 'vip', 'accessible', 'standing')),
  capacity INTEGER,
  price_tier TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venue_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES venue_sections(id) ON DELETE CASCADE,
  row_name TEXT NOT NULL,
  seat_number TEXT NOT NULL,
  seat_type TEXT DEFAULT 'standard' CHECK (seat_type IN ('standard', 'accessible', 'companion', 'premium', 'obstructed')),
  x_position DECIMAL(10,4),
  y_position DECIMAL(10,4),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section_id, row_name, seat_number)
);

CREATE TABLE IF NOT EXISTS venue_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amenity_type TEXT CHECK (amenity_type IN ('restroom', 'food', 'bar', 'atm', 'first_aid', 'info', 'merch', 'vip_lounge', 'smoking', 'charging')),
  location TEXT,
  floor TEXT,
  is_accessible BOOLEAN DEFAULT false,
  hours TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venue_accessibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('wheelchair_ramp', 'elevator', 'accessible_seating', 'accessible_restroom', 'hearing_loop', 'braille_signage', 'service_animal_area')),
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venue_parking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  lot_name TEXT NOT NULL,
  address TEXT,
  total_spaces INTEGER,
  accessible_spaces INTEGER,
  price DECIMAL(10,2),
  distance TEXT,
  directions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venue_food_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vendor_name TEXT,
  cuisine_type TEXT,
  location TEXT,
  menu_url TEXT,
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  dietary_options TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VIP TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS vip_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  access_type TEXT CHECK (access_type IN ('ticket', 'upgrade', 'invite_only', 'membership')),
  amenities TEXT[] DEFAULT '{}',
  price DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VR TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS vr_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  experience_type TEXT CHECK (experience_type IN ('360_video', 'interactive', 'virtual_venue', 'backstage', 'meet_greet')),
  content_url TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  is_live BOOLEAN DEFAULT false,
  max_concurrent_users INTEGER,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES vr_experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  device_type TEXT,
  quality_settings JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS user_vr_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES vr_experiences(id) ON DELETE CASCADE,
  access_type TEXT CHECK (access_type IN ('purchased', 'included', 'trial', 'gifted')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, experience_id)
);

-- ============================================
-- WATCH PARTY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS watch_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  stream_id UUID,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  party_type TEXT DEFAULT 'public' CHECK (party_type IN ('public', 'private', 'friends_only')),
  max_attendees INTEGER,
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  invite_code TEXT UNIQUE,
  chat_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watch_party_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'kicked')),
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  UNIQUE(party_id, user_id)
);

-- ============================================
-- WILL CALL TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS will_call_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  ticket_id UUID,
  pickup_name TEXT NOT NULL,
  pickup_email TEXT,
  pickup_phone TEXT,
  id_required BOOLEAN DEFAULT true,
  id_type TEXT,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'picked_up', 'cancelled')),
  picked_up_at TIMESTAMPTZ,
  picked_up_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_id UUID,
  pass_type TEXT NOT NULL CHECK (pass_type IN ('apple_wallet', 'google_wallet')),
  pass_url TEXT,
  pass_serial TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'voided', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_print_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_ticket_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_board_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_music_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_map_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_accessibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_parking ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_food_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE vr_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vr_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_call_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_passes ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Authenticated users can read ticket_types" ON ticket_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ticket_tiers" ON ticket_tiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ticket_purchases" ON ticket_purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ticket_transfers" ON ticket_transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ticket_insurance" ON ticket_insurance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read insurance_claims" ON insurance_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ticket_activity" ON ticket_activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ticket_checkins" ON ticket_checkins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ticket_deliveries" ON ticket_deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ticket_print_logs" ON ticket_print_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read mobile_ticket_deliveries" ON mobile_ticket_deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their price_alerts" ON price_alerts FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read travel_packages" ON travel_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their travel_bookings" ON travel_bookings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read transport_options" ON transport_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read tourism_partnerships" ON tourism_partnerships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read tourism_board_partnerships" ON tourism_board_partnerships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ugc_campaigns" ON ugc_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ugc_submissions" ON ugc_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ugc_hashtags" ON ugc_hashtags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read ugc_posts" ON ugc_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their user_notification_preferences" ON user_notification_preferences FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their user_privacy_settings" ON user_privacy_settings FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their user_accessibility_preferences" ON user_accessibility_preferences FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their user_dietary_preferences" ON user_dietary_preferences FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their user_music_preferences" ON user_music_preferences FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their user_onboarding_progress" ON user_onboarding_progress FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read onboarding_tasks" ON onboarding_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read user_reports" ON user_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their user_perks" ON user_perks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read user_photos" ON user_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their user_store_credits" ON user_store_credits FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read venue_maps" ON venue_maps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read venue_map_data" ON venue_map_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read venue_sections" ON venue_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read venue_seats" ON venue_seats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read venue_amenities" ON venue_amenities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read venue_accessibility" ON venue_accessibility FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read venue_parking" ON venue_parking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read venue_food_options" ON venue_food_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read vip_zones" ON vip_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read vr_experiences" ON vr_experiences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their vr_sessions" ON vr_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can read their user_vr_access" ON user_vr_access FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read watch_parties" ON watch_parties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read watch_party_attendees" ON watch_party_attendees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read will_call_entries" ON will_call_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their wallet_passes" ON wallet_passes FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_from_user_id ON ticket_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_checkins_event_id ON ticket_checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_travel_packages_event_id ON travel_packages(event_id);
CREATE INDEX IF NOT EXISTS idx_ugc_campaigns_event_id ON ugc_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_venue_maps_venue_id ON venue_maps(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_sections_venue_id ON venue_sections(venue_id);
CREATE INDEX IF NOT EXISTS idx_vr_experiences_event_id ON vr_experiences(event_id);
CREATE INDEX IF NOT EXISTS idx_watch_parties_event_id ON watch_parties(event_id);
CREATE INDEX IF NOT EXISTS idx_will_call_entries_event_id ON will_call_entries(event_id);
