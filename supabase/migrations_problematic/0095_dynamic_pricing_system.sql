-- Migration: Dynamic Pricing System
-- Description: Tables for dynamic pricing rules, price history, and analytics

-- Dynamic pricing rules table
CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id UUID NOT NULL REFERENCES event_ticket_types(id),
  strategy TEXT NOT NULL CHECK (strategy IN ('demand_based', 'time_based', 'inventory_based', 'hybrid', 'manual')),
  base_price NUMERIC(10,2) NOT NULL,
  min_price NUMERIC(10,2) NOT NULL,
  max_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2),
  rules JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, ticket_type_id),
  CHECK (max_price >= base_price AND base_price >= min_price)
);

CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_rules_event ON dynamic_pricing_rules(event_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_rules_ticket ON dynamic_pricing_rules(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_rules_active ON dynamic_pricing_rules(active);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id UUID NOT NULL REFERENCES event_ticket_types(id),
  pricing_rule_id UUID REFERENCES dynamic_pricing_rules(id),
  old_price NUMERIC(10,2),
  new_price NUMERIC(10,2) NOT NULL,
  change_reason TEXT,
  factors JSONB,
  changed_by UUID REFERENCES platform_users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_event ON price_history(event_id);
CREATE INDEX IF NOT EXISTS idx_price_history_ticket ON price_history(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_price_history_time ON price_history(changed_at);

-- Pricing analytics table
CREATE TABLE IF NOT EXISTS pricing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id UUID NOT NULL REFERENCES event_ticket_types(id),
  date DATE NOT NULL,
  hour INT,
  avg_price NUMERIC(10,2),
  min_price_shown NUMERIC(10,2),
  max_price_shown NUMERIC(10,2),
  tickets_sold INT DEFAULT 0,
  revenue NUMERIC(15,2) DEFAULT 0,
  views INT DEFAULT 0,
  conversion_rate NUMERIC(5,2),
  demand_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, ticket_type_id, date, hour)
);

CREATE INDEX IF NOT EXISTS idx_pricing_analytics_event ON pricing_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_pricing_analytics_date ON pricing_analytics(date);

-- Promotional pricing table
CREATE TABLE IF NOT EXISTS promotional_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID REFERENCES events(id),
  ticket_type_id UUID REFERENCES event_ticket_types(id),
  name TEXT NOT NULL,
  promo_code TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'fixed_price')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_purchase_amount NUMERIC(10,2),
  min_quantity INT,
  max_quantity INT,
  max_uses INT,
  uses_count INT DEFAULT 0,
  max_uses_per_user INT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  applicable_days TEXT[],
  applicable_times JSONB,
  user_segments TEXT[],
  is_stackable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotional_pricing_event ON promotional_pricing(event_id);
CREATE INDEX IF NOT EXISTS idx_promotional_pricing_code ON promotional_pricing(promo_code);
CREATE INDEX IF NOT EXISTS idx_promotional_pricing_active ON promotional_pricing(is_active);
CREATE INDEX IF NOT EXISTS idx_promotional_pricing_dates ON promotional_pricing(start_date, end_date);

-- Promo code usage table
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id UUID NOT NULL REFERENCES promotional_pricing(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  order_id UUID REFERENCES orders(id),
  discount_applied NUMERIC(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo ON promo_code_usage(promo_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user ON promo_code_usage(user_id);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id UUID REFERENCES event_ticket_types(id),
  target_price NUMERIC(10,2) NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('below', 'above', 'any_change')),
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id, ticket_type_id, alert_type)
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_event ON price_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active);

