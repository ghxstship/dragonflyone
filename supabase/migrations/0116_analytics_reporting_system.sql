-- Migration: Analytics & Reporting System
-- Description: Tables for analytics, metrics, dashboards, and reporting

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN ('page_view', 'user_action', 'conversion', 'engagement', 'error', 'performance', 'custom')),
  user_id UUID REFERENCES platform_users(id),
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  viewport_size TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  ip_address TEXT,
  properties JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_org ON analytics_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- Daily metrics aggregation
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  metric_date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('sales', 'tickets', 'revenue', 'visitors', 'conversions', 'engagement')),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(15,2) NOT NULL,
  previous_value NUMERIC(15,2),
  change_percentage NUMERIC(10,2),
  dimensions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, metric_date, metric_type, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_org ON daily_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_type ON daily_metrics(metric_type);

-- Event analytics table
CREATE TABLE IF NOT EXISTS event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  analytics_date DATE NOT NULL,
  page_views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  ticket_views INT DEFAULT 0,
  add_to_cart INT DEFAULT 0,
  checkout_started INT DEFAULT 0,
  purchases INT DEFAULT 0,
  tickets_sold INT DEFAULT 0,
  revenue NUMERIC(15,2) DEFAULT 0,
  conversion_rate NUMERIC(5,4) DEFAULT 0,
  avg_order_value NUMERIC(10,2) DEFAULT 0,
  shares INT DEFAULT 0,
  favorites INT DEFAULT 0,
  waitlist_signups INT DEFAULT 0,
  refunds INT DEFAULT 0,
  refund_amount NUMERIC(15,2) DEFAULT 0,
  traffic_sources JSONB,
  device_breakdown JSONB,
  geo_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, analytics_date)
);

CREATE INDEX IF NOT EXISTS idx_event_analytics_event ON event_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_event_analytics_date ON event_analytics(analytics_date);

-- Sales funnel tracking
CREATE TABLE IF NOT EXISTS sales_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  event_id UUID REFERENCES events(id),
  funnel_date DATE NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('impression', 'page_view', 'ticket_view', 'add_to_cart', 'checkout_start', 'payment_info', 'purchase_complete')),
  count INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  conversion_from_previous NUMERIC(5,4),
  avg_time_in_stage_seconds INT,
  drop_off_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, event_id, funnel_date, stage)
);

CREATE INDEX IF NOT EXISTS idx_sales_funnel_org ON sales_funnel(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_funnel_event ON sales_funnel(event_id);
CREATE INDEX IF NOT EXISTS idx_sales_funnel_date ON sales_funnel(funnel_date);

-- Dashboard configurations
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES platform_users(id),
  name TEXT NOT NULL,
  description TEXT,
  dashboard_type TEXT DEFAULT 'custom' CHECK (dashboard_type IN ('default', 'custom', 'shared', 'template')),
  layout JSONB NOT NULL DEFAULT '[]',
  filters JSONB,
  date_range TEXT DEFAULT 'last_30_days',
  refresh_interval_seconds INT DEFAULT 300,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  shared_with UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboards_org ON dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_user ON dashboards(user_id);

-- Dashboard widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('metric', 'chart', 'table', 'map', 'funnel', 'list', 'text', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL,
  query_config JSONB NOT NULL,
  visualization_config JSONB,
  position JSONB NOT NULL,
  size JSONB NOT NULL,
  refresh_interval_seconds INT,
  cache_duration_seconds INT DEFAULT 60,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);

-- Scheduled reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('sales', 'attendance', 'financial', 'marketing', 'operations', 'custom')),
  query_config JSONB NOT NULL,
  format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'xlsx', 'html')),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'custom')),
  schedule_config JSONB,
  timezone TEXT DEFAULT 'America/New_York',
  recipients TEXT[] NOT NULL,
  cc_recipients TEXT[],
  subject_template TEXT,
  body_template TEXT,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  next_run_at TIMESTAMPTZ,
  run_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_org ON scheduled_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at);

-- Report history
CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_report_id UUID REFERENCES scheduled_reports(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('generating', 'completed', 'failed', 'sent')),
  file_url TEXT,
  file_size INT,
  parameters JSONB,
  error_message TEXT,
  generated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients TEXT[],
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_history_org ON report_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_history_scheduled ON report_history(scheduled_report_id);
CREATE INDEX IF NOT EXISTS idx_report_history_created ON report_history(created_at);

