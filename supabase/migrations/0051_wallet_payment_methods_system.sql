-- =====================================================
-- WALLET & PAYMENT METHODS SYSTEM
-- =====================================================
-- Digital wallet and payment method management for GVTEWAY
-- Supports multiple payment methods, stored value, and transaction history

-- =====================================================
-- WALLETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  -- Balance
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Limits
  daily_spend_limit NUMERIC(10, 2),
  monthly_spend_limit NUMERIC(10, 2),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'frozen', 'closed')),
  
  -- Security
  pin_hash TEXT, -- For wallet PIN verification
  requires_pin BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  
  -- Rewards integration
  rewards_balance INTEGER DEFAULT 0, -- Points balance
  cashback_balance NUMERIC(10, 2) DEFAULT 0.00,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  
  CONSTRAINT unique_user_wallet UNIQUE (user_id, currency)
);

-- =====================================================
-- PAYMENT METHODS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  -- Payment method type
  method_type TEXT NOT NULL CHECK (method_type IN (
    'credit_card', 'debit_card', 'bank_account', 'paypal', 
    'apple_pay', 'google_pay', 'venmo', 'crypto', 'gift_card'
  )),
  
  -- Card details (tokenized)
  card_brand TEXT, -- visa, mastercard, amex, discover
  last_four TEXT, -- Last 4 digits
  expiry_month INTEGER CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year INTEGER,
  cardholder_name TEXT,
  
  -- Bank account details (tokenized)
  bank_name TEXT,
  account_type TEXT, -- checking, savings
  routing_last_four TEXT,
  
  -- External service details
  external_service_id TEXT, -- PayPal email, Venmo handle, etc.
  
  -- Tokenization (Stripe, etc.)
  payment_provider TEXT NOT NULL DEFAULT 'stripe',
  provider_payment_method_id TEXT UNIQUE, -- pm_xxx from Stripe
  provider_customer_id TEXT, -- cus_xxx from Stripe
  
  -- Billing address
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'US',
  
  -- Settings
  is_default BOOLEAN DEFAULT false,
  nickname TEXT, -- User-friendly name "My Visa", "Work Card"
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'invalid', 'removed')),
  verified BOOLEAN DEFAULT false,
  verification_method TEXT,
  
  -- Security
  requires_cvv BOOLEAN DEFAULT true,
  requires_3d_secure BOOLEAN DEFAULT false,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- =====================================================
-- WALLET TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'load', 'purchase', 'refund', 'transfer_in', 'transfer_out', 
    'reward_credit', 'cashback', 'fee', 'adjustment'
  )),
  
  -- Amounts
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  fee_amount NUMERIC(8, 2) DEFAULT 0.00,
  net_amount NUMERIC(12, 2) GENERATED ALWAYS AS (amount - fee_amount) STORED,
  
  -- Balance tracking
  balance_before NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  
  -- Related entities
  order_id UUID, -- If transaction is for an order
  payment_method_id UUID REFERENCES payment_methods(id),
  related_user_id UUID REFERENCES platform_users(id), -- For transfers
  
  -- External reference
  external_transaction_id TEXT, -- Stripe payment intent, etc.
  
  -- Description
  description TEXT,
  metadata JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'
  )),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  notes TEXT
);

-- =====================================================
-- PAYMENT AUTHORIZATIONS TABLE (Pre-auth holds)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
  
  -- Authorization details
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Purpose
  purpose TEXT NOT NULL, -- 'order', 'deposit', 'hold'
  related_id UUID, -- Order ID, etc.
  
  -- Provider details
  provider_authorization_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'authorized', 'captured', 'cancelled', 'expired'
  )),
  
  -- Timestamps
  authorized_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  captured_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  notes TEXT
);