-- Function to log price changes
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.current_price IS DISTINCT FROM NEW.current_price THEN
    INSERT INTO price_history (
      event_id,
      ticket_type_id,
      pricing_rule_id,
      old_price,
      new_price,
      change_reason,
      factors
    ) VALUES (
      NEW.event_id,
      NEW.ticket_type_id,
      NEW.id,
      OLD.current_price,
      NEW.current_price,
      'Dynamic pricing update',
      NEW.rules
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS price_change_log_trigger ON dynamic_pricing_rules;
CREATE TRIGGER price_change_log_trigger
  AFTER UPDATE ON dynamic_pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION log_price_change();

-- Function to check and trigger price alerts
CREATE OR REPLACE FUNCTION check_price_alerts(
  p_event_id UUID,
  p_ticket_type_id UUID,
  p_new_price NUMERIC
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT := 0;
BEGIN
  -- Find and trigger matching alerts
  UPDATE price_alerts SET
    triggered_at = NOW(),
    is_active = FALSE
  WHERE event_id = p_event_id
    AND (ticket_type_id = p_ticket_type_id OR ticket_type_id IS NULL)
    AND is_active = TRUE
    AND (
      (alert_type = 'below' AND p_new_price <= target_price)
      OR (alert_type = 'above' AND p_new_price >= target_price)
      OR alert_type = 'any_change'
    );
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Create notifications for triggered alerts
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    pa.user_id,
    'price_alert',
    'Price Alert Triggered',
    'The price for your watched event has changed to $' || p_new_price,
    jsonb_build_object('event_id', p_event_id, 'ticket_type_id', p_ticket_type_id, 'new_price', p_new_price)
  FROM price_alerts pa
  WHERE pa.event_id = p_event_id
    AND pa.triggered_at >= NOW() - INTERVAL '1 minute';
  
  RETURN v_count;
END;
$$;

-- Function to validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_event_id UUID,
  p_user_id UUID,
  p_ticket_type_id UUID DEFAULT NULL,
  p_quantity INT DEFAULT 1,
  p_subtotal NUMERIC DEFAULT 0
)
RETURNS TABLE (
  is_valid BOOLEAN,
  promo_id UUID,
  discount_type TEXT,
  discount_value NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_promo RECORD;
  v_user_uses INT;
BEGIN
  -- Find matching promo
  SELECT * INTO v_promo
  FROM promotional_pricing pp
  WHERE pp.promo_code = p_code
    AND pp.is_active = TRUE
    AND NOW() BETWEEN pp.start_date AND pp.end_date
    AND (pp.event_id IS NULL OR pp.event_id = p_event_id)
    AND (pp.ticket_type_id IS NULL OR pp.ticket_type_id = p_ticket_type_id)
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Invalid or expired promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Check max uses
  IF v_promo.max_uses IS NOT NULL AND v_promo.uses_count >= v_promo.max_uses THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Promo code has reached maximum uses'::TEXT;
    RETURN;
  END IF;
  
  -- Check per-user limit
  IF v_promo.max_uses_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_uses
    FROM promo_code_usage
    WHERE promo_id = v_promo.id AND user_id = p_user_id;
    
    IF v_user_uses >= v_promo.max_uses_per_user THEN
      RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'You have already used this promo code'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Check minimum purchase
  IF v_promo.min_purchase_amount IS NOT NULL AND p_subtotal < v_promo.min_purchase_amount THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 
      ('Minimum purchase of $' || v_promo.min_purchase_amount || ' required')::TEXT;
    RETURN;
  END IF;
  
  -- Check quantity limits
  IF v_promo.min_quantity IS NOT NULL AND p_quantity < v_promo.min_quantity THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 
      ('Minimum quantity of ' || v_promo.min_quantity || ' required')::TEXT;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, v_promo.id, v_promo.discount_type, v_promo.discount_value, NULL::TEXT;
END;
$$;

-- RLS policies
ALTER TABLE dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON dynamic_pricing_rules TO authenticated;
GRANT SELECT, INSERT ON price_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pricing_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON promotional_pricing TO authenticated;
GRANT SELECT, INSERT ON promo_code_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON price_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION check_price_alerts(UUID, UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, UUID, UUID, UUID, INT, NUMERIC) TO authenticated;
