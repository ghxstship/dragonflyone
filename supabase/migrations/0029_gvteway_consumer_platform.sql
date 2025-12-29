-- ============================================================================
-- 0029_gvteway_consumer_platform.sql
-- GVTEWAY Consumer Platform - 3NF Single Source of Truth
-- GHXSTSHIP Platform - Memberships, Reviews, Social, Community
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================

CREATE TYPE membership_tier AS ENUM ('free', 'basic', 'premium', 'vip', 'elite');
CREATE TYPE membership_status AS ENUM ('active', 'paused', 'cancelled', 'expired', 'pending');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'flagged', 'removed');
CREATE TYPE connection_type AS ENUM ('friend', 'follower', 'blocked', 'muted');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined', 'removed');
CREATE TYPE forum_post_type AS ENUM ('discussion', 'question', 'announcement', 'poll', 'event');
CREATE TYPE forum_post_status AS ENUM ('draft', 'published', 'hidden', 'locked', 'archived');
CREATE TYPE gift_card_status AS ENUM ('inactive', 'active', 'partially_used', 'depleted', 'expired', 'cancelled');
CREATE TYPE reward_type AS ENUM ('points', 'discount', 'free_item', 'upgrade', 'experience', 'cashback');
CREATE TYPE reward_status AS ENUM ('available', 'claimed', 'redeemed', 'expired', 'revoked');
CREATE TYPE ugc_type AS ENUM ('photo', 'video', 'story', 'review', 'comment', 'post');
CREATE TYPE ugc_status AS ENUM ('pending', 'approved', 'rejected', 'flagged', 'removed');
CREATE TYPE lost_found_status AS ENUM ('reported', 'searching', 'found', 'claimed', 'unclaimed', 'disposed');

-- ============================================================================
-- SECTION 2: MEMBERSHIPS & FAN CLUBS
-- ============================================================================

CREATE TABLE membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tier membership_tier NOT NULL,
  description TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  price_monthly NUMERIC(10,2),
  price_yearly NUMERIC(10,2),
  price_lifetime NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  trial_days INTEGER DEFAULT 0,
  max_members INTEGER,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES membership_tiers(id) ON DELETE RESTRICT,
  membership_number TEXT,
  status membership_status NOT NULL DEFAULT 'pending',
  billing_cycle TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  trial_end_date DATE,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  pause_start DATE,
  pause_end DATE,
  auto_renew BOOLEAN DEFAULT true,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  last_payment_date DATE,
  next_payment_date DATE,
  total_paid NUMERIC(12,2) DEFAULT 0,
  referral_code TEXT,
  referred_by UUID REFERENCES memberships(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fan_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  is_official BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  rules TEXT,
  welcome_message TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE fan_club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_club_id UUID NOT NULL REFERENCES fan_clubs(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(fan_club_id, person_id)
);

-- ============================================================================
-- SECTION 3: REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  pros TEXT,
  cons TEXT,
  rating_details JSONB DEFAULT '{}'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  is_verified_purchase BOOLEAN DEFAULT false,
  purchase_id UUID,
  attended_date DATE,
  status review_status NOT NULL DEFAULT 'pending',
  moderated_by UUID REFERENCES platform_users(id),
  moderated_at TIMESTAMPTZ,
  moderation_notes TEXT,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  response_text TEXT,
  response_by UUID REFERENCES platform_users(id),
  response_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL,
  report_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id, person_id, vote_type)
);

-- ============================================================================
-- SECTION 4: USER PREFERENCES (FAVORITES, WISHLIST, SAVED SEARCHES)
-- ============================================================================

CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  notes TEXT,
  notify_on_update BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id, entity_type, entity_id)
);

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Wishlist',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  priority INTEGER DEFAULT 0,
  notes TEXT,
  price_at_add NUMERIC(10,2),
  notify_on_sale BOOLEAN DEFAULT false,
  notify_on_availability BOOLEAN DEFAULT false,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, entity_type, entity_id)
);

CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_type TEXT NOT NULL,
  query TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  location JSONB,
  date_range JSONB,
  notify_new_results BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'daily',
  last_notified_at TIMESTAMPTZ,
  result_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  target_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2),
  alert_type TEXT DEFAULT 'below',
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 5: SOCIAL CONNECTIONS
-- ============================================================================

CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  connected_person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  connection_type connection_type NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(person_id, connected_person_id, connection_type),
  CHECK (person_id != connected_person_id)
);

CREATE TABLE social_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  group_type TEXT DEFAULT 'interest',
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  member_count INTEGER DEFAULT 0,
  rules TEXT,
  created_by UUID NOT NULL REFERENCES legend_people(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE social_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES social_groups(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  invited_by UUID REFERENCES legend_people(id),
  is_active BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(group_id, person_id)
);

-- ============================================================================
-- SECTION 6: COMMUNITY & FORUMS
-- ============================================================================

CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  post_count INTEGER DEFAULT 0,
  last_post_at TIMESTAMPTZ,
  moderators JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  post_type forum_post_type NOT NULL DEFAULT 'discussion',
  status forum_post_status NOT NULL DEFAULT 'published',
  title TEXT,
  content TEXT NOT NULL,
  content_format TEXT DEFAULT 'markdown',
  poll_options JSONB,
  poll_end_date TIMESTAMPTZ,
  poll_allow_multiple BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  accepted_answer_id UUID REFERENCES forum_posts(id),
  moderated_by UUID REFERENCES platform_users(id),
  moderated_at TIMESTAMPTZ,
  moderation_reason TEXT,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE forum_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, person_id, reaction_type)
);

CREATE TABLE forum_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, person_id, option_index)
);

-- ============================================================================
-- SECTION 7: GIFT CARDS & VOUCHERS
-- ============================================================================

CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  pin TEXT,
  status gift_card_status NOT NULL DEFAULT 'inactive',
  initial_value NUMERIC(10,2) NOT NULL,
  current_balance NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  purchaser_id UUID REFERENCES legend_people(id),
  recipient_email TEXT,
  recipient_name TEXT,
  recipient_message TEXT,
  purchased_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_digital BOOLEAN DEFAULT true,
  design_template TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  order_id UUID REFERENCES orders(id),
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 8: LOYALTY & REWARDS
-- ============================================================================

CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  points_per_dollar NUMERIC(5,2) DEFAULT 1,
  points_currency TEXT DEFAULT 'points',
  is_active BOOLEAN DEFAULT true,
  rules JSONB DEFAULT '{}'::jsonb,
  tiers JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  tier_expires_at DATE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(program_id, person_id)
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  expires_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  program_id UUID REFERENCES loyalty_programs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  reward_type reward_type NOT NULL,
  points_required INTEGER,
  value NUMERIC(10,2),
  discount_percent NUMERIC(5,2),
  terms TEXT,
  valid_from DATE,
  valid_until DATE,
  max_redemptions INTEGER,
  redemption_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  account_id UUID REFERENCES loyalty_accounts(id),
  status reward_status NOT NULL DEFAULT 'claimed',
  points_spent INTEGER,
  redemption_code TEXT UNIQUE,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  order_id UUID REFERENCES orders(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  referred_email TEXT,
  status TEXT DEFAULT 'pending',
  referrer_reward_id UUID REFERENCES rewards(id),
  referred_reward_id UUID REFERENCES rewards(id),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 9: USER GENERATED CONTENT
-- ============================================================================

CREATE TABLE user_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  content_type ugc_type NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  description TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  media_type TEXT,
  duration_seconds INTEGER,
  status ugc_status NOT NULL DEFAULT 'pending',
  moderated_by UUID REFERENCES platform_users(id),
  moderated_at TIMESTAMPTZ,
  moderation_notes TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  location JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES user_content(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_id, person_id, interaction_type)
);

-- ============================================================================
-- SECTION 10: LOST & FOUND
-- ============================================================================

CREATE TABLE lost_found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES legend_places(id),
  item_type TEXT NOT NULL,
  status lost_found_status NOT NULL DEFAULT 'reported',
  is_lost BOOLEAN NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  color TEXT,
  brand TEXT,
  distinguishing_features TEXT,
  location_found TEXT,
  location_lost TEXT,
  date_reported DATE NOT NULL DEFAULT CURRENT_DATE,
  date_found DATE,
  photos JSONB DEFAULT '[]'::jsonb,
  reporter_id UUID REFERENCES legend_people(id),
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  finder_id UUID REFERENCES legend_people(id),
  finder_name TEXT,
  owner_id UUID REFERENCES legend_people(id),
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  claimed_at TIMESTAMPTZ,
  verification_questions JSONB DEFAULT '[]'::jsonb,
  storage_location TEXT,
  disposal_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 11: INDEXES
