-- Migration: Create missing tables (Batch 17 - Sponsorship through Survey)
-- Tables: sponsorship_activity_log through survey_templates

-- SPONSORSHIP ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.sponsorship_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSORSHIP BENEFITS
CREATE TABLE IF NOT EXISTS public.sponsorship_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL,
    benefit_type TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    value DECIMAL(12,2),
    delivery_status TEXT DEFAULT 'pending',
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSORSHIP INVOICES
CREATE TABLE IF NOT EXISTS public.sponsorship_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    invoice_number TEXT,
    amount DECIMAL(14,2) NOT NULL,
    due_date DATE,
    paid_date DATE,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSORSHIP PAYMENTS
CREATE TABLE IF NOT EXISTS public.sponsorship_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSORSHIPS
CREATE TABLE IF NOT EXISTS public.sponsorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    sponsor_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    package_id UUID REFERENCES public.sponsor_packages(id) ON DELETE SET NULL,
    tier_id UUID REFERENCES public.sponsor_tiers(id) ON DELETE SET NULL,
    contract_value DECIMAL(14,2),
    in_kind_value DECIMAL(14,2),
    total_value DECIMAL(14,2),
    start_date DATE,
    end_date DATE,
    contract_url TEXT,
    status TEXT DEFAULT 'pending',
    signed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAFF CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.staff_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    issuing_organization TEXT,
    certification_number TEXT,
    issue_date DATE,
    expiry_date DATE,
    document_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAFF MEALS
CREATE TABLE IF NOT EXISTS public.staff_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ,
    location TEXT,
    headcount INTEGER,
    menu JSONB DEFAULT '[]'::jsonb,
    dietary_accommodations JSONB DEFAULT '[]'::jsonb,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    cost DECIMAL(10,2),
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAFF SCHEDULES
CREATE TABLE IF NOT EXISTS public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    schedule_name TEXT NOT NULL,
    schedule_date DATE,
    department TEXT,
    shifts JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAGE PLOTS
CREATE TABLE IF NOT EXISTS public.stage_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    stage TEXT,
    plot_data JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAGING AREAS
CREATE TABLE IF NOT EXISTS public.staging_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    area_type TEXT NOT NULL,
    location TEXT,
    capacity INTEGER,
    dimensions TEXT,
    equipment JSONB DEFAULT '[]'::jsonb,
    assigned_to TEXT,
    status TEXT DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAKEHOLDER COMMUNICATIONS
CREATE TABLE IF NOT EXISTS public.stakeholder_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stakeholder_id UUID,
    communication_type TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    sent_at TIMESTAMPTZ,
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    response_received BOOLEAN DEFAULT false,
    response_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOCK ADJUSTMENTS
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    product_id UUID,
    variant_id UUID,
    adjustment_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference_type TEXT,
    reference_id UUID,
    adjusted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    product_id UUID,
    variant_id UUID,
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    from_location TEXT,
    to_location TEXT,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    moved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STORAGE LOCATIONS
CREATE TABLE IF NOT EXISTS public.storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    location_type TEXT NOT NULL,
    address TEXT,
    capacity TEXT,
    climate_controlled BOOLEAN DEFAULT false,
    security_level TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STREAMING ANALYTICS
CREATE TABLE IF NOT EXISTS public.streaming_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    concurrent_viewers INTEGER,
    peak_viewers INTEGER,
    total_views INTEGER,
    average_watch_time_seconds INTEGER,
    chat_messages INTEGER,
    likes INTEGER,
    shares INTEGER,
    geographic_data JSONB DEFAULT '{}'::jsonb,
    device_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STREAMING PLATFORMS
CREATE TABLE IF NOT EXISTS public.streaming_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    platform_name TEXT NOT NULL,
    stream_key_encrypted TEXT,
    rtmp_url TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STREAMING SESSIONS
