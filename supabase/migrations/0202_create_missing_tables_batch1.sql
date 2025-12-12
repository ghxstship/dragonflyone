-- Migration: Create missing tables (Batch 1 - A through Asset)
-- Tables: accessibility_requests through asset_utilization_logs

-- ACCESSIBILITY REQUESTS
CREATE TABLE IF NOT EXISTS public.accessibility_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'normal',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACCOUNT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.account_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACKNOWLEDGMENT REMINDERS
CREATE TABLE IF NOT EXISTS public.acknowledgment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITIES
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGE VERIFICATION METHODS
CREATE TABLE IF NOT EXISTS public.age_verification_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    provider TEXT,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGE VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.age_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    method_id UUID REFERENCES public.age_verification_methods(id) ON DELETE SET NULL,
    verified_age INTEGER,
    verification_date DATE,
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGGREGATOR LISTINGS
CREATE TABLE IF NOT EXISTS public.aggregator_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    aggregator_id UUID NOT NULL,
    external_id TEXT,
    listing_url TEXT,
    status TEXT DEFAULT 'pending',
    sync_status TEXT DEFAULT 'pending',
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGGREGATOR SYNC LOGS
CREATE TABLE IF NOT EXISTS public.aggregator_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregator_id UUID NOT NULL,
    listing_id UUID REFERENCES public.aggregator_listings(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL,
    status TEXT NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ALLOCATION DETAILS
CREATE TABLE IF NOT EXISTS public.allocation_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_id UUID NOT NULL,
    item_type TEXT NOT NULL,
    item_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_cost DECIMAL(12,2),
    total_cost DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALLOCATION RULE TARGETS
CREATE TABLE IF NOT EXISTS public.allocation_rule_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    percentage DECIMAL(5,2),
    fixed_amount DECIMAL(12,2),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALLOCATION RULES
CREATE TABLE IF NOT EXISTS public.allocation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL,
    conditions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYTICS DASHBOARDS
CREATE TABLE IF NOT EXISTS public.analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    layout JSONB DEFAULT '{}'::jsonb,
    widgets JSONB DEFAULT '[]'::jsonb,
    filters JSONB DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYTICS METRICS
CREATE TABLE IF NOT EXISTS public.analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    metric_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    value DECIMAL(18,4),
    dimensions JSONB DEFAULT '{}'::jsonb,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANOMALY ALERTS
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    metric_name TEXT,
    expected_value DECIMAL(18,4),
    actual_value DECIMAL(18,4),
    deviation_percentage DECIMAL(8,2),
    description TEXT,
    status TEXT DEFAULT 'open',
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API LOGS
CREATE TABLE IF NOT EXISTS public.api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    request_body JSONB,
    response_body JSONB,
    ip_address INET,
    user_agent TEXT,
    duration_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APP CHANGELOG
CREATE TABLE IF NOT EXISTS public.app_changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    release_date DATE,
    title TEXT NOT NULL,
    description TEXT,
    changes JSONB DEFAULT '[]'::jsonb,
    is_major BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APP DEVELOPERS
CREATE TABLE IF NOT EXISTS public.app_developers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    developer_name TEXT NOT NULL,
    email TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT false,
    api_access_level TEXT DEFAULT 'basic',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APP INSTALLATIONS
CREATE TABLE IF NOT EXISTS public.app_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    installed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    permissions JSONB DEFAULT '[]'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    uninstalled_at TIMESTAMPTZ
);

-- APP PERMISSIONS
CREATE TABLE IF NOT EXISTS public.app_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL,
    permission_name TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APP REVIEWS
CREATE TABLE IF NOT EXISTS public.app_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APP STORE LISTINGS
CREATE TABLE IF NOT EXISTS public.app_store_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_id UUID REFERENCES public.app_developers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    short_description TEXT,
    icon_url TEXT,
    screenshots JSONB DEFAULT '[]'::jsonb,
    category TEXT,
    tags TEXT[],
    pricing_type TEXT DEFAULT 'free',
    price DECIMAL(10,2),
    version TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPROVAL STAGES
CREATE TABLE IF NOT EXISTS public.approval_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    stage_order INTEGER NOT NULL,
    approver_type TEXT NOT NULL,
    approver_id UUID,
    required_approvals INTEGER DEFAULT 1,
    auto_approve_conditions JSONB,
    timeout_hours INTEGER,
    timeout_action TEXT DEFAULT 'escalate',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ARTIST STREAMING LINKS
CREATE TABLE IF NOT EXISTS public.artist_streaming_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    follower_count INTEGER,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.asset_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    allocated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'allocated',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET CHECKOUTS
CREATE TABLE IF NOT EXISTS public.asset_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    checked_out_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checked_out_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checkout_date TIMESTAMPTZ DEFAULT NOW(),
    expected_return_date TIMESTAMPTZ,
    actual_return_date TIMESTAMPTZ,
    condition_out TEXT,
    condition_in TEXT,
    notes TEXT,
    status TEXT DEFAULT 'checked_out',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET DAMAGE REPORTS
CREATE TABLE IF NOT EXISTS public.asset_damage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    damage_date DATE,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    photos JSONB DEFAULT '[]'::jsonb,
    repair_estimate DECIMAL(12,2),
    repair_status TEXT DEFAULT 'pending',
    repaired_at TIMESTAMPTZ,
    insurance_claim_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET DEPRECIATION
