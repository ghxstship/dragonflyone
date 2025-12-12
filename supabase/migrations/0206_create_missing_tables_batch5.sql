-- Migration: Create missing tables (Batch 5 - ETL through Grant)
-- Tables: etl_pipelines through grants

-- ETL PIPELINES
CREATE TABLE IF NOT EXISTS public.etl_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL,
    source_config JSONB DEFAULT '{}'::jsonb,
    destination_type TEXT NOT NULL,
    destination_config JSONB DEFAULT '{}'::jsonb,
    transform_rules JSONB DEFAULT '[]'::jsonb,
    schedule TEXT,
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    last_run_status TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT AGE REQUIREMENTS
CREATE TABLE IF NOT EXISTS public.event_age_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    minimum_age INTEGER,
    maximum_age INTEGER,
    verification_required BOOLEAN DEFAULT false,
    verification_methods TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT AGE RESTRICTIONS
CREATE TABLE IF NOT EXISTS public.event_age_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    restriction_type TEXT NOT NULL,
    minimum_age INTEGER,
    area_restrictions JSONB DEFAULT '[]'::jsonb,
    time_restrictions JSONB DEFAULT '[]'::jsonb,
    enforcement_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT ATTENDANCE
CREATE TABLE IF NOT EXISTS public.event_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    entry_point TEXT,
    exit_point TEXT,
    attendance_type TEXT DEFAULT 'general',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT CATEGORIES
CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
    icon TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT CURRENCY PRICES
CREATE TABLE IF NOT EXISTS public.event_currency_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    currency TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    exchange_rate DECIMAL(12,6),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT EXPENSES
CREATE TABLE IF NOT EXISTS public.event_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    expense_category TEXT NOT NULL,
    description TEXT,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    expense_date DATE,
    payment_status TEXT DEFAULT 'pending',
    receipt_url TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT LANDING PAGES
CREATE TABLE IF NOT EXISTS public.event_landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    slug TEXT UNIQUE,
    title TEXT,
    meta_description TEXT,
    hero_image_url TEXT,
    hero_video_url TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    custom_css TEXT,
    custom_js TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT LISTINGS
CREATE TABLE IF NOT EXISTS public.event_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_id TEXT,
    listing_url TEXT,
    status TEXT DEFAULT 'pending',
    sync_status TEXT DEFAULT 'pending',
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT PERFORMERS
CREATE TABLE IF NOT EXISTS public.event_performers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    performance_order INTEGER,
    set_time TIMESTAMPTZ,
    set_duration_minutes INTEGER,
    stage TEXT,
    is_headliner BOOLEAN DEFAULT false,
    billing_level TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT PLAYLISTS
CREATE TABLE IF NOT EXISTS public.event_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    platform TEXT,
    external_url TEXT,
    external_id TEXT,
    tracks JSONB DEFAULT '[]'::jsonb,
    is_official BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT SEATING
CREATE TABLE IF NOT EXISTS public.event_seating (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    seating_chart_id UUID,
    configuration_name TEXT,
    total_seats INTEGER,
    available_seats INTEGER,
    held_seats INTEGER DEFAULT 0,
    sold_seats INTEGER DEFAULT 0,
    sections JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT SETTLEMENTS
CREATE TABLE IF NOT EXISTS public.event_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    settlement_date DATE,
    gross_revenue DECIMAL(14,2) DEFAULT 0,
    ticket_sales DECIMAL(14,2) DEFAULT 0,
    merchandise_sales DECIMAL(14,2) DEFAULT 0,
    food_beverage_sales DECIMAL(14,2) DEFAULT 0,
    sponsorship_revenue DECIMAL(14,2) DEFAULT 0,
    other_revenue DECIMAL(14,2) DEFAULT 0,
    total_expenses DECIMAL(14,2) DEFAULT 0,
    artist_fees DECIMAL(14,2) DEFAULT 0,
    venue_costs DECIMAL(14,2) DEFAULT 0,
    production_costs DECIMAL(14,2) DEFAULT 0,
    marketing_costs DECIMAL(14,2) DEFAULT 0,
    net_profit DECIMAL(14,2) DEFAULT 0,
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT VIDEOS
CREATE TABLE IF NOT EXISTS public.event_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    video_type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    is_public BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXCHANGE RATES
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    rate DECIMAL(18,8) NOT NULL,
    effective_date DATE NOT NULL,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(base_currency, target_currency, effective_date)
);

