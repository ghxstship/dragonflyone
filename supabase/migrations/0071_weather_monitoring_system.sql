-- Migration: Weather Monitoring System
-- Description: Tables for weather tracking, alerts, and contingency planning

-- Weather logs table
CREATE TABLE IF NOT EXISTS weather_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  venue_id UUID REFERENCES venues(id),
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  temperature NUMERIC(5,2),
  feels_like NUMERIC(5,2),
  humidity INT,
  pressure INT,
  wind_speed NUMERIC(5,2),
  wind_direction INT,
  wind_gust NUMERIC(5,2),
  conditions TEXT,
  description TEXT,
  icon TEXT,
  visibility INT,
  uv_index NUMERIC(4,2),
  precipitation_probability NUMERIC(5,2),
  precipitation_amount NUMERIC(5,2),
  cloud_cover INT,
  dew_point NUMERIC(5,2),
  raw_data JSONB,
  source TEXT DEFAULT 'openweathermap',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_logs_event ON weather_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_weather_logs_venue ON weather_logs(venue_id);
CREATE INDEX IF NOT EXISTS idx_weather_logs_time ON weather_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_weather_logs_location ON weather_logs(latitude, longitude);

-- Weather alerts table
CREATE TABLE IF NOT EXISTS weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('rain', 'heavy_rain', 'thunderstorm', 'lightning', 'wind', 'high_wind', 'temperature_high', 'temperature_low', 'snow', 'ice', 'fog', 'uv', 'air_quality', 'custom')),
  severity TEXT NOT NULL DEFAULT 'moderate' CHECK (severity IN ('watch', 'advisory', 'warning', 'emergency')),
  threshold JSONB,
  action_plan TEXT,
  recipients UUID[],
  notification_channels TEXT[] DEFAULT ARRAY['email', 'push'],
  active BOOLEAN DEFAULT true,
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_alerts_event ON weather_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_type ON weather_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_active ON weather_alerts(active);

-- Weather alert notifications table
CREATE TABLE IF NOT EXISTS weather_alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES weather_alerts(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'slack', 'webhook')),
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_weather_alert_notifications_alert ON weather_alert_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_weather_alert_notifications_user ON weather_alert_notifications(user_id);

-- Weather contingency plans table
CREATE TABLE IF NOT EXISTS weather_contingency_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) UNIQUE,
  rain_plan TEXT,
  rain_threshold_mm NUMERIC(5,2),
  wind_plan TEXT,
  wind_threshold_mph NUMERIC(5,2),
  lightning_plan TEXT,
  lightning_radius_miles INT DEFAULT 10,
  extreme_heat_plan TEXT,
  heat_threshold_f NUMERIC(5,2),
  extreme_cold_plan TEXT,
  cold_threshold_f NUMERIC(5,2),
  evacuation_plan TEXT,
  shelter_locations JSONB,
  communication_plan TEXT,
  decision_matrix JSONB,
  backup_date DATE,
  backup_venue_id UUID REFERENCES venues(id),
  insurance_coverage JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_contingency_plans_event ON weather_contingency_plans(event_id);

-- Weather forecast cache table
CREATE TABLE IF NOT EXISTS weather_forecast_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  forecast_type TEXT NOT NULL CHECK (forecast_type IN ('hourly', 'daily', '5day', '7day')),
  forecast_data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(latitude, longitude, forecast_type)
);

CREATE INDEX IF NOT EXISTS idx_weather_forecast_cache_location ON weather_forecast_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_forecast_cache_expires ON weather_forecast_cache(expires_at);

-- Weather decision log table
CREATE TABLE IF NOT EXISTS weather_decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  decision_type TEXT NOT NULL CHECK (decision_type IN ('proceed', 'delay', 'relocate', 'cancel', 'modify', 'shelter_in_place')),
  reason TEXT NOT NULL,
  weather_conditions JSONB,
  made_by UUID REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  effective_at TIMESTAMPTZ,
  communicated_at TIMESTAMPTZ,
  communication_channels TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_decision_log_event ON weather_decision_log(event_id);
CREATE INDEX IF NOT EXISTS idx_weather_decision_log_type ON weather_decision_log(decision_type);

-- Function to check weather thresholds and trigger alerts
CREATE OR REPLACE FUNCTION check_weather_thresholds()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_alert RECORD;
BEGIN
  -- Check all active alerts for this event
  FOR v_alert IN
    SELECT * FROM weather_alerts
    WHERE event_id = NEW.event_id
      AND active = TRUE
      AND triggered = FALSE
  LOOP
    -- Check if threshold is exceeded based on alert type
    IF (v_alert.alert_type = 'rain' AND NEW.precipitation_probability >= (v_alert.threshold->>'probability')::NUMERIC) OR
       (v_alert.alert_type = 'wind' AND NEW.wind_speed >= (v_alert.threshold->>'speed')::NUMERIC) OR
       (v_alert.alert_type = 'temperature_high' AND NEW.temperature >= (v_alert.threshold->>'max_temp')::NUMERIC) OR
       (v_alert.alert_type = 'temperature_low' AND NEW.temperature <= (v_alert.threshold->>'min_temp')::NUMERIC) OR
       (v_alert.alert_type = 'lightning' AND NEW.conditions ILIKE '%thunder%')
    THEN
      -- Mark alert as triggered
      UPDATE weather_alerts SET
        triggered = TRUE,
        triggered_at = NOW(),
        updated_at = NOW()
      WHERE id = v_alert.id;
      
      -- Create notifications for recipients
      INSERT INTO weather_alert_notifications (alert_id, user_id, channel, message)
      SELECT 
        v_alert.id,
        unnest(v_alert.recipients),
        unnest(v_alert.notification_channels),
        'Weather Alert: ' || v_alert.alert_type || ' threshold exceeded for event';
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS weather_threshold_check ON weather_logs;
CREATE TRIGGER weather_threshold_check
  AFTER INSERT ON weather_logs
  FOR EACH ROW
  WHEN (NEW.event_id IS NOT NULL)
  EXECUTE FUNCTION check_weather_thresholds();

-- Function to clean up expired forecast cache
CREATE OR REPLACE FUNCTION cleanup_expired_weather_cache()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
BEGIN
  DELETE FROM weather_forecast_cache
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- RLS policies
ALTER TABLE weather_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_contingency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_forecast_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_decision_log ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON weather_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON weather_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON weather_alert_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON weather_contingency_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON weather_forecast_cache TO authenticated;
GRANT SELECT, INSERT ON weather_decision_log TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_weather_cache() TO authenticated;