-- KPI definitions
CREATE TABLE IF NOT EXISTS kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  calculation_formula TEXT,
  data_source TEXT,
  unit TEXT,
  format TEXT DEFAULT 'number',
  target_value NUMERIC(15,2),
  warning_threshold NUMERIC(15,2),
  critical_threshold NUMERIC(15,2),
  comparison_period TEXT DEFAULT 'previous_period',
  is_higher_better BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_kpi_definitions_org ON kpi_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_category ON kpi_definitions(category);

-- KPI values
CREATE TABLE IF NOT EXISTS kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID NOT NULL REFERENCES kpi_definitions(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  value NUMERIC(15,4) NOT NULL,
  previous_value NUMERIC(15,4),
  target_value NUMERIC(15,4),
  variance NUMERIC(15,4),
  variance_percentage NUMERIC(10,4),
  status TEXT CHECK (status IN ('on_track', 'warning', 'critical', 'exceeded')),
  dimensions JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kpi_id, organization_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_kpi_values_kpi ON kpi_values(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_org ON kpi_values(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_period ON kpi_values(period_start, period_end);

-- Function to aggregate daily event analytics
CREATE OR REPLACE FUNCTION aggregate_event_analytics(p_event_id UUID, p_date DATE)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  -- Calculate stats from analytics events
  SELECT 
    COUNT(*) FILTER (WHERE event_name = 'page_view') as page_views,
    COUNT(DISTINCT user_id) FILTER (WHERE event_name = 'page_view') as unique_visitors,
    COUNT(*) FILTER (WHERE event_name = 'ticket_view') as ticket_views,
    COUNT(*) FILTER (WHERE event_name = 'add_to_cart') as add_to_cart,
    COUNT(*) FILTER (WHERE event_name = 'checkout_start') as checkout_started,
    COUNT(*) FILTER (WHERE event_name = 'purchase') as purchases,
    COUNT(*) FILTER (WHERE event_name = 'share') as shares,
    COUNT(*) FILTER (WHERE event_name = 'favorite') as favorites
  INTO v_stats
  FROM analytics_events
  WHERE properties->>'event_id' = p_event_id::TEXT
    AND timestamp::DATE = p_date;
  
  -- Get sales data
  INSERT INTO event_analytics (
    event_id, analytics_date, page_views, unique_visitors, ticket_views,
    add_to_cart, checkout_started, purchases, shares, favorites
  )
  VALUES (
    p_event_id, p_date, v_stats.page_views, v_stats.unique_visitors, v_stats.ticket_views,
    v_stats.add_to_cart, v_stats.checkout_started, v_stats.purchases, v_stats.shares, v_stats.favorites
  )
  ON CONFLICT (event_id, analytics_date) DO UPDATE SET
    page_views = EXCLUDED.page_views,
    unique_visitors = EXCLUDED.unique_visitors,
    ticket_views = EXCLUDED.ticket_views,
    add_to_cart = EXCLUDED.add_to_cart,
    checkout_started = EXCLUDED.checkout_started,
    purchases = EXCLUDED.purchases,
    shares = EXCLUDED.shares,
    favorites = EXCLUDED.favorites;
END;
$$;

-- Function to calculate conversion rate
CREATE OR REPLACE FUNCTION calculate_conversion_rate(p_event_id UUID, p_date DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_views INT;
  v_purchases INT;
BEGIN
  SELECT page_views, purchases INTO v_views, v_purchases
  FROM event_analytics
  WHERE event_id = p_event_id AND analytics_date = p_date;
  
  IF v_views IS NULL OR v_views = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((v_purchases::NUMERIC / v_views) * 100, 2);
END;
$$;

-- RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_values ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON analytics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sales_funnel TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dashboards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_widgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_reports TO authenticated;
GRANT SELECT, INSERT ON report_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON kpi_definitions TO authenticated;
GRANT SELECT, INSERT ON kpi_values TO authenticated;
GRANT EXECUTE ON FUNCTION aggregate_event_analytics(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_conversion_rate(UUID, DATE) TO authenticated;