-- =====================================================
-- AUTO RELOAD SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_auto_reload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
  
  -- Reload settings
  enabled BOOLEAN DEFAULT true,
  threshold_amount NUMERIC(10, 2) NOT NULL, -- Reload when balance falls below
  reload_amount NUMERIC(10, 2) NOT NULL, -- Amount to add
  
  -- Limits
  max_reloads_per_day INTEGER DEFAULT 3,
  max_reload_amount_per_day NUMERIC(10, 2),
  
  -- Tracking
  last_reload_at TIMESTAMPTZ,
  reload_count_today INTEGER DEFAULT 0,
  reload_total_today NUMERIC(10, 2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_wallet_auto_reload UNIQUE (wallet_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_status ON wallets(status);
CREATE INDEX idx_wallets_balance ON wallets(balance) WHERE balance > 0;

CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_status ON payment_methods(status);
CREATE INDEX idx_payment_methods_default ON payment_methods(is_default) WHERE is_default = true;
CREATE INDEX idx_payment_methods_provider ON payment_methods(provider_payment_method_id);
CREATE INDEX idx_payment_methods_last_used ON payment_methods(last_used_at DESC);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_order ON wallet_transactions(order_id) WHERE order_id IS NOT NULL;

CREATE INDEX idx_payment_authorizations_user ON payment_authorizations(user_id);
CREATE INDEX idx_payment_authorizations_method ON payment_authorizations(payment_method_id);
CREATE INDEX idx_payment_authorizations_status ON payment_authorizations(status);
CREATE INDEX idx_payment_authorizations_expires ON payment_authorizations(expires_at) WHERE status = 'authorized';

CREATE INDEX idx_wallet_auto_reload_wallet ON wallet_auto_reload(wallet_id);
CREATE INDEX idx_wallet_auto_reload_enabled ON wallet_auto_reload(enabled) WHERE enabled = true;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_auto_reload ENABLE ROW LEVEL SECURITY;

-- Wallets policies
CREATE POLICY "Users can view their own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own wallet settings"
  ON wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add their own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Wallet transactions policies
CREATE POLICY "Users can view their own transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid())
  );

-- Only system can insert transactions (via functions)
CREATE POLICY "System can create transactions"
  ON wallet_transactions FOR INSERT
  WITH CHECK (true);

-- Payment authorizations policies
CREATE POLICY "Users can view their own authorizations"
  ON payment_authorizations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Auto reload policies
CREATE POLICY "Users can manage their auto reload settings"
  ON wallet_auto_reload FOR ALL
  TO authenticated
  USING (
    wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid())
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to process wallet transaction (atomic)
CREATE OR REPLACE FUNCTION process_wallet_transaction(
  p_wallet_id UUID,
  p_transaction_type TEXT,
  p_amount NUMERIC,
  p_description TEXT DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_payment_method_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Lock wallet for update
  SELECT balance INTO v_current_balance
  FROM wallets
  WHERE id = p_wallet_id
  FOR UPDATE;
  
  -- Calculate new balance based on transaction type
  IF p_transaction_type IN ('load', 'refund', 'transfer_in', 'reward_credit', 'cashback') THEN
    v_new_balance := v_current_balance + p_amount;
  ELSIF p_transaction_type IN ('purchase', 'transfer_out', 'fee') THEN
    v_new_balance := v_current_balance - p_amount;
    
    -- Check sufficient balance
    IF v_new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;
  ELSE
    v_new_balance := v_current_balance; -- adjustment type
  END IF;
  
  -- Create transaction record
  INSERT INTO wallet_transactions (
    wallet_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description,
    order_id,
    payment_method_id,
    status
  ) VALUES (
    p_wallet_id,
    p_transaction_type,
    p_amount,
    v_current_balance,
    v_new_balance,
    p_description,
    p_order_id,
    p_payment_method_id,
    'completed'
  ) RETURNING id INTO v_transaction_id;
  
  -- Update wallet balance
  UPDATE wallets
  SET 
    balance = v_new_balance,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = p_wallet_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set default payment method
CREATE OR REPLACE FUNCTION set_default_payment_method(
  p_user_id UUID,
  p_payment_method_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Unset all other defaults for this user
  UPDATE payment_methods
  SET is_default = false
  WHERE user_id = p_user_id
    AND id != p_payment_method_id;
  
  -- Set new default
  UPDATE payment_methods
  SET is_default = true
  WHERE id = p_payment_method_id
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and trigger auto reload
CREATE OR REPLACE FUNCTION check_wallet_auto_reload(p_wallet_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_wallet RECORD;
  v_reload_settings RECORD;
  v_can_reload BOOLEAN;
BEGIN
  -- Get wallet info
  SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id;
  
  -- Get auto reload settings
  SELECT * INTO v_reload_settings 
  FROM wallet_auto_reload 
  WHERE wallet_id = p_wallet_id 
    AND enabled = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if reload is needed
  IF v_wallet.balance >= v_reload_settings.threshold_amount THEN
    RETURN false;
  END IF;
  
  -- Check daily limits
  IF v_reload_settings.reload_count_today >= v_reload_settings.max_reloads_per_day THEN
    RETURN false;
  END IF;
  
  IF v_reload_settings.reload_total_today + v_reload_settings.reload_amount 
     > v_reload_settings.max_reload_amount_per_day THEN
    RETURN false;
  END IF;
  
  -- TODO: Trigger actual payment processing with payment_method_id
  -- For now, just return true to indicate reload is needed
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE TRIGGER update_wallets_timestamp
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

CREATE TRIGGER update_payment_methods_timestamp
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

-- Ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_default
  BEFORE INSERT OR UPDATE OF is_default ON payment_methods
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_payment_method();

COMMENT ON TABLE wallets IS 'User digital wallets with stored value and rewards integration';
COMMENT ON TABLE payment_methods IS 'Tokenized payment methods linked to users';
COMMENT ON TABLE wallet_transactions IS 'Complete transaction history for wallet activity';
COMMENT ON TABLE payment_authorizations IS 'Pre-authorization holds for pending payments';
COMMENT ON TABLE wallet_auto_reload IS 'Automatic wallet reload settings and limits';
