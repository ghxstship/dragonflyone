-- Migration: Saved Searches and Price Alerts
-- Enables users to save search criteria and set price alerts for events

-- Saved Searches Table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  query TEXT,
  filters JSONB DEFAULT '{}',
  alerts_enabled BOOLEAN DEFAULT TRUE,
  alert_frequency VARCHAR(20) DEFAULT 'daily' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  last_run TIMESTAMPTZ,
  new_results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Alerts Table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  target_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id, ticket_type_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_alerts ON saved_searches(alerts_enabled, alert_frequency);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_event ON price_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active, triggered);

-- RLS Policies
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own saved searches
CREATE POLICY "Users can view their saved searches" ON saved_searches
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create saved searches" ON saved_searches
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their saved searches" ON saved_searches
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their saved searches" ON saved_searches
  FOR DELETE USING (user_id = auth.uid());

-- Users can only access their own price alerts
CREATE POLICY "Users can view their price alerts" ON price_alerts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create price alerts" ON price_alerts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their price alerts" ON price_alerts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their price alerts" ON price_alerts
  FOR DELETE USING (user_id = auth.uid());

-- Function to check and trigger price alerts
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update price alerts when ticket prices change
  UPDATE price_alerts
  SET 
    current_price = NEW.price,
    triggered = NEW.price <= target_price,
    triggered_at = CASE 
      WHEN NEW.price <= target_price AND NOT triggered THEN NOW()
      ELSE triggered_at
    END,
    updated_at = NOW()
  WHERE ticket_type_id = NEW.id
    AND is_active = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check price alerts when ticket prices change
CREATE TRIGGER check_price_alerts_on_price_change
  AFTER UPDATE OF price ON ticket_types
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price)
  EXECUTE FUNCTION check_price_alerts();

-- Function to run saved searches and count new results
CREATE OR REPLACE FUNCTION run_saved_search(p_search_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_search saved_searches%ROWTYPE;
  v_count INTEGER;
BEGIN
  SELECT * INTO v_search FROM saved_searches WHERE id = p_search_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Count matching events based on filters
  -- This is a simplified version - in production, implement full filter logic
  SELECT COUNT(*) INTO v_count
  FROM events
  WHERE status = 'published'
    AND (v_search.query IS NULL OR title ILIKE '%' || v_search.query || '%')
    AND created_at > COALESCE(v_search.last_run, v_search.created_at);
  
  -- Update search with results
  UPDATE saved_searches
  SET 
    last_run = NOW(),
    new_results_count = v_count,
    updated_at = NOW()
  WHERE id = p_search_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at triggers
CREATE TRIGGER saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER price_alerts_updated_at
  BEFORE UPDATE ON price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
