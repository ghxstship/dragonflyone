-- Migration: Create missing GVTEWAY tables (Part 6 - Payments, POS, Promo Codes, QA, Recommendations)
-- These tables are referenced by API routes but don't exist in the schema

-- ============================================
-- PAYMENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank', 'wallet', 'crypto', 'cash', 'gift_card', 'split')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  provider TEXT,
  provider_transaction_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('charge', 'refund', 'chargeback', 'adjustment')),
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL,
  provider_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('chargeback', 'inquiry', 'fraud')),
  reason TEXT,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'won', 'lost', 'closed')),
  evidence JSONB DEFAULT '{}'::jsonb,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  refunded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  total_amount DECIMAL(12,2) NOT NULL,
  down_payment DECIMAL(12,2) NOT NULL,
  installment_count INTEGER NOT NULL,
  installment_amount DECIMAL(12,2) NOT NULL,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')),
  next_payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_plan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'failed')),
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS split_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  total_amount DECIMAL(12,2) NOT NULL,
  split_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_gateway_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL CHECK (gateway IN ('stripe', 'paypal', 'square', 'braintree', 'adyen')),
  account_id TEXT,
  is_active BOOLEAN DEFAULT true,
  capabilities JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  connected_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- POS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS pos_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  terminal_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  terminal_type TEXT CHECK (terminal_type IN ('fixed', 'mobile', 'kiosk', 'self_service')),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'error')),
  last_heartbeat TIMESTAMPTZ,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE CASCADE,
  transaction_number TEXT UNIQUE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'refund', 'void', 'exchange')),
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'voided', 'refunded')),
  cashier_id UUID REFERENCES auth.users(id),
  customer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pos_transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cashless_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  wristband_id UUID,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('topup', 'purchase', 'refund', 'transfer')),
  amount DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2),
  vendor_id UUID,
  terminal_id UUID REFERENCES pos_terminals(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROMO CODE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'free_shipping')),
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase DECIMAL(12,2),
  max_discount DECIMAL(12,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  applicable_to JSONB DEFAULT '{}'::jsonb,
  excluded_items JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS presale_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  code_type TEXT DEFAULT 'presale' CHECK (code_type IN ('presale', 'vip', 'artist', 'sponsor', 'fan_club')),
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  max_tickets_per_use INTEGER DEFAULT 4,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, code)
);

-- ============================================
-- QA SESSION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS qa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  max_questions INTEGER,
  is_moderated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES qa_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  question TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'answered', 'rejected')),
  answer TEXT,
  answered_by UUID REFERENCES auth.users(id),
  answered_at TIMESTAMPTZ,
  upvotes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qa_question_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT DEFAULT 'up' CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- ============================================
-- RECOMMENDATION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS recommendation_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'artist', 'venue', 'merch')),
  item_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'purchase', 'save', 'share', 'dismiss')),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommendation_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('genre', 'artist', 'venue', 'event_type', 'location')),
  interest_value TEXT NOT NULL,
  weight DECIMAL(5,2) DEFAULT 1.00,
  source TEXT CHECK (source IN ('explicit', 'inferred', 'imported')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, interest_type, interest_value)
);

CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RESALE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS resale_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  original_price DECIMAL(12,2) NOT NULL,
  asking_price DECIMAL(12,2) NOT NULL,
  min_price DECIMAL(12,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'cancelled', 'expired')),
  buyer_id UUID REFERENCES auth.users(id),
  sold_price DECIMAL(12,2),
  sold_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resale_price_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  max_markup_percent DECIMAL(5,2),
  max_price DECIMAL(12,2),
  min_price DECIMAL(12,2),
  allow_below_face BOOLEAN DEFAULT false,
  is_resale_allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashless_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE presale_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_dismissals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_price_controls ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can read their payments" ON payments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read payment_transactions" ON payment_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read payment_disputes" ON payment_disputes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read payment_refunds" ON payment_refunds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their payment_plans" ON payment_plans FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read payment_plan_installments" ON payment_plan_installments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read split_payments" ON split_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read payment_gateway_connections" ON payment_gateway_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read pos_terminals" ON pos_terminals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read pos_transactions" ON pos_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read pos_transaction_items" ON pos_transaction_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read cashless_transactions" ON cashless_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read promo_codes" ON promo_codes FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Authenticated users can read presale_codes" ON presale_codes FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Authenticated users can read qa_sessions" ON qa_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read qa_questions" ON qa_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read qa_question_votes" ON qa_question_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their recommendation_interactions" ON recommendation_interactions FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their recommendation_dismissals" ON recommendation_dismissals FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage their user_interests" ON user_interests FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read interests" ON interests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read resale_listings" ON resale_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read resale_price_controls" ON resale_price_controls FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_event_id ON pos_terminals(event_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_terminal_id ON pos_transactions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_qa_sessions_event_id ON qa_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_qa_questions_session_id ON qa_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_resale_listings_event_id ON resale_listings(event_id);