CREATE TABLE IF NOT EXISTS public.asset_depreciation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    depreciation_method TEXT NOT NULL,
    useful_life_months INTEGER,
    salvage_value DECIMAL(12,2),
    period_start DATE,
    period_end DATE,
    depreciation_amount DECIMAL(12,2),
    accumulated_depreciation DECIMAL(12,2),
    book_value DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET DISPOSALS
CREATE TABLE IF NOT EXISTS public.asset_disposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    disposal_type TEXT NOT NULL,
    disposal_date DATE,
    disposal_reason TEXT,
    sale_price DECIMAL(12,2),
    book_value_at_disposal DECIMAL(12,2),
    gain_loss DECIMAL(12,2),
    buyer_info JSONB,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    documentation JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET INCIDENTS
CREATE TABLE IF NOT EXISTS public.asset_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    incident_type TEXT NOT NULL,
    incident_date TIMESTAMPTZ,
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    location TEXT,
    witnesses TEXT[],
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET INSURANCE COVERAGE
CREATE TABLE IF NOT EXISTS public.asset_insurance_coverage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE SET NULL,
    coverage_type TEXT NOT NULL,
    coverage_amount DECIMAL(14,2),
    deductible DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET LOCATION ALERTS
CREATE TABLE IF NOT EXISTS public.asset_location_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    geofence_id UUID,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    notes TEXT
);

-- ASSET LOCATION HISTORY
CREATE TABLE IF NOT EXISTS public.asset_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    location_name TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    source TEXT,
    accuracy_meters DECIMAL(8,2)
);

-- ASSET LOCATIONS
CREATE TABLE IF NOT EXISTS public.asset_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    location_type TEXT NOT NULL,
    location_name TEXT,
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    zone TEXT,
    building TEXT,
    floor TEXT,
    room TEXT,
    is_current BOOLEAN DEFAULT true,
    moved_at TIMESTAMPTZ DEFAULT NOW(),
    moved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET MAINTENANCE
CREATE TABLE IF NOT EXISTS public.asset_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    cost DECIMAL(12,2),
    parts_used JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    next_maintenance_date DATE,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET MAINTENANCE LOGS
CREATE TABLE IF NOT EXISTS public.asset_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_id UUID REFERENCES public.asset_maintenance(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL,
    description TEXT,
    logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ASSET REPLACEMENT PLANS
CREATE TABLE IF NOT EXISTS public.asset_replacement_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    planned_replacement_date DATE,
    replacement_reason TEXT,
    estimated_cost DECIMAL(12,2),
    budget_allocated DECIMAL(12,2),
    replacement_asset_specs JSONB,
    status TEXT DEFAULT 'planned',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET RETIREMENTS
CREATE TABLE IF NOT EXISTS public.asset_retirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    retirement_date DATE,
    retirement_reason TEXT,
    final_value DECIMAL(12,2),
    disposition_method TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    documentation JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET RFID TAGS
CREATE TABLE IF NOT EXISTS public.asset_rfid_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    tag_id TEXT UNIQUE NOT NULL,
    tag_type TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_scanned_at TIMESTAMPTZ,
    last_scanned_location TEXT
);

-- ASSET SCANS
CREATE TABLE IF NOT EXISTS public.asset_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL,
    scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    device_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ASSET SPECIFICATIONS
CREATE TABLE IF NOT EXISTS public.asset_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    spec_category TEXT NOT NULL,
    spec_name TEXT NOT NULL,
    spec_value TEXT,
    unit TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET TECHNICAL DOCUMENTS
CREATE TABLE IF NOT EXISTS public.asset_technical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_size INTEGER,
    version TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET TRANSFERS
CREATE TABLE IF NOT EXISTS public.asset_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    from_location TEXT,
    to_location TEXT,
    from_custodian UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    to_custodian UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transfer_date TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET USAGE LOGS
CREATE TABLE IF NOT EXISTS public.asset_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usage_type TEXT NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSET UTILIZATION LOGS
CREATE TABLE IF NOT EXISTS public.asset_utilization_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    total_hours DECIMAL(8,2),
    utilized_hours DECIMAL(8,2),
    utilization_percentage DECIMAL(5,2),
    idle_hours DECIMAL(8,2),
    maintenance_hours DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accessibility_requests_event ON public.accessibility_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_requests_status ON public.accessibility_requests(status);
CREATE INDEX IF NOT EXISTS idx_activities_org ON public.activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_org ON public.analytics_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON public.analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON public.api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON public.api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_asset_allocations_asset ON public.asset_allocations(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_allocations_project ON public.asset_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_asset ON public.asset_checkouts(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_status ON public.asset_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_asset_locations_asset ON public.asset_locations(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_locations_current ON public.asset_locations(is_current);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_asset ON public.asset_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_status ON public.asset_maintenance(status);

-- Enable RLS on all tables
ALTER TABLE public.accessibility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acknowledgment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.age_verification_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.age_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregator_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregator_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_rule_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_store_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_streaming_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_depreciation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_insurance_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_location_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_replacement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_retirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_rfid_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_technical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_utilization_logs ENABLE ROW LEVEL SECURITY;
