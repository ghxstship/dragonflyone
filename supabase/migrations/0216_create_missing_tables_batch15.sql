-- Migration: Create missing tables (Batch 15 - Seating through Show)
-- Tables: seating_assignments through show_reports

-- SEATING ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.seating_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    section TEXT,
    row TEXT,
    seat TEXT,
    seat_type TEXT DEFAULT 'standard',
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEATING CHARTS
CREATE TABLE IF NOT EXISTS public.seating_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    chart_data JSONB DEFAULT '{}'::jsonb,
    sections JSONB DEFAULT '[]'::jsonb,
    total_capacity INTEGER,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEATING SECTIONS
CREATE TABLE IF NOT EXISTS public.seating_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_id UUID REFERENCES public.seating_charts(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL,
    section_type TEXT DEFAULT 'standard',
    capacity INTEGER,
    rows INTEGER,
    seats_per_row INTEGER,
    price_tier TEXT,
    color TEXT,
    coordinates JSONB,
    is_accessible BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.section_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.seating_sections(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE SET NULL,
    allocated_seats INTEGER,
    sold_seats INTEGER DEFAULT 0,
    held_seats INTEGER DEFAULT 0,
    available_seats INTEGER,
    price_override DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY BRIEFINGS
CREATE TABLE IF NOT EXISTS public.security_briefings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    briefing_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    scheduled_time TIMESTAMPTZ,
    location TEXT,
    conducted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    conducted_at TIMESTAMPTZ,
    attendee_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY CHECKPOINTS
CREATE TABLE IF NOT EXISTS public.security_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    checkpoint_name TEXT NOT NULL,
    location TEXT,
    checkpoint_type TEXT DEFAULT 'entry',
    equipment JSONB DEFAULT '[]'::jsonb,
    staff_count INTEGER,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    coordinates JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY INCIDENTS
CREATE TABLE IF NOT EXISTS public.security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    incident_time TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    incident_type TEXT NOT NULL,
    severity TEXT DEFAULT 'low',
    description TEXT,
    persons_involved TEXT,
    witnesses TEXT,
    action_taken TEXT,
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responding_officers TEXT[],
    police_report_number TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'open',
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY LOGS
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    log_type TEXT NOT NULL,
    location TEXT,
    description TEXT,
    logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    severity TEXT DEFAULT 'info',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY PERSONNEL
CREATE TABLE IF NOT EXISTS public.security_personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT,
    license_number TEXT,
    license_expiry DATE,
    shift_start TIMESTAMPTZ,
    shift_end TIMESTAMPTZ,
    assigned_area TEXT,
    contact_phone TEXT,
    radio_channel TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY PLANS
CREATE TABLE IF NOT EXISTS public.security_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    plan_type TEXT DEFAULT 'comprehensive',
    threat_assessment JSONB DEFAULT '{}'::jsonb,
    personnel_plan JSONB DEFAULT '{}'::jsonb,
    checkpoint_plan JSONB DEFAULT '{}'::jsonb,
    emergency_procedures JSONB DEFAULT '{}'::jsonb,
    communication_plan JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECURITY ZONES
CREATE TABLE IF NOT EXISTS public.security_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    zone_name TEXT NOT NULL,
    zone_type TEXT NOT NULL,
    access_level TEXT DEFAULT 'public',
    description TEXT,
    boundaries JSONB,
    required_credentials TEXT[],
    max_capacity INTEGER,
    current_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SENT EMAILS
CREATE TABLE IF NOT EXISTS public.sent_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    template_id UUID,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT,
    body_html TEXT,
    body_text TEXT,
    from_email TEXT,
    from_name TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent',
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- SERVICE AGREEMENTS
CREATE TABLE IF NOT EXISTS public.service_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    client_id UUID,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    agreement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    value DECIMAL(14,2),
    payment_terms TEXT,
    service_level TEXT,
    terms JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'draft',
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE LEVEL AGREEMENTS
CREATE TABLE IF NOT EXISTS public.service_level_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    service_type TEXT,
    metrics JSONB DEFAULT '[]'::jsonb,
    response_time_hours INTEGER,
    resolution_time_hours INTEGER,
    availability_percentage DECIMAL(5,2),
    penalties JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    request_number TEXT UNIQUE,
    requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution TEXT,
    satisfaction_rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SESSION RECORDINGS
CREATE TABLE IF NOT EXISTS public.session_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recording_url TEXT,
    duration_seconds INTEGER,
    page_views INTEGER,
    events_count INTEGER,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SET LISTS
CREATE TABLE IF NOT EXISTS public.set_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    set_type TEXT DEFAULT 'main',
    songs JSONB DEFAULT '[]'::jsonb,
    total_duration_minutes INTEGER,
    notes TEXT,
    is_confirmed BOOLEAN DEFAULT false,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTLEMENT ADJUSTMENTS
CREATE TABLE IF NOT EXISTS public.settlement_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL,
    adjustment_type TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(14,2) NOT NULL,
    reason TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTLEMENT DISPUTES
CREATE TABLE IF NOT EXISTS public.settlement_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL,
    dispute_type TEXT NOT NULL,
    description TEXT,
    disputed_amount DECIMAL(14,2),
    raised_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    raised_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'open',
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTLEMENT LINE ITEMS
CREATE TABLE IF NOT EXISTS public.settlement_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL,
    line_type TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(12,4) DEFAULT 1,
    unit_price DECIMAL(12,4),
    total_amount DECIMAL(14,2),
    category TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIFT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.shift_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT,
    status TEXT DEFAULT 'assigned',
    confirmed_at TIMESTAMPTZ,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIFT SWAPS
CREATE TABLE IF NOT EXISTS public.shift_swaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_assignment_id UUID REFERENCES public.shift_assignments(id) ON DELETE CASCADE,
    requesting_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIFTS
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    shift_name TEXT NOT NULL,
    shift_date DATE,
    start_time TIME,
    end_time TIME,
    department TEXT,
    role TEXT,
    required_count INTEGER DEFAULT 1,
    assigned_count INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIPPING LABELS
CREATE TABLE IF NOT EXISTS public.shipping_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL,
    carrier TEXT NOT NULL,
    tracking_number TEXT,
    label_url TEXT,
    label_format TEXT DEFAULT 'pdf',
    cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIPPING RATES
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    carrier TEXT NOT NULL,
    service_type TEXT NOT NULL,
    origin_zone TEXT,
    destination_zone TEXT,
    weight_min DECIMAL(10,4),
    weight_max DECIMAL(10,4),
    rate DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHOW CALLS
CREATE TABLE IF NOT EXISTS public.show_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    call_type TEXT NOT NULL,
    call_time TIMESTAMPTZ NOT NULL,
    department TEXT,
    location TEXT,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHOW REPORTS
CREATE TABLE IF NOT EXISTS public.show_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    report_type TEXT DEFAULT 'daily',
    report_date DATE,
    attendance INTEGER,
    weather_conditions TEXT,
    show_start_time TIMESTAMPTZ,
    show_end_time TIMESTAMPTZ,
    delays TEXT,
    technical_issues TEXT,
    incidents TEXT,
    highlights TEXT,
    notes TEXT,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seating_assignments_event ON public.seating_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_seating_charts_venue ON public.seating_charts(venue_id);
CREATE INDEX IF NOT EXISTS idx_security_briefings_event ON public.security_briefings(event_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_event ON public.security_incidents(event_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event ON public.security_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_security_personnel_event ON public.security_personnel(event_id);
CREATE INDEX IF NOT EXISTS idx_security_plans_event ON public.security_plans(event_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_recipient ON public.sent_emails(recipient_email);
CREATE INDEX IF NOT EXISTS idx_service_requests_org ON public.service_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_set_lists_event ON public.set_lists(event_id);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift ON public.shift_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_shifts_event ON public.shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_show_calls_event ON public.show_calls(event_id);
CREATE INDEX IF NOT EXISTS idx_show_reports_event ON public.show_reports(event_id);

-- Enable RLS
ALTER TABLE public.seating_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_level_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_reports ENABLE ROW LEVEL SECURITY;