-- EXPENSE ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.expense_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPENSE APPROVALS
CREATE TABLE IF NOT EXISTS public.expense_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approval_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPENSE CATEGORIES
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    parent_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    gl_account TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_receipt BOOLEAN DEFAULT false,
    max_amount DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPERIENCE BLUEPRINTS
CREATE TABLE IF NOT EXISTS public.experience_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    template_data JSONB DEFAULT '{}'::jsonb,
    components JSONB DEFAULT '[]'::jsonb,
    estimated_duration_minutes INTEGER,
    estimated_cost DECIMAL(12,2),
    is_template BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPERIENCE LISTINGS
CREATE TABLE IF NOT EXISTS public.experience_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(12,2),
    duration_minutes INTEGER,
    max_participants INTEGER,
    location TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    availability JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    category TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FINAL INSPECTIONS
CREATE TABLE IF NOT EXISTS public.final_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    inspection_date TIMESTAMPTZ,
    inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    inspection_type TEXT NOT NULL,
    checklist JSONB DEFAULT '[]'::jsonb,
    passed BOOLEAN,
    issues_found JSONB DEFAULT '[]'::jsonb,
    corrective_actions TEXT,
    sign_off_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sign_off_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FINANCIAL ACCOUNTS
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    parent_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
    normal_balance TEXT,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FIXED ASSETS
CREATE TABLE IF NOT EXISTS public.fixed_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    asset_number TEXT UNIQUE,
    description TEXT,
    acquisition_date DATE,
    acquisition_cost DECIMAL(14,2),
    useful_life_months INTEGER,
    salvage_value DECIMAL(14,2),
    depreciation_method TEXT DEFAULT 'straight_line',
    accumulated_depreciation DECIMAL(14,2) DEFAULT 0,
    book_value DECIMAL(14,2),
    location TEXT,
    department TEXT,
    status TEXT DEFAULT 'active',
    disposal_date DATE,
    disposal_amount DECIMAL(14,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FOLDERS
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    path TEXT,
    folder_type TEXT DEFAULT 'general',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_shared BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FREELANCER BOOKINGS
CREATE TABLE IF NOT EXISTS public.freelancer_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    booking_date DATE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    role TEXT,
    rate DECIMAL(10,2),
    rate_type TEXT DEFAULT 'hourly',
    status TEXT DEFAULT 'pending',
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FREELANCER RATINGS
CREATE TABLE IF NOT EXISTS public.freelancer_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL,
    rated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES public.freelancer_bookings(id) ON DELETE SET NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    review_text TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FREELANCER SKILLS
CREATE TABLE IF NOT EXISTS public.freelancer_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL,
    skill_name TEXT NOT NULL,
    skill_category TEXT,
    proficiency_level TEXT,
    years_experience DECIMAL(4,1),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FREELANCERS
CREATE TABLE IF NOT EXISTS public.freelancers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    headline TEXT,
    location TEXT,
    timezone TEXT,
    hourly_rate DECIMAL(10,2),
    day_rate DECIMAL(10,2),
    availability_status TEXT DEFAULT 'available',
    portfolio_url TEXT,
    resume_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    rating_average DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FUNDING SOURCES
CREATE TABLE IF NOT EXISTS public.funding_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL,
    description TEXT,
    total_amount DECIMAL(14,2),
    available_amount DECIMAL(14,2),
    restrictions TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GA FLOOR CONFIGS
CREATE TABLE IF NOT EXISTS public.ga_floor_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    config_name TEXT NOT NULL,
    total_capacity INTEGER,
    zones JSONB DEFAULT '[]'::jsonb,
    barriers JSONB DEFAULT '[]'::jsonb,
    entry_points JSONB DEFAULT '[]'::jsonb,
    exit_points JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GENERATED BLUEPRINTS
CREATE TABLE IF NOT EXISTS public.generated_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    blueprint_type TEXT NOT NULL,
    source_data JSONB DEFAULT '{}'::jsonb,
    generated_data JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    generated_at TIMESTAMPTZ,
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GENERATED MANIFESTS
CREATE TABLE IF NOT EXISTS public.generated_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    manifest_type TEXT NOT NULL,
    title TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1
);