-- ============================================================================

CREATE INDEX idx_membership_tiers_org ON membership_tiers(organization_id, is_active);
CREATE INDEX idx_memberships_org ON memberships(organization_id, status);
CREATE INDEX idx_memberships_person ON memberships(person_id);
CREATE INDEX idx_fan_clubs_org ON fan_clubs(organization_id, is_active);
CREATE INDEX idx_fan_club_members_club ON fan_club_members(fan_club_id);
CREATE INDEX idx_fan_club_members_person ON fan_club_members(person_id);
CREATE INDEX idx_reviews_org ON reviews(organization_id, status);
CREATE INDEX idx_reviews_entity ON reviews(entity_type, entity_id, status);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_review_votes_review ON review_votes(review_id);
CREATE INDEX idx_user_favorites_person ON user_favorites(person_id);
CREATE INDEX idx_user_favorites_entity ON user_favorites(entity_type, entity_id);
CREATE INDEX idx_wishlists_person ON wishlists(person_id);
CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
CREATE INDEX idx_saved_searches_person ON saved_searches(person_id, is_active);
CREATE INDEX idx_price_alerts_person ON price_alerts(person_id, is_active);
CREATE INDEX idx_social_connections_person ON social_connections(person_id, status);
CREATE INDEX idx_social_connections_connected ON social_connections(connected_person_id, status);
CREATE INDEX idx_social_groups_org ON social_groups(organization_id, is_active);
CREATE INDEX idx_social_group_members_group ON social_group_members(group_id);
CREATE INDEX idx_forum_categories_org ON forum_categories(organization_id, is_active);
CREATE INDEX idx_forum_posts_category ON forum_posts(category_id, status, last_activity_at DESC);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_fts ON forum_posts USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')));
CREATE INDEX idx_gift_cards_org ON gift_cards(organization_id, status);
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_loyalty_programs_org ON loyalty_programs(organization_id, is_active);
CREATE INDEX idx_loyalty_accounts_person ON loyalty_accounts(person_id);
CREATE INDEX idx_rewards_org ON rewards(organization_id, is_active);
CREATE INDEX idx_referrals_org ON referrals(organization_id, status);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_user_content_org ON user_content(organization_id, status);
CREATE INDEX idx_user_content_creator ON user_content(creator_id);
CREATE INDEX idx_user_content_entity ON user_content(entity_type, entity_id);
CREATE INDEX idx_lost_found_org ON lost_found_items(organization_id, status);
CREATE INDEX idx_lost_found_event ON lost_found_items(event_id) WHERE event_id IS NOT NULL;

