-- Migration: ERP and Marketing Integrations
-- Description: Tables for ERP sync, GL exports, reconciliation, and marketing automation

-- Currency rates
CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code TEXT NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  rate NUMERIC(14,6) NOT NULL,
  effective_date DATE NOT NULL,
  source TEXT,
  connection_id UUID REFERENCES erp_connections(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(currency_code, base_currency, effective_date)
);

CREATE INDEX IF NOT EXISTS idx_currency_rates_code ON currency_rates(currency_code);
CREATE INDEX IF NOT EXISTS idx_currency_rates_date ON currency_rates(effective_date);

-- Tax rates
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction TEXT NOT NULL,
  tax_type TEXT NOT NULL,
  rate NUMERIC(8,4) NOT NULL,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  is_active BOOLEAN DEFAULT true,
  source TEXT,
  connection_id UUID REFERENCES erp_connections(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jurisdiction, tax_type, effective_date)
);

CREATE INDEX IF NOT EXISTS idx_tax_rates_jurisdiction ON tax_rates(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON tax_rates(is_active);

-- GL exports
CREATE TABLE IF NOT EXISTS gl_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES erp_connections(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  account_ids TEXT[],
  include_details BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  record_count INT,
  manifest_url TEXT,
  error_message TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gl_exports_connection ON gl_exports(connection_id);
CREATE INDEX IF NOT EXISTS idx_gl_exports_status ON gl_exports(status);

-- ERP reconciliations
CREATE TABLE IF NOT EXISTS erp_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES erp_connections(id),
  reconciliation_type TEXT NOT NULL,
  erp_total NUMERIC(14,2) NOT NULL,
  atlvs_total NUMERIC(14,2) NOT NULL,
  variance_amount NUMERIC(14,2) NOT NULL,
  variance_percent NUMERIC(8,4) NOT NULL,
  threshold NUMERIC(8,4) DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'variance_detected', 'resolved')),
  erp_data JSONB,
  atlvs_data JSONB,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_erp_reconciliations_connection ON erp_reconciliations(connection_id);
CREATE INDEX IF NOT EXISTS idx_erp_reconciliations_status ON erp_reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_erp_reconciliations_type ON erp_reconciliations(reconciliation_type);

-- Marketing events
CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES marketing_connections(id),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  email TEXT,
  event_data JSONB NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL,
  forwarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_events_connection ON marketing_events(connection_id);
CREATE INDEX IF NOT EXISTS idx_marketing_events_type ON marketing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_events_email ON marketing_events(email);
CREATE INDEX IF NOT EXISTS idx_marketing_events_timestamp ON marketing_events(event_timestamp);

-- Marketing automations
CREATE TABLE IF NOT EXISTS marketing_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('ticket_purchase', 'lapsed_fan', 'vip_upsell', 'event_reminder', 'post_event', 'birthday', 'custom')),
  trigger_conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_automations_trigger ON marketing_automations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_marketing_automations_active ON marketing_automations(is_active);

-- Marketing automation logs
CREATE TABLE IF NOT EXISTS marketing_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES marketing_automations(id),
  user_id UUID REFERENCES platform_users(id),
  email TEXT,
  trigger_data JSONB,
  actions_executed JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_automation_logs_automation ON marketing_automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_marketing_automation_logs_status ON marketing_automation_logs(status);

-- Function to get attribution summary
CREATE OR REPLACE FUNCTION get_attribution_summary(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  source TEXT,
  medium TEXT,
  campaign TEXT,
  sessions BIGINT,
  conversions BIGINT,
  revenue NUMERIC,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ma.utm_source, 'direct') as source,
    COALESCE(ma.utm_medium, 'none') as medium,
    COALESCE(ma.utm_campaign, 'none') as campaign,
    COUNT(*) as sessions,
    COUNT(ma.converted_at) as conversions,
    COALESCE(SUM(ma.conversion_value), 0) as revenue,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND(COUNT(ma.converted_at)::NUMERIC / COUNT(*) * 100, 2)
      ELSE 0 
    END as conversion_rate
  FROM marketing_attributions ma
  WHERE (p_start_date IS NULL OR ma.created_at >= p_start_date)
    AND (p_end_date IS NULL OR ma.created_at <= p_end_date)
  GROUP BY ma.utm_source, ma.utm_medium, ma.utm_campaign
  ORDER BY conversions DESC, sessions DESC;
END;
$$;

-- Function to check consent status
CREATE OR REPLACE FUNCTION check_consent_status(p_email TEXT)
RETURNS TABLE (
  consent_type TEXT,
  is_consented BOOLEAN,
  last_updated TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (mc.consent_type)
    mc.consent_type,
    mc.is_consented,
    mc.created_at as last_updated
  FROM marketing_consents mc
  WHERE mc.email = p_email
  ORDER BY mc.consent_type, mc.created_at DESC;
END;
$$;

-- Function to trigger marketing automation
CREATE OR REPLACE FUNCTION trigger_marketing_automation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_automation RECORD;
BEGIN
  -- Check for matching automations
  FOR v_automation IN
    SELECT * FROM marketing_automations
    WHERE is_active = TRUE
      AND trigger_type = TG_ARGV[0]
  LOOP
    -- Log automation trigger
    INSERT INTO marketing_automation_logs (
      automation_id,
      user_id,
      trigger_data,
      status
    )
    VALUES (
      v_automation.id,
      NEW.user_id,
      to_jsonb(NEW),
      'pending'
    );
    
    -- Update automation stats
    UPDATE marketing_automations
    SET trigger_count = trigger_count + 1,
        last_triggered_at = NOW()
    WHERE id = v_automation.id;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- RLS policies
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_automation_logs ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON currency_rates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON tax_rates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON gl_exports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON erp_reconciliations TO authenticated;
GRANT SELECT, INSERT ON marketing_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketing_automations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON marketing_automation_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_attribution_summary(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION check_consent_status(TEXT) TO authenticated;

-- Insert sample currency rates
INSERT INTO currency_rates (currency_code, base_currency, rate, effective_date, source) VALUES
('EUR', 'USD', 1.0850, CURRENT_DATE, 'initial'),
('GBP', 'USD', 1.2650, CURRENT_DATE, 'initial'),
('CAD', 'USD', 0.7450, CURRENT_DATE, 'initial'),
('AUD', 'USD', 0.6550, CURRENT_DATE, 'initial'),
('JPY', 'USD', 0.0067, CURRENT_DATE, 'initial')
ON CONFLICT DO NOTHING;

-- Insert sample tax rates
INSERT INTO tax_rates (jurisdiction, tax_type, rate, effective_date, is_active, source) VALUES
('US-CA', 'sales_tax', 7.25, '2024-01-01', true, 'initial'),
('US-NY', 'sales_tax', 8.00, '2024-01-01', true, 'initial'),
('US-TX', 'sales_tax', 6.25, '2024-01-01', true, 'initial'),
('UK', 'vat', 20.00, '2024-01-01', true, 'initial'),
('DE', 'vat', 19.00, '2024-01-01', true, 'initial'),
('FR', 'vat', 20.00, '2024-01-01', true, 'initial')
ON CONFLICT DO NOTHING;