-- GENERATED PDFS
CREATE TABLE IF NOT EXISTS public.generated_pdfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    document_type TEXT NOT NULL,
    title TEXT,
    source_data JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    file_size INTEGER,
    page_count INTEGER,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ
);

-- GENERATED REPORTS
CREATE TABLE IF NOT EXISTS public.generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    report_type TEXT NOT NULL,
    title TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    data JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    format TEXT DEFAULT 'pdf',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ
);

-- GL ENTRIES
CREATE TABLE IF NOT EXISTS public.gl_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    journal_id UUID,
    account_id UUID REFERENCES public.financial_accounts(id) ON DELETE RESTRICT,
    entry_date DATE NOT NULL,
    debit_amount DECIMAL(14,2) DEFAULT 0,
    credit_amount DECIMAL(14,2) DEFAULT 0,
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    is_posted BOOLEAN DEFAULT false,
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GLOSSARY TERMS
CREATE TABLE IF NOT EXISTS public.glossary_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    category TEXT,
    related_terms TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GOVERNANCE DOCUMENTS
CREATE TABLE IF NOT EXISTS public.governance_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    version TEXT,
    effective_date DATE,
    review_date DATE,
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRANT EXPENDITURES
CREATE TABLE IF NOT EXISTS public.grant_expenditures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL,
    expenditure_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT,
    description TEXT,
    receipt_url TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRANT RECEIPTS
CREATE TABLE IF NOT EXISTS public.grant_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL,
    receipt_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRANT REPORTS
CREATE TABLE IF NOT EXISTS public.grant_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL,
    report_type TEXT NOT NULL,
    report_period_start DATE,
    report_period_end DATE,
    due_date DATE,
    submitted_date DATE,
    content JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    status TEXT DEFAULT 'draft',
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRANTS
CREATE TABLE IF NOT EXISTS public.grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    grant_name TEXT NOT NULL,
    grantor_name TEXT,
    grant_number TEXT,
    description TEXT,
    award_amount DECIMAL(14,2),
    received_amount DECIMAL(14,2) DEFAULT 0,
    spent_amount DECIMAL(14,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    reporting_requirements TEXT,
    restrictions TEXT,
    status TEXT DEFAULT 'active',
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_etl_pipelines_org ON public.etl_pipelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON public.event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_user ON public.event_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_event_expenses_event ON public.event_expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_performers_event ON public.event_performers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_settlements_event ON public.event_settlements(event_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(effective_date);
CREATE INDEX IF NOT EXISTS idx_expense_activity_log_expense ON public.expense_activity_log(expense_id);
CREATE INDEX IF NOT EXISTS idx_faqs_event ON public.faqs(event_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_org ON public.fixed_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_freelancers_user ON public.freelancers(user_id);
CREATE INDEX IF NOT EXISTS idx_gl_entries_account ON public.gl_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_gl_entries_date ON public.gl_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_grants_org ON public.grants(organization_id);

-- Enable RLS
ALTER TABLE public.etl_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_age_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_age_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_currency_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_seating ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga_floor_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
