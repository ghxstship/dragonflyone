-- Migration: Create missing tables (Batch 10 - Order through Plan)
-- Tables: order_round_ups through plan_tests

-- ORDER ROUND UPS
CREATE TABLE IF NOT EXISTS public.order_round_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    charity_id UUID,
    original_total DECIMAL(12,2),
    rounded_total DECIMAL(12,2),
    donation_amount DECIMAL(12,2),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARKING LOTS
CREATE TABLE IF NOT EXISTS public.parking_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lot_type TEXT DEFAULT 'general',
    total_spaces INTEGER,
    available_spaces INTEGER,
    handicap_spaces INTEGER,
    vip_spaces INTEGER,
    hourly_rate DECIMAL(8,2),
    daily_rate DECIMAL(8,2),
    event_rate DECIMAL(8,2),
    address TEXT,
    coordinates JSONB,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNER EVENT ASSOCIATIONS
CREATE TABLE IF NOT EXISTS public.partner_event_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    association_type TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    terms JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNER OFFERS
CREATE TABLE IF NOT EXISTS public.partner_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL,
    offer_name TEXT NOT NULL,
    description TEXT,
    offer_type TEXT NOT NULL,
    discount_type TEXT,
    discount_value DECIMAL(10,2),
    promo_code TEXT,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    max_redemptions INTEGER,
    current_redemptions INTEGER DEFAULT 0,
    terms TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNERSHIP APPLICATIONS
CREATE TABLE IF NOT EXISTS public.partnership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT,
    company_name TEXT,
    partnership_type TEXT,
    proposal TEXT,
    budget_range TEXT,
    timeline TEXT,
    status TEXT DEFAULT 'submitted',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNERSHIP OPPORTUNITIES
CREATE TABLE IF NOT EXISTS public.partnership_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    opportunity_type TEXT NOT NULL,
    investment_range_min DECIMAL(14,2),
    investment_range_max DECIMAL(14,2),
    benefits JSONB DEFAULT '[]'::jsonb,
    requirements TEXT,
    deadline DATE,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNERSHIP REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.partnership_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID REFERENCES public.partner_offers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    discount_applied DECIMAL(10,2),
    notes TEXT
);

-- PATH ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.path_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    path_id UUID NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'enrolled',
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT BATCHES
CREATE TABLE IF NOT EXISTS public.payment_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    batch_number TEXT UNIQUE,
    batch_date DATE NOT NULL,
    payment_method TEXT,
    total_amount DECIMAL(14,2) DEFAULT 0,
    payment_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT REMINDERS
CREATE TABLE IF NOT EXISTS public.payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL,
    scheduled_date DATE,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYROLL CONNECTIONS
