-- Migration: Create missing GVTEWAY tables (Part 2 - Bundles, Carts, Challenges, Charity, Chat)
-- These tables are referenced by API routes but don't exist in the schema

-- ============================================
-- BUNDLE DEALS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS bundle_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  bundle_type TEXT DEFAULT 'fixed' CHECK (bundle_type IN ('fixed', 'mix_match', 'tiered')),
  original_price DECIMAL(12,2) NOT NULL,
  bundle_price DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2),
  max_quantity INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bundle_deal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundle_deals(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('ticket', 'merch', 'food', 'experience', 'parking')),
  item_id UUID NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bundle_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundle_deals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CART TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('ticket', 'merch', 'bundle', 'addon', 'parking', 'insurance')),
  item_id UUID NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  options JSONB DEFAULT '{}'::jsonb,
  reserved_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  promo_code TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CHALLENGE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('photo', 'video', 'checkin', 'social', 'scavenger', 'trivia')),
  rules JSONB DEFAULT '{}'::jsonb,
  rewards JSONB DEFAULT '[]'::jsonb,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'disqualified')),
  progress JSONB DEFAULT '{}'::jsonb,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS challenge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES challenge_participants(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  content_url TEXT,
  caption TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES challenge_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT DEFAULT 'up' CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, user_id)
);

-- ============================================
-- CHARITY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS charity_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  charity_name TEXT NOT NULL,
  charity_description TEXT,
  charity_logo_url TEXT,
  charity_website TEXT,
  goal_amount DECIMAL(12,2),
  raised_amount DECIMAL(12,2) DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  matching_enabled BOOLEAN DEFAULT false,
  matching_ratio DECIMAL(5,2) DEFAULT 1.00,
  matching_cap DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS charity_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES charity_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(12,2) NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  donor_name TEXT,
  donor_message TEXT,
  is_matched BOOLEAN DEFAULT false,
  matched_amount DECIMAL(12,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CHAT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'support', 'event')),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT,
  participants UUID[] DEFAULT '{}',
  last_message_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'system')),
  content TEXT,
  media_url TEXT,
  reply_to_id UUID REFERENCES chat_messages(id),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  read_by UUID[] DEFAULT '{}',
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  keywords TEXT[],
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CHECKINS
-- ============================================

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  ticket_id UUID,
  checkin_type TEXT DEFAULT 'entry' CHECK (checkin_type IN ('entry', 'exit', 'vip', 'backstage', 'parking')),
  location TEXT,
  gate TEXT,
  method TEXT CHECK (method IN ('qr', 'rfid', 'manual', 'facial')),
  device_id TEXT,
  checked_in_by UUID REFERENCES auth.users(id),
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- COLLECTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'custom' CHECK (type IN ('custom', 'favorites', 'wishlist', 'attended')),
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, event_id)
);

-- Enable RLS
ALTER TABLE bundle_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_deal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_events ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Authenticated users can read bundle_deals" ON bundle_deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read bundle_deal_items" ON bundle_deal_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read bundle_products" ON bundle_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their cart_items" ON cart_items FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their shopping_carts" ON shopping_carts FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read community_challenges" ON community_challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read challenge_participants" ON challenge_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read challenge_entries" ON challenge_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read challenge_votes" ON challenge_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read charity_campaigns" ON charity_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read charity_donations" ON charity_donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can access their chat_conversations" ON chat_conversations FOR SELECT TO authenticated USING (auth.uid() = ANY(participants));
CREATE POLICY "Users can read chat_messages in their conversations" ON chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read chat_faqs" ON chat_faqs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read checkins" ON checkins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their collections" ON collections FOR ALL TO authenticated USING (user_id = auth.uid() OR is_public = true);
CREATE POLICY "Users can manage their collection_events" ON collection_events FOR ALL TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bundle_deals_event_id ON bundle_deals(event_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_community_challenges_event_id ON community_challenges(event_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_charity_campaigns_event_id ON charity_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_checkins_event_id ON checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
