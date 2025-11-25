-- Migration: Extended POS Tables
-- Description: Tables for cashless payments, split payments, tips, and receipts

-- Cashless transactions table
CREATE TABLE IF NOT EXISTS cashless_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  original_transaction_id VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(30) CHECK (payment_method IN ('tap', 'chip', 'swipe', 'nfc', 'apple_pay', 'google_pay')),
  terminal_id UUID REFERENCES pos_terminals(id),
  order_id UUID REFERENCES orders(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  error_message TEXT,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Split payments table
CREATE TABLE IF NOT EXISTS split_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  split_index INTEGER NOT NULL,
  payment_method VARCHAR(50),
  amount DECIMAL(10, 2) NOT NULL,
  payer_name VARCHAR(200),
  payer_email VARCHAR(200),
  transaction_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tips table
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID,
  amount DECIMAL(10, 2) NOT NULL,
  employee_id UUID REFERENCES platform_users(id),
  terminal_id UUID REFERENCES pos_terminals(id),
  payment_method VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt deliveries table
CREATE TABLE IF NOT EXISTS receipt_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID,
  order_id UUID REFERENCES orders(id),
  delivery_method VARCHAR(20) CHECK (delivery_method IN ('email', 'sms', 'print')),
  recipient VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFID transactions table
CREATE TABLE IF NOT EXISTS rfid_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wristband_id UUID NOT NULL REFERENCES rfid_wristbands(id),
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('top_up', 'purchase', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2),
  description TEXT,
  payment_method VARCHAR(30),
  terminal_id UUID REFERENCES pos_terminals(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor booths table
CREATE TABLE IF NOT EXISTS vendor_booths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  vendor_id UUID REFERENCES vendors(id),
  booth_name VARCHAR(200) NOT NULL,
  booth_number VARCHAR(50),
  location VARCHAR(200),
  category VARCHAR(50),
  commission_rate DECIMAL(5, 2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor booth sales table
CREATE TABLE IF NOT EXISTS vendor_booth_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booth_id UUID NOT NULL REFERENCES vendor_booths(id),
  transaction_id UUID REFERENCES pos_transactions(id),
  gross_amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2),
  net_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cashless_transactions_terminal ON cashless_transactions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_cashless_transactions_order ON cashless_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_split_payments_order ON split_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_tips_employee ON tips(employee_id);
CREATE INDEX IF NOT EXISTS idx_tips_terminal ON tips(terminal_id);
CREATE INDEX IF NOT EXISTS idx_receipt_deliveries_transaction ON receipt_deliveries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_rfid_transactions_wristband ON rfid_transactions(wristband_id);
CREATE INDEX IF NOT EXISTS idx_vendor_booths_event ON vendor_booths(event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_booth_sales_booth ON vendor_booth_sales(booth_id);

-- RLS Policies
ALTER TABLE cashless_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfid_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_booth_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY cashless_transactions_view ON cashless_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY split_payments_view ON split_payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY tips_view ON tips FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY rfid_transactions_view ON rfid_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY vendor_booths_view ON vendor_booths FOR SELECT USING (auth.uid() IS NOT NULL);
