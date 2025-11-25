-- Migration: Deals and Notification Preferences
-- Adds deals/offers system and user notification preferences

-- Deals Table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  deal_price DECIMAL(10, 2) NOT NULL,
  discount_percent INTEGER NOT NULL,
  deal_type VARCHAR(20) NOT NULL CHECK (deal_type IN ('flash_sale', 'last_minute', 'early_bird', 'group', 'member')),
  expires_at TIMESTAMPTZ,
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  promo_code VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- User Notification Preferences Table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  categories JSONB DEFAULT '{
    "order_updates": true,
    "event_reminders": true,
    "price_alerts": true,
    "saved_search_alerts": true,
    "artist_announcements": true,
    "venue_announcements": true,
    "promotions": false,
    "community_updates": true,
    "account_security": true
  }',
  reminder_timing VARCHAR(10) DEFAULT '24h',
  digest_frequency VARCHAR(20) DEFAULT 'daily',
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deals_event ON deals(event_id);
CREATE INDEX IF NOT EXISTS idx_deals_type ON deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_deals_promo_code ON deals(promo_code);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON user_notification_preferences(user_id);

-- RLS Policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Anyone can view active deals
CREATE POLICY "Anyone can view active deals" ON deals
  FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Admins can manage deals
CREATE POLICY "Admins can manage deals" ON deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Users can view and manage their own notification preferences
CREATE POLICY "Users can view their notification preferences" ON user_notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notification preferences" ON user_notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their notification preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to check if user should receive notification
CREATE OR REPLACE FUNCTION should_send_notification(
  p_user_id UUID,
  p_category TEXT,
  p_channel TEXT DEFAULT 'email'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prefs user_notification_preferences%ROWTYPE;
  v_now TIME;
BEGIN
  SELECT * INTO v_prefs
  FROM user_notification_preferences
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN TRUE; -- Default to sending if no preferences set
  END IF;
  
  -- Check channel enabled
  IF p_channel = 'email' AND NOT v_prefs.email_enabled THEN RETURN FALSE; END IF;
  IF p_channel = 'push' AND NOT v_prefs.push_enabled THEN RETURN FALSE; END IF;
  IF p_channel = 'sms' AND NOT v_prefs.sms_enabled THEN RETURN FALSE; END IF;
  
  -- Check category enabled
  IF NOT (v_prefs.categories->>p_category)::BOOLEAN THEN RETURN FALSE; END IF;
  
  -- Check quiet hours
  IF v_prefs.quiet_hours_enabled THEN
    v_now := CURRENT_TIME;
    IF v_prefs.quiet_hours_start > v_prefs.quiet_hours_end THEN
      -- Quiet hours span midnight
      IF v_now >= v_prefs.quiet_hours_start OR v_now <= v_prefs.quiet_hours_end THEN
        RETURN FALSE;
      END IF;
    ELSE
      IF v_now >= v_prefs.quiet_hours_start AND v_now <= v_prefs.quiet_hours_end THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-deactivate expired deals
CREATE OR REPLACE FUNCTION deactivate_expired_deals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE deals
  SET is_active = FALSE, updated_at = NOW()
  WHERE expires_at < NOW() AND is_active = TRUE;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Run deactivation check periodically (can be called by cron)
CREATE OR REPLACE FUNCTION cleanup_expired_deals()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE deals
  SET is_active = FALSE, updated_at = NOW()
  WHERE expires_at < NOW() AND is_active = TRUE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at triggers
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notification_prefs_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
