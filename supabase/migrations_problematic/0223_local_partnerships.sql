-- Migration: Local Business and Tourism Board Partnerships
-- Description: Manage partnerships with local businesses and tourism boards for event promotion

-- Partner types
CREATE TABLE IF NOT EXISTS partner_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners (local businesses, tourism boards, etc.)
CREATE TABLE IF NOT EXISTS local_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type_id UUID REFERENCES partner_types(id),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  social_media JSONB DEFAULT '{}',
  business_hours JSONB DEFAULT '{}',
  categories JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  partnership_tier VARCHAR(50) DEFAULT 'standard' CHECK (partnership_tier IN ('platinum', 'gold', 'silver', 'bronze', 'standard')),
  commission_rate DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  contract_start_date DATE,
  contract_end_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Partner contacts
CREATE TABLE IF NOT EXISTS partner_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES local_partners(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  department VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner offers/deals
CREATE TABLE IF NOT EXISTS partner_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES local_partners(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  offer_type VARCHAR(50) NOT NULL CHECK (offer_type IN ('discount', 'package', 'exclusive', 'promotion', 'bundle')),
  discount_type VARCHAR(50) CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'free_item')),
  discount_value DECIMAL(10,2),
  minimum_purchase DECIMAL(10,2),
  promo_code VARCHAR(50),
  terms_conditions TEXT,
  valid_from DATE,
  valid_until DATE,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  is_exclusive_to_events BOOLEAN DEFAULT FALSE,
  applicable_events JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner-event associations
CREATE TABLE IF NOT EXISTS partner_event_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES local_partners(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  association_type VARCHAR(50) NOT NULL CHECK (association_type IN ('sponsor', 'vendor', 'accommodation', 'transportation', 'dining', 'attraction', 'promotion')),
  partnership_level VARCHAR(50),
  benefits JSONB DEFAULT '[]',
  obligations JSONB DEFAULT '[]',
  fee DECIMAL(12,2),
  revenue_share DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, event_id, association_type)
);

-- Partner referrals/leads
CREATE TABLE IF NOT EXISTS partner_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES local_partners(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  referral_type VARCHAR(50) NOT NULL CHECK (referral_type IN ('ticket_sale', 'booking', 'lead', 'registration')),
  referral_code VARCHAR(50),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  transaction_amount DECIMAL(12,2),
  commission_amount DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'paid', 'disputed', 'cancelled')),
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tourism board regions
CREATE TABLE IF NOT EXISTS tourism_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  country VARCHAR(100),
  state_province VARCHAR(100),
  cities JSONB DEFAULT '[]',
  tourism_board_id UUID REFERENCES local_partners(id),
  visitor_info_url TEXT,
  events_calendar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner performance metrics
CREATE TABLE IF NOT EXISTS partner_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES local_partners(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  referrals INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  commission_earned DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, metric_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_local_partners_type ON local_partners(partner_type_id);
CREATE INDEX IF NOT EXISTS idx_local_partners_status ON local_partners(status);
CREATE INDEX IF NOT EXISTS idx_local_partners_city ON local_partners(city);
CREATE INDEX IF NOT EXISTS idx_local_partners_tier ON local_partners(partnership_tier);
CREATE INDEX IF NOT EXISTS idx_partner_contacts_partner ON partner_contacts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_offers_partner ON partner_offers(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_offers_active ON partner_offers(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_partner_event_assoc_partner ON partner_event_associations(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_event_assoc_event ON partner_event_associations(event_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner ON partner_referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_event ON partner_referrals(event_id);
CREATE INDEX IF NOT EXISTS idx_partner_metrics_partner ON partner_metrics(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_metrics_date ON partner_metrics(metric_date);

-- RLS Policies
ALTER TABLE partner_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_event_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access for partner types and active partners
CREATE POLICY "partner_types_select" ON partner_types FOR SELECT USING (true);
CREATE POLICY "local_partners_select" ON local_partners FOR SELECT USING (status = 'active');
CREATE POLICY "partner_offers_select" ON partner_offers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "tourism_regions_select" ON tourism_regions FOR SELECT USING (is_active = TRUE);

-- Admin policies
CREATE POLICY "local_partners_manage" ON local_partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "partner_contacts_manage" ON partner_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "partner_offers_manage" ON partner_offers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "partner_event_assoc_manage" ON partner_event_associations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'GVTEWAY_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "partner_referrals_select" ON partner_referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "partner_referrals_insert" ON partner_referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "partner_metrics_select" ON partner_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "tourism_regions_manage" ON tourism_regions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Seed partner types
INSERT INTO partner_types (name, code, description, icon) VALUES
  ('Tourism Board', 'tourism_board', 'Regional or local tourism authority', 'map'),
  ('Hotel/Accommodation', 'accommodation', 'Hotels, motels, vacation rentals', 'bed'),
  ('Restaurant/Dining', 'dining', 'Restaurants, bars, cafes', 'utensils'),
  ('Transportation', 'transportation', 'Airlines, car rentals, rideshare, shuttles', 'car'),
  ('Attraction', 'attraction', 'Museums, theme parks, tours', 'landmark'),
  ('Retail', 'retail', 'Shops, boutiques, merchandise', 'shopping-bag'),
  ('Entertainment', 'entertainment', 'Clubs, venues, entertainment providers', 'music'),
  ('Service Provider', 'service', 'Photography, concierge, other services', 'briefcase'),
  ('Sponsor', 'sponsor', 'Corporate sponsors and brand partners', 'award'),
  ('Media Partner', 'media', 'Press, radio, TV, influencers', 'tv')
ON CONFLICT (code) DO NOTHING;
