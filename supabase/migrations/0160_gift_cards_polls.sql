-- Migration: Gift Cards and Community Polls
-- Adds gift card system and community voting functionality

-- Gift Cards Table
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  purchaser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  initial_balance DECIMAL(10, 2) NOT NULL,
  current_balance DECIMAL(10, 2) NOT NULL,
  design VARCHAR(50) DEFAULT 'classic',
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(255),
  message TEXT,
  delivery_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
  redeemed_by UUID REFERENCES profiles(id),
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift Card Transactions Table
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'redeem', 'use', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  order_id UUID REFERENCES orders(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Store Credits Table
CREATE TABLE IF NOT EXISTS user_store_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Polls Table
CREATE TABLE IF NOT EXISTS community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'upcoming')),
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll Options Table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  votes_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll Votes Table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser ON gift_cards(purchaser_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_card ON gift_card_transactions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_user_store_credits_user ON user_store_credits(user_id);

CREATE INDEX IF NOT EXISTS idx_community_polls_event ON community_polls(event_id);
CREATE INDEX IF NOT EXISTS idx_community_polls_status ON community_polls(status);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON poll_votes(user_id);

-- RLS Policies
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Gift card policies
CREATE POLICY "Users can view their gift cards" ON gift_cards
  FOR SELECT USING (purchaser_id = auth.uid() OR redeemed_by = auth.uid());

CREATE POLICY "Users can purchase gift cards" ON gift_cards
  FOR INSERT WITH CHECK (purchaser_id = auth.uid());

CREATE POLICY "Users can view their transactions" ON gift_card_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their store credit" ON user_store_credits
  FOR SELECT USING (user_id = auth.uid());

-- Poll policies
CREATE POLICY "Anyone can view active polls" ON community_polls
  FOR SELECT USING (status IN ('active', 'closed'));

CREATE POLICY "Anyone can view poll options" ON poll_options
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can view their votes" ON poll_votes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can vote" ON poll_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can manage everything
CREATE POLICY "Admins can manage gift cards" ON gift_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage polls" ON community_polls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to increment poll option votes
CREATE OR REPLACE FUNCTION increment_poll_option_votes(p_option_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE poll_options
  SET votes_count = votes_count + 1
  WHERE id = p_option_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to close expired polls
CREATE OR REPLACE FUNCTION close_expired_polls()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE community_polls
  SET status = 'closed', updated_at = NOW()
  WHERE status = 'active'
    AND ends_at IS NOT NULL
    AND ends_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at triggers
CREATE TRIGGER gift_cards_updated_at
  BEFORE UPDATE ON gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_store_credits_updated_at
  BEFORE UPDATE ON user_store_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER community_polls_updated_at
  BEFORE UPDATE ON community_polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
