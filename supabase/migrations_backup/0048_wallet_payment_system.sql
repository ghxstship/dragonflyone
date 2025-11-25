-- Migration: Wallet & Payment System
-- Description: Tables and functions for digital wallets, payment methods, and transactions

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  balance NUMERIC(15,2) DEFAULT 0,
  rewards_balance INT DEFAULT 0,
  cashback_balance NUMERIC(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  method_type TEXT NOT NULL CHECK (method_type IN ('card', 'bank_account', 'paypal', 'apple_pay', 'google_pay')),
  stripe_payment_method_id TEXT,
  last_four TEXT,
  brand TEXT,
  exp_month INT,
  exp_year INT,
  bank_name TEXT,
  account_type TEXT,
  billing_name TEXT,
  billing_address JSONB,
  is_default BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe ON payment_methods(stripe_payment_method_id);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('load', 'purchase', 'refund', 'transfer_in', 'transfer_out', 'cashback', 'reward', 'adjustment')),
  amount NUMERIC(15,2) NOT NULL,
  balance_before NUMERIC(15,2) NOT NULL,
  balance_after NUMERIC(15,2) NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id UUID,
  payment_method_id UUID REFERENCES payment_methods(id),
  stripe_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at);

-- Wallet auto reload settings
CREATE TABLE IF NOT EXISTS wallet_auto_reload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) UNIQUE,
  enabled BOOLEAN DEFAULT false,
  threshold_amount NUMERIC(15,2) NOT NULL,
  reload_amount NUMERIC(15,2) NOT NULL,
  payment_method_id UUID REFERENCES payment_methods(id),
  max_reloads_per_day INT DEFAULT 3,
  reloads_today INT DEFAULT 0,
  last_reload_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment plans table (for installments)
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  total_amount NUMERIC(15,2) NOT NULL,
  installment_count INT NOT NULL,
  installment_amount NUMERIC(15,2) NOT NULL,
  paid_installments INT DEFAULT 0,
  remaining_amount NUMERIC(15,2) NOT NULL,
  next_payment_date DATE,
  payment_method_id UUID REFERENCES payment_methods(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_user ON payment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON payment_plans(status);

-- Payment plan installments
CREATE TABLE IF NOT EXISTS payment_plan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  installment_number INT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_plan ON payment_plan_installments(payment_plan_id);

-- Process wallet transaction function
CREATE OR REPLACE FUNCTION process_wallet_transaction(
  p_wallet_id UUID,
  p_transaction_type TEXT,
  p_amount NUMERIC,
  p_description TEXT DEFAULT NULL,
  p_payment_method_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_wallet RECORD;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Lock wallet row
  SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  
  IF v_wallet.status != 'active' THEN
    RAISE EXCEPTION 'Wallet is not active';
  END IF;
  
  v_balance_before := v_wallet.balance;
  
  -- Calculate new balance based on transaction type
  IF p_transaction_type IN ('load', 'refund', 'transfer_in', 'cashback', 'reward') THEN
    v_balance_after := v_balance_before + p_amount;
  ELSIF p_transaction_type IN ('purchase', 'transfer_out') THEN
    IF v_balance_before < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
    v_balance_after := v_balance_before - p_amount;
  ELSIF p_transaction_type = 'adjustment' THEN
    v_balance_after := v_balance_before + p_amount; -- Can be positive or negative
  ELSE
    RAISE EXCEPTION 'Invalid transaction type';
  END IF;
  
  -- Update wallet balance
  UPDATE wallets SET
    balance = v_balance_after,
    updated_at = NOW()
  WHERE id = p_wallet_id;
  
  -- Create transaction record
  INSERT INTO wallet_transactions (
    wallet_id, transaction_type, amount, balance_before, balance_after,
    description, payment_method_id, reference_type, reference_id
  ) VALUES (
    p_wallet_id, p_transaction_type, p_amount, v_balance_before, v_balance_after,
    p_description, p_payment_method_id, p_reference_type, p_reference_id
  ) RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- Auto reload check trigger
CREATE OR REPLACE FUNCTION check_wallet_auto_reload()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_auto_reload RECORD;
BEGIN
  -- Check if balance dropped below threshold
  IF NEW.balance < OLD.balance THEN
    SELECT * INTO v_auto_reload 
    FROM wallet_auto_reload 
    WHERE wallet_id = NEW.id AND enabled = true;
    
    IF FOUND AND NEW.balance < v_auto_reload.threshold_amount THEN
      -- Check daily limit
      IF v_auto_reload.reloads_today < v_auto_reload.max_reloads_per_day THEN
        -- Queue auto reload (would trigger external payment processing)
        INSERT INTO notifications (user_id, type, title, message, data)
        SELECT user_id, 'wallet_auto_reload', 'Auto Reload Triggered',
          'Your wallet balance dropped below ' || v_auto_reload.threshold_amount || '. Auto reload of ' || v_auto_reload.reload_amount || ' initiated.',
          jsonb_build_object('wallet_id', NEW.id, 'reload_amount', v_auto_reload.reload_amount)
        FROM wallets WHERE id = NEW.id;
        
        -- Update reload count
        UPDATE wallet_auto_reload SET
          reloads_today = reloads_today + 1,
          last_reload_at = NOW(),
          updated_at = NOW()
        WHERE wallet_id = NEW.id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wallet_auto_reload_trigger ON wallets;
CREATE TRIGGER wallet_auto_reload_trigger
  AFTER UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION check_wallet_auto_reload();

-- RLS policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_auto_reload ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_installments ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON wallets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_methods TO authenticated;
GRANT SELECT, INSERT ON wallet_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON wallet_auto_reload TO authenticated;
GRANT SELECT ON payment_plans TO authenticated;
GRANT SELECT ON payment_plan_installments TO authenticated;
GRANT EXECUTE ON FUNCTION process_wallet_transaction(UUID, TEXT, NUMERIC, TEXT, UUID, TEXT, UUID) TO authenticated;
