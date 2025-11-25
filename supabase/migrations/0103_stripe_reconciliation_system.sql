-- Migration: Stripe Reconciliation System
-- Description: Tables for Stripe transaction sync, reconciliation, and payout tracking

-- Stripe transactions (synced from Stripe)
CREATE TABLE IF NOT EXISTS stripe_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  amount INT NOT NULL,
  fee INT NOT NULL DEFAULT 0,
  net INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  description TEXT,
  source TEXT,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_transactions_stripe_id ON stripe_transactions(stripe_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_type ON stripe_transactions(type);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_created ON stripe_transactions(created_at);

-- Stripe reconciliations
CREATE TABLE IF NOT EXISTS stripe_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  start_date DATE,
  end_date DATE,
  stripe_gross NUMERIC(14,2) NOT NULL,
  stripe_fees NUMERIC(14,2) NOT NULL,
  stripe_net NUMERIC(14,2) NOT NULL,
  stripe_transaction_count INT NOT NULL,
  atlvs_total NUMERIC(14,2) NOT NULL,
  atlvs_invoice_count INT NOT NULL,
  variance_amount NUMERIC(14,2) NOT NULL,
  variance_percent NUMERIC(8,4) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'variance_detected', 'resolved')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_reconciliations_status ON stripe_reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_stripe_reconciliations_created ON stripe_reconciliations(created_at);

-- Stripe payouts tracking
CREATE TABLE IF NOT EXISTS stripe_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_id TEXT NOT NULL UNIQUE,
  amount INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  arrival_date DATE NOT NULL,
  method TEXT,
  bank_account TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_payouts_stripe_id ON stripe_payouts(stripe_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payouts_status ON stripe_payouts(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payouts_arrival ON stripe_payouts(arrival_date);

-- Stripe disputes tracking
CREATE TABLE IF NOT EXISTS stripe_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_id TEXT NOT NULL UNIQUE,
  charge_id TEXT NOT NULL,
  amount INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  reason TEXT,
  status TEXT NOT NULL,
  evidence_due_by TIMESTAMPTZ,
  is_charge_refundable BOOLEAN,
  order_id UUID,
  assigned_to UUID REFERENCES platform_users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_disputes_stripe_id ON stripe_disputes(stripe_id);
CREATE INDEX IF NOT EXISTS idx_stripe_disputes_status ON stripe_disputes(status);
CREATE INDEX IF NOT EXISTS idx_stripe_disputes_due ON stripe_disputes(evidence_due_by);

-- Nightly reconciliation jobs
CREATE TABLE IF NOT EXISTS reconciliation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('stripe_sync', 'erp_sync', 'full_reconciliation')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  records_processed INT DEFAULT 0,
  errors_count INT DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_jobs_type ON reconciliation_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_reconciliation_jobs_status ON reconciliation_jobs(status);

-- Function to get daily revenue summary
CREATE OR REPLACE FUNCTION get_daily_revenue_summary(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  stripe_gross NUMERIC,
  stripe_fees NUMERIC,
  stripe_net NUMERIC,
  stripe_count BIGINT,
  atlvs_total NUMERIC,
  atlvs_count BIGINT,
  variance NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH stripe_data AS (
    SELECT 
      COALESCE(SUM(amount)::NUMERIC / 100, 0) as gross,
      COALESCE(SUM(fee)::NUMERIC / 100, 0) as fees,
      COALESCE(SUM(net)::NUMERIC / 100, 0) as net,
      COUNT(*) as cnt
    FROM stripe_transactions
    WHERE type = 'charge'
      AND DATE(created_at) = p_date
  ),
  atlvs_data AS (
    SELECT 
      COALESCE(SUM(total_amount), 0) as total,
      COUNT(*) as cnt
    FROM invoices
    WHERE status = 'paid'
      AND DATE(paid_at) = p_date
  )
  SELECT 
    sd.gross as stripe_gross,
    sd.fees as stripe_fees,
    sd.net as stripe_net,
    sd.cnt as stripe_count,
    ad.total as atlvs_total,
    ad.cnt as atlvs_count,
    ABS(sd.gross - ad.total) as variance
  FROM stripe_data sd, atlvs_data ad;
END;
$$;

-- Function to check for unresolved variances
CREATE OR REPLACE FUNCTION get_unresolved_variances()
RETURNS TABLE (
  id UUID,
  start_date DATE,
  end_date DATE,
  variance_amount NUMERIC,
  variance_percent NUMERIC,
  days_old INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.start_date,
    sr.end_date,
    sr.variance_amount,
    sr.variance_percent,
    EXTRACT(DAY FROM NOW() - sr.created_at)::INT as days_old
  FROM stripe_reconciliations sr
  WHERE sr.status = 'variance_detected'
  ORDER BY sr.created_at DESC;
END;
$$;

-- RLS policies
ALTER TABLE stripe_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_jobs ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON stripe_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stripe_reconciliations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stripe_payouts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stripe_disputes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON reconciliation_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_revenue_summary(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unresolved_variances() TO authenticated;
