-- Migration: Create missing tables (Batch 3 - Cable through Client)
-- Tables: cable_runs through client_walkthroughs

-- CABLE RUNS
CREATE TABLE IF NOT EXISTS public.cable_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    cable_type TEXT NOT NULL,
    length_feet DECIMAL(10,2),
    start_point TEXT,
    end_point TEXT,
    route_description TEXT,
    signal_type TEXT,
    connector_type_a TEXT,
    connector_type_b TEXT,
    label TEXT,
    status TEXT DEFAULT 'planned',
    installed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    installed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CALIBRATION RECORDS
CREATE TABLE IF NOT EXISTS public.calibration_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    calibration_date DATE NOT NULL,
    calibration_type TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    results JSONB DEFAULT '{}'::jsonb,
    passed BOOLEAN,
    certificate_number TEXT,
    certificate_url TEXT,
    next_calibration_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CALIBRATION SCHEDULES
CREATE TABLE IF NOT EXISTS public.calibration_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    frequency_days INTEGER NOT NULL,
    last_calibration_date DATE,
    next_calibration_date DATE,
    calibration_type TEXT,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    estimated_cost DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    notification_days_before INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CANDIDATE COMMUNICATIONS
CREATE TABLE IF NOT EXISTS public.candidate_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL,
    communication_type TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    sent_at TIMESTAMPTZ,
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft',
    template_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAPACITY ALERTS
CREATE TABLE IF NOT EXISTS public.capacity_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    zone_id UUID,
    alert_type TEXT NOT NULL,
    threshold_percentage DECIMAL(5,2),
    current_count INTEGER,
    max_capacity INTEGER,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- CAPACITY CONFIGURATIONS
CREATE TABLE IF NOT EXISTS public.capacity_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    configuration_name TEXT NOT NULL,
    total_capacity INTEGER NOT NULL,
    standing_capacity INTEGER,
    seated_capacity INTEGER,
    zones JSONB DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAPACITY LOGS
CREATE TABLE IF NOT EXISTS public.capacity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    zone_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    count_in INTEGER DEFAULT 0,
    count_out INTEGER DEFAULT 0,
    current_count INTEGER DEFAULT 0,
    source TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- CAPTURE ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.capture_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    capture_type TEXT NOT NULL,
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    equipment_ids UUID[],
    instructions TEXT,
    status TEXT DEFAULT 'assigned',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CAPTURED MEDIA
CREATE TABLE IF NOT EXISTS public.captured_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.capture_assignments(id) ON DELETE SET NULL,
    media_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INTEGER,
    duration_seconds INTEGER,
    resolution TEXT,
    captured_at TIMESTAMPTZ,
    captured_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'raw',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CASE STUDIES
CREATE TABLE IF NOT EXISTS public.case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    client_name TEXT,
    industry TEXT,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    testimonial TEXT,
    testimonial_author TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CASH FLOW SCENARIOS
CREATE TABLE IF NOT EXISTS public.cash_flow_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    scenario_type TEXT DEFAULT 'base',
    assumptions JSONB DEFAULT '{}'::jsonb,
    projections JSONB DEFAULT '[]'::jsonb,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATERING VENDORS
CREATE TABLE IF NOT EXISTS public.catering_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    cuisine_types TEXT[],
    service_styles TEXT[],
    min_guests INTEGER,
    max_guests INTEGER,
    price_per_person_min DECIMAL(10,2),
    price_per_person_max DECIMAL(10,2),
    dietary_options TEXT[],
    certifications TEXT[],
    lead_time_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHANNEL MEMBERS
CREATE TABLE IF NOT EXISTS public.channel_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    notifications_enabled BOOLEAN DEFAULT true,
    is_muted BOOLEAN DEFAULT false
);

-- CHAT ROOM MEMBERS
CREATE TABLE IF NOT EXISTS public.chat_room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ,
    is_admin BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true
);

-- CHAT ROOMS
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    room_type TEXT DEFAULT 'group',
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    avatar_url TEXT,
    last_message_at TIMESTAMPTZ,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHECKOUT CONFIGURATION
CREATE TABLE IF NOT EXISTS public.checkout_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    payment_methods TEXT[] DEFAULT ARRAY['card'],
    currency TEXT DEFAULT 'USD',
    tax_rate DECIMAL(5,4),
    service_fee_percentage DECIMAL(5,4),
    service_fee_fixed DECIMAL(10,2),
    allow_promo_codes BOOLEAN DEFAULT true,
    require_billing_address BOOLEAN DEFAULT false,
    require_phone BOOLEAN DEFAULT false,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    terms_url TEXT,
    privacy_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENT CHURN RECORDS
CREATE TABLE IF NOT EXISTS public.client_churn_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    client_id UUID NOT NULL,
    churn_date DATE NOT NULL,
    churn_reason TEXT,
    churn_type TEXT,
    last_revenue DECIMAL(14,2),
    lifetime_value DECIMAL(14,2),
    win_back_attempts INTEGER DEFAULT 0,
    win_back_status TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENT INVOICES
CREATE TABLE IF NOT EXISTS public.client_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    client_id UUID NOT NULL,
    invoice_number TEXT UNIQUE,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) DEFAULT 0,
    amount_paid DECIMAL(14,2) DEFAULT 0,
    balance_due DECIMAL(14,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'draft',
    terms TEXT,
    notes TEXT,
    line_items JSONB DEFAULT '[]'::jsonb,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENT ONBOARDING
CREATE TABLE IF NOT EXISTS public.client_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    template_id UUID,
    status TEXT DEFAULT 'not_started',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checklist JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENT PAYMENTS
CREATE TABLE IF NOT EXISTS public.client_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.client_invoices(id) ON DELETE CASCADE,
    client_id UUID NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENT REQUIREMENTS
CREATE TABLE IF NOT EXISTS public.client_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    requirement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    due_date DATE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENT WALKTHROUGHS
CREATE TABLE IF NOT EXISTS public.client_walkthroughs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMPTZ,
    duration_minutes INTEGER,
    attendees JSONB DEFAULT '[]'::jsonb,
    agenda TEXT,
    notes TEXT,
    status TEXT DEFAULT 'scheduled',
    completed_at TIMESTAMPTZ,
    follow_up_items JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cable_runs_event ON public.cable_runs(event_id);
CREATE INDEX IF NOT EXISTS idx_calibration_records_asset ON public.calibration_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_calibration_schedules_asset ON public.calibration_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_capacity_alerts_venue ON public.capacity_alerts(venue_id);
CREATE INDEX IF NOT EXISTS idx_capacity_logs_event ON public.capacity_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_captured_media_event ON public.captured_media(event_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON public.channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON public.chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_org ON public.chat_rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_client ON public.client_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_status ON public.client_invoices(status);
CREATE INDEX IF NOT EXISTS idx_client_payments_invoice ON public.client_payments(invoice_id);

-- Enable RLS
ALTER TABLE public.cable_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capture_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captured_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catering_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_churn_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_walkthroughs ENABLE ROW LEVEL SECURITY;