CREATE TABLE IF NOT EXISTS public.streaming_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES public.streaming_platforms(id) ON DELETE SET NULL,
    session_name TEXT,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    stream_url TEXT,
    embed_code TEXT,
    status TEXT DEFAULT 'scheduled',
    peak_viewers INTEGER,
    total_views INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBCONTRACTOR AGREEMENTS
CREATE TABLE IF NOT EXISTS public.subcontractor_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    agreement_number TEXT,
    scope_of_work TEXT,
    start_date DATE,
    end_date DATE,
    contract_value DECIMAL(14,2),
    payment_terms TEXT,
    insurance_requirements JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'draft',
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    billing_period TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    features JSONB DEFAULT '[]'::jsonb,
    limits JSONB DEFAULT '{}'::jsonb,
    trial_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    stripe_subscription_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUCCESSION CANDIDATES
CREATE TABLE IF NOT EXISTS public.succession_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    readiness_level TEXT DEFAULT 'developing',
    readiness_timeline TEXT,
    development_needs JSONB DEFAULT '[]'::jsonb,
    strengths TEXT,
    gaps TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUCCESSION_PLANS
CREATE TABLE IF NOT EXISTS public.succession_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    position_id UUID REFERENCES public.key_positions(id) ON DELETE CASCADE,
    current_incumbent_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    risk_level TEXT DEFAULT 'medium',
    vacancy_risk TEXT,
    plan_status TEXT DEFAULT 'draft',
    review_date DATE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLIER EVALUATIONS
CREATE TABLE IF NOT EXISTS public.supplier_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    evaluation_date DATE,
    evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    quality_score DECIMAL(5,2),
    delivery_score DECIMAL(5,2),
    price_score DECIMAL(5,2),
    service_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    strengths TEXT,
    weaknesses TEXT,
    recommendations TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLY CHAIN ALERTS
CREATE TABLE IF NOT EXISTS public.supply_chain_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT,
    affected_items JSONB DEFAULT '[]'::jsonb,
    affected_vendors JSONB DEFAULT '[]'::jsonb,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT ARTICLES
CREATE TABLE IF NOT EXISTS public.support_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    category TEXT,
    title TEXT NOT NULL,
    slug TEXT,
    content TEXT,
    summary TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT TICKET COMMENTS
CREATE TABLE IF NOT EXISTS public.support_ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    ticket_number TEXT UNIQUE,
    requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    requester_email TEXT,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution TEXT,
    satisfaction_rating INTEGER,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SURVEY QUESTIONS
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL,
    question_type TEXT NOT NULL,
    question_text TEXT NOT NULL,
    description TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    conditional_logic JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SURVEY RESPONSES
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL,
    respondent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    respondent_email TEXT,
    answers JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    is_complete BOOLEAN DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SURVEY TEMPLATES
CREATE TABLE IF NOT EXISTS public.survey_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    questions JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    use_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SURVEYS
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    survey_type TEXT DEFAULT 'general',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_anonymous BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    response_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sponsorship_activity_log_sponsorship ON public.sponsorship_activity_log(sponsorship_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_benefits_sponsorship ON public.sponsorship_benefits(sponsorship_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_org ON public.sponsorships(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_event ON public.sponsorships(event_id);
CREATE INDEX IF NOT EXISTS idx_staff_certifications_user ON public.staff_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_meals_event ON public.staff_meals(event_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_event ON public.staff_schedules(event_id);
CREATE INDEX IF NOT EXISTS idx_stage_plots_event ON public.stage_plots(event_id);
CREATE INDEX IF NOT EXISTS idx_staging_areas_venue ON public.staging_areas(venue_id);
CREATE INDEX IF NOT EXISTS idx_streaming_sessions_event ON public.streaming_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_succession_candidates_plan ON public.succession_candidates(plan_id);
CREATE INDEX IF NOT EXISTS idx_supplier_evaluations_vendor ON public.supplier_evaluations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_surveys_org ON public.surveys(organization_id);

-- Enable RLS
ALTER TABLE public.sponsorship_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcontractor_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
