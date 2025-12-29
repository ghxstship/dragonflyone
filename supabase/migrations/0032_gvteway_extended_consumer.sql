-- ============================================================================
-- 0032_gvteway_extended_consumer.sql
-- GVTEWAY Extended Consumer Features - Collections, Surveys, Resale, Watch Parties
-- GHXSTSHIP Platform - 100% GVTEWAY Feature Coverage
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUM TYPES
-- ============================================================================

CREATE TYPE survey_status AS ENUM ('draft', 'active', 'paused', 'closed', 'archived');
CREATE TYPE resale_status AS ENUM ('draft', 'active', 'pending_sale', 'sold', 'expired', 'cancelled');
CREATE TYPE watch_party_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled');

-- ============================================================================
-- SECTION 2: COLLECTIONS
-- ============================================================================

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES legend_people(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  collection_type TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_curated BOOLEAN DEFAULT false,
  item_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  added_by UUID REFERENCES legend_people(id),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, entity_type, entity_id)
);

CREATE TABLE collection_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, person_id)
);

-- ============================================================================
-- SECTION 3: USER MATCHING
-- ============================================================================

CREATE TABLE user_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  matched_person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL,
  match_score NUMERIC(5,2),
  match_reasons JSONB DEFAULT '[]'::jsonb,
  common_interests JSONB DEFAULT '[]'::jsonb,
  common_events JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'suggested',
  person_action TEXT,
  matched_person_action TEXT,
  connected_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id, matched_person_id),
  CHECK (person_id != matched_person_id)
);

-- ============================================================================
-- SECTION 4: SURVEYS
-- ============================================================================

CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  survey_type TEXT NOT NULL,
  status survey_status NOT NULL DEFAULT 'draft',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  response_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT false,
  thank_you_message TEXT,
  created_by UUID REFERENCES platform_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES legend_people(id),
  respondent_email TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_complete BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- SECTION 5: QA SESSIONS
-- ============================================================================

CREATE TABLE qa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  host_id UUID REFERENCES legend_people(id),
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  is_public BOOLEAN DEFAULT true,
  max_participants INTEGER,
  participant_count INTEGER DEFAULT 0,
  question_count INTEGER DEFAULT 0,
  stream_url TEXT,
  recording_url TEXT,
  moderation_enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES qa_sessions(id) ON DELETE CASCADE,
  asker_id UUID REFERENCES legend_people(id),
  asker_name TEXT,
  question TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  is_anonymous BOOLEAN DEFAULT false,
  upvote_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  answer TEXT,
  answered_by UUID REFERENCES legend_people(id),
  answered_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE qa_question_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, person_id)
);

-- ============================================================================
-- SECTION 6: RESALE MARKETPLACE
-- ============================================================================