-- ============================================================================
-- SECTION 12: RLS POLICIES
-- ============================================================================

ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY membership_tiers_org_access ON membership_tiers FOR ALL USING (org_matches(organization_id));
CREATE POLICY memberships_org_access ON memberships FOR ALL USING (org_matches(organization_id));
CREATE POLICY fan_clubs_org_access ON fan_clubs FOR ALL USING (org_matches(organization_id));
CREATE POLICY fan_club_members_access ON fan_club_members FOR ALL USING (EXISTS (SELECT 1 FROM fan_clubs fc WHERE fc.id = fan_club_id AND org_matches(fc.organization_id)));
CREATE POLICY reviews_org_access ON reviews FOR ALL USING (org_matches(organization_id));
CREATE POLICY review_votes_access ON review_votes FOR ALL USING (EXISTS (SELECT 1 FROM reviews r WHERE r.id = review_id AND org_matches(r.organization_id)));
CREATE POLICY user_favorites_owner ON user_favorites FOR ALL USING (person_id = current_platform_user_id() OR role_in('admin', 'super_admin'));
CREATE POLICY wishlists_owner ON wishlists FOR ALL USING (person_id = current_platform_user_id() OR is_public = true OR role_in('admin', 'super_admin'));
CREATE POLICY wishlist_items_access ON wishlist_items FOR ALL USING (EXISTS (SELECT 1 FROM wishlists w WHERE w.id = wishlist_id AND (w.person_id = current_platform_user_id() OR w.is_public = true)));
CREATE POLICY saved_searches_owner ON saved_searches FOR ALL USING (person_id = current_platform_user_id() OR role_in('admin', 'super_admin'));
CREATE POLICY price_alerts_owner ON price_alerts FOR ALL USING (person_id = current_platform_user_id() OR role_in('admin', 'super_admin'));
CREATE POLICY social_connections_owner ON social_connections FOR ALL USING (person_id = current_platform_user_id() OR connected_person_id = current_platform_user_id());
CREATE POLICY social_groups_org_access ON social_groups FOR ALL USING (org_matches(organization_id));
CREATE POLICY social_group_members_access ON social_group_members FOR ALL USING (EXISTS (SELECT 1 FROM social_groups sg WHERE sg.id = group_id AND org_matches(sg.organization_id)));
CREATE POLICY forum_categories_org_access ON forum_categories FOR ALL USING (org_matches(organization_id));
CREATE POLICY forum_posts_org_access ON forum_posts FOR ALL USING (org_matches(organization_id));
CREATE POLICY forum_post_reactions_access ON forum_post_reactions FOR ALL USING (EXISTS (SELECT 1 FROM forum_posts fp WHERE fp.id = post_id AND org_matches(fp.organization_id)));
CREATE POLICY forum_poll_votes_access ON forum_poll_votes FOR ALL USING (EXISTS (SELECT 1 FROM forum_posts fp WHERE fp.id = post_id AND org_matches(fp.organization_id)));
CREATE POLICY gift_cards_org_access ON gift_cards FOR ALL USING (org_matches(organization_id));
CREATE POLICY gift_card_transactions_access ON gift_card_transactions FOR ALL USING (EXISTS (SELECT 1 FROM gift_cards gc WHERE gc.id = gift_card_id AND org_matches(gc.organization_id)));
CREATE POLICY loyalty_programs_org_access ON loyalty_programs FOR ALL USING (org_matches(organization_id));
CREATE POLICY loyalty_accounts_access ON loyalty_accounts FOR ALL USING (EXISTS (SELECT 1 FROM loyalty_programs lp WHERE lp.id = program_id AND org_matches(lp.organization_id)));
CREATE POLICY loyalty_transactions_access ON loyalty_transactions FOR ALL USING (EXISTS (SELECT 1 FROM loyalty_accounts la JOIN loyalty_programs lp ON la.program_id = lp.id WHERE la.id = account_id AND org_matches(lp.organization_id)));
CREATE POLICY rewards_org_access ON rewards FOR ALL USING (org_matches(organization_id));
CREATE POLICY reward_redemptions_access ON reward_redemptions FOR ALL USING (EXISTS (SELECT 1 FROM rewards r WHERE r.id = reward_id AND org_matches(r.organization_id)));
CREATE POLICY referrals_org_access ON referrals FOR ALL USING (org_matches(organization_id));
CREATE POLICY user_content_org_access ON user_content FOR ALL USING (org_matches(organization_id));
CREATE POLICY content_interactions_access ON content_interactions FOR ALL USING (EXISTS (SELECT 1 FROM user_content uc WHERE uc.id = content_id AND org_matches(uc.organization_id)));
CREATE POLICY lost_found_org_access ON lost_found_items FOR ALL USING (org_matches(organization_id));

-- ============================================================================
-- SECTION 13: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON membership_tiers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fan_clubs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fan_club_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wishlists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wishlist_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_searches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON price_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_group_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON forum_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON forum_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON forum_post_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON forum_poll_votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gift_cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gift_card_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_programs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON rewards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reward_redemptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON referrals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lost_found_items TO authenticated;

-- ============================================================================
-- SECTION 14: TRIGGERS
-- ============================================================================

CREATE TRIGGER membership_tiers_updated_at BEFORE UPDATE ON membership_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER fan_clubs_updated_at BEFORE UPDATE ON fan_clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER wishlists_updated_at BEFORE UPDATE ON wishlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER saved_searches_updated_at BEFORE UPDATE ON saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER price_alerts_updated_at BEFORE UPDATE ON price_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER social_groups_updated_at BEFORE UPDATE ON social_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER forum_categories_updated_at BEFORE UPDATE ON forum_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER gift_cards_updated_at BEFORE UPDATE ON gift_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER user_content_updated_at BEFORE UPDATE ON user_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER lost_found_updated_at BEFORE UPDATE ON lost_found_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