CREATE TABLE IF NOT EXISTS public.payroll_connections (
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

-- PAYROLL ENTRIES
CREATE TABLE IF NOT EXISTS public.payroll_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    regular_hours DECIMAL(8,2) DEFAULT 0,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    regular_pay DECIMAL(12,2) DEFAULT 0,
    overtime_pay DECIMAL(12,2) DEFAULT 0,
    bonus DECIMAL(12,2) DEFAULT 0,
    commission DECIMAL(12,2) DEFAULT 0,
    gross_pay DECIMAL(12,2) DEFAULT 0,
    federal_tax DECIMAL(12,2) DEFAULT 0,
    state_tax DECIMAL(12,2) DEFAULT 0,
    local_tax DECIMAL(12,2) DEFAULT 0,
    social_security DECIMAL(12,2) DEFAULT 0,
    medicare DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    net_pay DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYROLL PERIODS
CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    pay_date DATE,
    period_type TEXT DEFAULT 'bi_weekly',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYROLL PROVIDERS
CREATE TABLE IF NOT EXISTS public.payroll_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider_type TEXT,
    api_endpoint TEXT,
    supported_features TEXT[],
    is_active BOOLEAN DEFAULT true,
    config_schema JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PCARD TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.pcard_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pcard_id UUID NOT NULL,
    transaction_date DATE NOT NULL,
    post_date DATE,
    merchant_name TEXT,
    merchant_category TEXT,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    expense_category TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PCARDS
CREATE TABLE IF NOT EXISTS public.pcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    card_number_last4 TEXT,
    card_type TEXT,
    credit_limit DECIMAL(12,2),
    available_credit DECIMAL(12,2),
    billing_address JSONB,
    expiration_date DATE,
    status TEXT DEFAULT 'active',
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PER DIEM EXPENSES
CREATE TABLE IF NOT EXISTS public.per_diem_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    expense_date DATE NOT NULL,
    location TEXT,
    meals_amount DECIMAL(10,2) DEFAULT 0,
    lodging_amount DECIMAL(10,2) DEFAULT 0,
    incidentals_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    rate_type TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE CAPTURES
CREATE TABLE IF NOT EXISTS public.performance_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    capture_type TEXT NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    file_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    resolution TEXT,
    file_size BIGINT,
    status TEXT DEFAULT 'processing',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE GOALS
CREATE TABLE IF NOT EXISTS public.performance_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    review_period_id UUID,
    goal_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(18,4),
    current_value DECIMAL(18,4),
    unit TEXT,
    weight DECIMAL(5,2),
    due_date DATE,
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE REVIEWS
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    review_period_start DATE,
    review_period_end DATE,
    review_type TEXT DEFAULT 'annual',
    overall_rating INTEGER,
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,
    employee_comments TEXT,
    status TEXT DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERMIT AUTHORITIES
CREATE TABLE IF NOT EXISTS public.permit_authorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    authority_type TEXT,
    jurisdiction TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    contact_name TEXT,
    contact_title TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHOTO DOCUMENTATION
CREATE TABLE IF NOT EXISTS public.photo_documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    photo_type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    taken_at TIMESTAMPTZ,
    taken_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHOTO GALLERIES
CREATE TABLE IF NOT EXISTS public.photo_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    organization_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    photo_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    photographer_credit TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAN ANNOTATIONS
CREATE TABLE IF NOT EXISTS public.plan_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    annotation_type TEXT NOT NULL,
    content TEXT,
    position_x DECIMAL(10,4),
    position_y DECIMAL(10,4),
    width DECIMAL(10,4),
    height DECIMAL(10,4),
    color TEXT,
    layer TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAN CONTACTS
CREATE TABLE IF NOT EXISTS public.plan_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    contact_type TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    organization TEXT,
    phone TEXT,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAN PROCEDURES
CREATE TABLE IF NOT EXISTS public.plan_procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    procedure_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    responsible_parties TEXT[],
    trigger_conditions TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAN TESTS
CREATE TABLE IF NOT EXISTS public.plan_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    test_type TEXT NOT NULL,
    test_name TEXT NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    participants UUID[],
    results TEXT,
    issues_found JSONB DEFAULT '[]'::jsonb,
    recommendations TEXT,
    status TEXT DEFAULT 'scheduled',
    conducted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_round_ups_order ON public.order_round_ups(order_id);
CREATE INDEX IF NOT EXISTS idx_parking_lots_venue ON public.parking_lots(venue_id);
CREATE INDEX IF NOT EXISTS idx_partner_event_associations_event ON public.partner_event_associations(event_id);
CREATE INDEX IF NOT EXISTS idx_partnership_applications_org ON public.partnership_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_path_enrollments_user ON public.path_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_batches_org ON public.payment_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice ON public.payment_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_run ON public.payroll_entries(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_employee ON public.payroll_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_pcard_transactions_pcard ON public.pcard_transactions(pcard_id);
CREATE INDEX IF NOT EXISTS idx_per_diem_expenses_employee ON public.per_diem_expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_employee ON public.performance_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_photo_galleries_event ON public.photo_galleries(event_id);

-- Enable RLS
ALTER TABLE public.order_round_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_event_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcard_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.per_diem_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_tests ENABLE ROW LEVEL SECURITY;
