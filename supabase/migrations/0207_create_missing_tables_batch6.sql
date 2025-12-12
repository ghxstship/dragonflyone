-- Migration: Create missing tables (Batch 6 - Ground through Interview)
-- Tables: ground_plans through interview_responses

-- GROUND PLANS
CREATE TABLE IF NOT EXISTS public.ground_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type TEXT,
    scale TEXT,
    dimensions JSONB,
    layers JSONB DEFAULT '[]'::jsonb,
    annotations JSONB DEFAULT '[]'::jsonb,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GROUP MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GUEST ARTISTS
CREATE TABLE IF NOT EXISTS public.guest_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    host_artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    appearance_type TEXT DEFAULT 'guest',
    set_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    is_surprise BOOLEAN DEFAULT false,
    is_confirmed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GUEST PROFILES
CREATE TABLE IF NOT EXISTS public.guest_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_type TEXT DEFAULT 'general',
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    dietary_restrictions TEXT[],
    accessibility_needs TEXT[],
    notes TEXT,
    vip_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GVTEWAY EVENTS
CREATE TABLE IF NOT EXISTS public.gvteway_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    external_id TEXT,
    platform TEXT,
    sync_status TEXT DEFAULT 'pending',
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GVTEWAY STRIPE EVENTS
CREATE TABLE IF NOT EXISTS public.gvteway_stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GVTEWAY TICKET TYPES
CREATE TABLE IF NOT EXISTS public.gvteway_ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    is_synced BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HANDBOOK VERSIONS
CREATE TABLE IF NOT EXISTS public.handbook_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    version_number TEXT NOT NULL,
    title TEXT,
    description TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    effective_date DATE,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HR CONNECTIONS
CREATE TABLE IF NOT EXISTS public.hr_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    provider TEXT NOT NULL,
    connection_name TEXT,
    credentials JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HR SYNC LOGS
CREATE TABLE IF NOT EXISTS public.hr_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.hr_connections(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running',
    records_synced INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    details JSONB DEFAULT '{}'::jsonb
);

-- HR SYNCED EMPLOYEES
CREATE TABLE IF NOT EXISTS public.hr_synced_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.hr_connections(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status TEXT DEFAULT 'synced',
    external_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(connection_id, external_id)
);

-- HR TIME OFF REQUESTS
CREATE TABLE IF NOT EXISTS public.hr_time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_requested DECIMAL(6,2),
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ICE ACTIVATIONS
CREATE TABLE IF NOT EXISTS public.ice_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    activation_type TEXT NOT NULL,
    location TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    capacity INTEGER,
    equipment_needed JSONB DEFAULT '[]'::jsonb,
    staff_needed INTEGER,
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDUSTRY ASSOCIATIONS
CREATE TABLE IF NOT EXISTS public.industry_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    association_name TEXT NOT NULL,
    membership_type TEXT,
    membership_number TEXT,
    start_date DATE,
    renewal_date DATE,
    annual_fee DECIMAL(10,2),
    benefits TEXT,
    contact_info JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INFLUENCER CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.influencer_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    campaign_name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    target_reach INTEGER,
    actual_reach INTEGER,
    influencers JSONB DEFAULT '[]'::jsonb,
    deliverables JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'planning',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSPECTION ITEMS
CREATE TABLE IF NOT EXISTS public.inspection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    passed BOOLEAN,
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    inspected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSPECTION SIGNATURES
CREATE TABLE IF NOT EXISTS public.inspection_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL,
    signer_name TEXT NOT NULL,
    signer_title TEXT,
    signer_company TEXT,
    signature_url TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTEGRATION ANALYTICS DAILY
CREATE TABLE IF NOT EXISTS public.integration_analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    integration_id UUID NOT NULL,
    date DATE NOT NULL,
    api_calls INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    data_synced_bytes BIGINT DEFAULT 0,
    average_response_ms INTEGER,
    error_rate DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(integration_id, date)
);

-- INTEGRATION EVENTS
CREATE TABLE IF NOT EXISTS public.integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTEGRATION LOGS
CREATE TABLE IF NOT EXISTS public.integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL,
    log_level TEXT DEFAULT 'info',
    message TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    request_data JSONB,
    response_data JSONB,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTEGRATION SECRETS
CREATE TABLE IF NOT EXISTS public.integration_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL,
    secret_name TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(integration_id, secret_name)
);

-- INTEGRATION USAGE LOGS
CREATE TABLE IF NOT EXISTS public.integration_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTELLECTUAL PROPERTY
CREATE TABLE IF NOT EXISTS public.intellectual_property (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    ip_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    registration_number TEXT,
    registration_date DATE,
    expiration_date DATE,
    jurisdiction TEXT,
    status TEXT DEFAULT 'active',
    owner TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTERCOMPANY ELIMINATIONS
CREATE TABLE IF NOT EXISTS public.intercompany_eliminations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    period_start DATE,
    period_end DATE,
    from_entity TEXT,
    to_entity TEXT,
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    amount DECIMAL(14,2),
    elimination_type TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTERNSHIP PROGRAMS
CREATE TABLE IF NOT EXISTS public.internship_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    program_name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    duration_weeks INTEGER,
    start_date DATE,
    end_date DATE,
    positions_available INTEGER,
    positions_filled INTEGER DEFAULT 0,
    compensation_type TEXT,
    hourly_rate DECIMAL(10,2),
    stipend DECIMAL(10,2),
    requirements TEXT,
    status TEXT DEFAULT 'planning',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTERVIEW PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.interview_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL,
    participant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTERVIEW QUESTIONS
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT,
    difficulty_level TEXT,
    expected_answer TEXT,
    scoring_criteria JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTERVIEW RESPONSES
CREATE TABLE IF NOT EXISTS public.interview_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL,
    question_id UUID REFERENCES public.interview_questions(id) ON DELETE SET NULL,
    response_text TEXT,
    score INTEGER,
    notes TEXT,
    evaluated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVESTOR DOCUMENTS
CREATE TABLE IF NOT EXISTS public.investor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    investor_id UUID,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_size INTEGER,
    is_confidential BOOLEAN DEFAULT true,
    access_level TEXT DEFAULT 'investor',
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICE ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.invoice_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICE LINE ITEMS
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICE PAYMENTS
CREATE TABLE IF NOT EXISTS public.invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICE PENALTIES
CREATE TABLE IF NOT EXISTS public.invoice_penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    penalty_type TEXT NOT NULL,
    penalty_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT,
    waived BOOLEAN DEFAULT false,
    waived_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    waived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ground_plans_venue ON public.ground_plans(venue_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON public.group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_event ON public.guest_profiles(event_id);
CREATE INDEX IF NOT EXISTS idx_gvteway_stripe_events_type ON public.gvteway_stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_hr_sync_logs_connection ON public.hr_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_hr_time_off_requests_employee ON public.hr_time_off_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration ON public.integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON public.integration_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_activity_log_invoice ON public.invoice_activity_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON public.invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);

-- Enable RLS
ALTER TABLE public.ground_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gvteway_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gvteway_stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gvteway_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handbook_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_synced_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ice_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intellectual_property ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intercompany_eliminations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_penalties ENABLE ROW LEVEL SECURITY;