CREATE TABLE resale_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  original_order_id UUID REFERENCES orders(id),
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  ticket_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  original_price NUMERIC(10,2) NOT NULL,
  asking_price NUMERIC(10,2) NOT NULL,
  min_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  section TEXT,
  row TEXT,
  seats TEXT,
  status resale_status NOT NULL DEFAULT 'draft',
  description TEXT,
  transfer_method TEXT,
  listed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  buyer_id UUID REFERENCES legend_people(id),
  sale_price NUMERIC(10,2),
  platform_fee NUMERIC(10,2),
  seller_payout NUMERIC(10,2),
  payout_status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resale_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES resale_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  offer_amount NUMERIC(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 7: WATCH PARTIES
-- ============================================================================

CREATE TABLE watch_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status watch_party_status NOT NULL DEFAULT 'scheduled',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  stream_url TEXT,
  chat_enabled BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  max_participants INTEGER,
  participant_count INTEGER DEFAULT 0,
  cover_image_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE watch_party_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_party_id UUID NOT NULL REFERENCES watch_parties(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(watch_party_id, person_id)
);

CREATE TABLE watch_party_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_party_id UUID NOT NULL REFERENCES watch_parties(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 8: ACCESSIBILITY
-- ============================================================================

CREATE TABLE accessibility_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES legend_places(id),
  event_id UUID REFERENCES legend_events(id),
  feature_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  availability TEXT DEFAULT 'available',
  location_details TEXT,
  booking_required BOOLEAN DEFAULT false,
  advance_notice_hours INTEGER,
  capacity INTEGER,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accessibility_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  request_type TEXT NOT NULL,
  requirements TEXT NOT NULL,
  companion_count INTEGER DEFAULT 0,
  equipment_needed JSONB DEFAULT '[]'::jsonb,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES platform_users(id),
  response_notes TEXT,
  confirmed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 9: INDEXES
-- ============================================================================

CREATE INDEX idx_collections_org ON collections(organization_id, is_public);
CREATE INDEX idx_collections_creator ON collections(creator_id) WHERE creator_id IS NOT NULL;
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_followers_collection ON collection_followers(collection_id);
CREATE INDEX idx_user_matches_person ON user_matches(person_id, status);
CREATE INDEX idx_surveys_org ON surveys(organization_id, status);
CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_qa_sessions_org ON qa_sessions(organization_id, status);
CREATE INDEX idx_qa_questions_session ON qa_questions(session_id, status);
CREATE INDEX idx_resale_listings_org ON resale_listings(organization_id, status);
CREATE INDEX idx_resale_listings_event ON resale_listings(event_id, status) WHERE event_id IS NOT NULL;
CREATE INDEX idx_resale_listings_seller ON resale_listings(seller_id);
CREATE INDEX idx_resale_offers_listing ON resale_offers(listing_id, status);
CREATE INDEX idx_watch_parties_org ON watch_parties(organization_id, status);
CREATE INDEX idx_watch_party_participants_party ON watch_party_participants(watch_party_id);
CREATE INDEX idx_watch_party_messages_party ON watch_party_messages(watch_party_id, created_at DESC);
CREATE INDEX idx_accessibility_features_org ON accessibility_features(organization_id, is_active);
CREATE INDEX idx_accessibility_requests_org ON accessibility_requests(organization_id, status);

-- ============================================================================
-- SECTION 10: RLS POLICIES
-- ============================================================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_party_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY collections_org ON collections FOR ALL USING (org_matches(organization_id));
CREATE POLICY collection_items_access ON collection_items FOR ALL USING (EXISTS (SELECT 1 FROM collections c WHERE c.id = collection_id AND org_matches(c.organization_id)));
CREATE POLICY collection_followers_access ON collection_followers FOR ALL USING (EXISTS (SELECT 1 FROM collections c WHERE c.id = collection_id AND org_matches(c.organization_id)));
CREATE POLICY user_matches_org ON user_matches FOR ALL USING (org_matches(organization_id));
CREATE POLICY surveys_org ON surveys FOR ALL USING (org_matches(organization_id));
CREATE POLICY survey_responses_access ON survey_responses FOR ALL USING (EXISTS (SELECT 1 FROM surveys s WHERE s.id = survey_id AND org_matches(s.organization_id)));
CREATE POLICY qa_sessions_org ON qa_sessions FOR ALL USING (org_matches(organization_id));
CREATE POLICY qa_questions_access ON qa_questions FOR ALL USING (EXISTS (SELECT 1 FROM qa_sessions qs WHERE qs.id = session_id AND org_matches(qs.organization_id)));
CREATE POLICY qa_question_votes_access ON qa_question_votes FOR ALL USING (EXISTS (SELECT 1 FROM qa_questions qq JOIN qa_sessions qs ON qq.session_id = qs.id WHERE qq.id = question_id AND org_matches(qs.organization_id)));
CREATE POLICY resale_listings_org ON resale_listings FOR ALL USING (org_matches(organization_id));
CREATE POLICY resale_offers_access ON resale_offers FOR ALL USING (EXISTS (SELECT 1 FROM resale_listings rl WHERE rl.id = listing_id AND org_matches(rl.organization_id)));
CREATE POLICY watch_parties_org ON watch_parties FOR ALL USING (org_matches(organization_id));
CREATE POLICY watch_party_participants_access ON watch_party_participants FOR ALL USING (EXISTS (SELECT 1 FROM watch_parties wp WHERE wp.id = watch_party_id AND org_matches(wp.organization_id)));
CREATE POLICY watch_party_messages_access ON watch_party_messages FOR ALL USING (EXISTS (SELECT 1 FROM watch_parties wp WHERE wp.id = watch_party_id AND org_matches(wp.organization_id)));
CREATE POLICY accessibility_features_org ON accessibility_features FOR ALL USING (org_matches(organization_id));
CREATE POLICY accessibility_requests_org ON accessibility_requests FOR ALL USING (org_matches(organization_id));

-- ============================================================================
-- SECTION 11: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON collections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON collection_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON collection_followers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON surveys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON survey_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON qa_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON qa_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON qa_question_votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON resale_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON resale_offers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON watch_parties TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON watch_party_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON watch_party_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON accessibility_features TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON accessibility_requests TO authenticated;

-- ============================================================================
-- SECTION 12: TRIGGERS
-- ============================================================================

CREATE TRIGGER collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER user_matches_updated_at BEFORE UPDATE ON user_matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER surveys_updated_at BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER qa_sessions_updated_at BEFORE UPDATE ON qa_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER qa_questions_updated_at BEFORE UPDATE ON qa_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER resale_listings_updated_at BEFORE UPDATE ON resale_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER resale_offers_updated_at BEFORE UPDATE ON resale_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER watch_parties_updated_at BEFORE UPDATE ON watch_parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER accessibility_features_updated_at BEFORE UPDATE ON accessibility_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER accessibility_requests_updated_at BEFORE UPDATE ON accessibility_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
