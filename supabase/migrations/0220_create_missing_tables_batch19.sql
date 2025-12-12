-- Migration: Create missing tables (Batch 19 - Time through User)
-- Tables: time_entries through user_wallets

-- TIME ENTRIES
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    description TEXT,
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10,2),
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIME OFF BALANCES
CREATE TABLE IF NOT EXISTS public.time_off_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    accrued_hours DECIMAL(8,2) DEFAULT 0,
    used_hours DECIMAL(8,2) DEFAULT 0,
    pending_hours DECIMAL(8,2) DEFAULT 0,
    available_hours DECIMAL(8,2) DEFAULT 0,
    carryover_hours DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, leave_type, year)
);

-- TIME OFF POLICIES
CREATE TABLE IF NOT EXISTS public.time_off_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    leave_type TEXT NOT NULL,
    accrual_rate DECIMAL(8,4),
    accrual_frequency TEXT,
    max_balance DECIMAL(8,2),
    carryover_limit DECIMAL(8,2),
    waiting_period_days INTEGER DEFAULT 0,
    is_paid BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIME OFF REQUESTS
CREATE TABLE IF NOT EXISTS public.time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_requested DECIMAL(8,2),
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIMESHEETS
CREATE TABLE IF NOT EXISTS public.timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_hours DECIMAL(8,2) DEFAULT 0,
    billable_hours DECIMAL(8,2) DEFAULT 0,
    status TEXT DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TOUR DATES
CREATE TABLE IF NOT EXISTS public.tour_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    city TEXT,
    country TEXT,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TOUR LEGS
CREATE TABLE IF NOT EXISTS public.tour_legs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID NOT NULL,
    leg_name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    region TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TOURS
CREATE TABLE IF NOT EXISTS public.tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    tour_name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'planning',
    budget DECIMAL(14,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAINING COMPLETIONS
CREATE TABLE IF NOT EXISTS public.training_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    training_id UUID NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    score DECIMAL(5,2),
    passed BOOLEAN,
    certificate_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAINING PROGRAMS
CREATE TABLE IF NOT EXISTS public.training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    program_type TEXT,
    duration_hours DECIMAL(6,2),
    is_required BOOLEAN DEFAULT false,
    passing_score DECIMAL(5,2),
    validity_months INTEGER,
    content JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAINING SESSIONS
CREATE TABLE IF NOT EXISTS public.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
    session_name TEXT,
    scheduled_date TIMESTAMPTZ,
    location TEXT,
    virtual_link TEXT,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    max_participants INTEGER,
    enrolled_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTION FEES
CREATE TABLE IF NOT EXISTS public.transaction_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    fee_type TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    percentage DECIMAL(8,6),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    reference_type TEXT,
    reference_id UUID,
    payment_method TEXT,
    payment_provider TEXT,
    external_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSFER REQUESTS
CREATE TABLE IF NOT EXISTS public.transfer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    from_department TEXT,
    to_department TEXT,
    from_location TEXT,
    to_location TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    requested_date DATE,
    effective_date DATE,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSLATIONS
CREATE TABLE IF NOT EXISTS public.translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    field_name TEXT NOT NULL,
    language_code TEXT NOT NULL,
    translated_value TEXT,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, field_name, language_code)
);

-- TRANSPORTATION BOOKINGS
CREATE TABLE IF NOT EXISTS public.transportation_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    booking_type TEXT NOT NULL,
    provider TEXT,
    vehicle_type TEXT,
    pickup_location TEXT,
    dropoff_location TEXT,
    pickup_time TIMESTAMPTZ,
    passenger_count INTEGER,
    passenger_names TEXT[],
    confirmation_number TEXT,
    cost DECIMAL(10,2),
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAVEL BOOKINGS
CREATE TABLE IF NOT EXISTS public.travel_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    traveler_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_type TEXT NOT NULL,
    provider TEXT,
    confirmation_number TEXT,
    departure_date TIMESTAMPTZ,
    return_date TIMESTAMPTZ,
    origin TEXT,
    destination TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    cost DECIMAL(12,2),
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAVEL ITINERARIES
CREATE TABLE IF NOT EXISTS public.travel_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    traveler_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    itinerary_name TEXT,
    segments JSONB DEFAULT '[]'::jsonb,
    total_cost DECIMAL(12,2),
    status TEXT DEFAULT 'draft',
    shared_with UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAVEL POLICIES
CREATE TABLE IF NOT EXISTS public.travel_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    flight_class TEXT,
    hotel_max_rate DECIMAL(10,2),
    per_diem_rate DECIMAL(10,2),
    advance_booking_days INTEGER,
    approval_required_above DECIMAL(10,2),
    preferred_vendors JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAVEL REQUESTS
CREATE TABLE IF NOT EXISTS public.travel_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    purpose TEXT,
    destination TEXT,
    departure_date DATE,
    return_date DATE,
    estimated_cost DECIMAL(12,2),
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TREND ANALYSES
CREATE TABLE IF NOT EXISTS public.trend_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    analysis_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    period_start DATE,
    period_end DATE,
    data_points JSONB DEFAULT '[]'::jsonb,
    trend_direction TEXT,
    trend_percentage DECIMAL(8,4),
    insights JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRUCK MANIFESTS
CREATE TABLE IF NOT EXISTS public.truck_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    truck_number INTEGER,
    truck_type TEXT,
    carrier TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    license_plate TEXT,
    departure_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    origin TEXT,
    destination TEXT,
    contents JSONB DEFAULT '[]'::jsonb,
    weight_lbs DECIMAL(10,2),
    seal_number TEXT,
    status TEXT DEFAULT 'loading',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNION AGREEMENTS
CREATE TABLE IF NOT EXISTS public.union_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    union_name TEXT NOT NULL,
    local_number TEXT,
    agreement_type TEXT,
    start_date DATE,
    end_date DATE,
    terms JSONB DEFAULT '{}'::jsonb,
    wage_scales JSONB DEFAULT '[]'::jsonb,
    work_rules TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNION CALLS
CREATE TABLE IF NOT EXISTS public.union_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    union_id UUID,
    call_type TEXT NOT NULL,
    call_date DATE,
    call_time TIME,
    headcount INTEGER,
    department TEXT,
    rate_type TEXT,
    hourly_rate DECIMAL(10,2),
    estimated_hours DECIMAL(6,2),
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPCOMING RELEASES
CREATE TABLE IF NOT EXISTS public.upcoming_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    release_type TEXT NOT NULL,
    title TEXT NOT NULL,
    release_date DATE,
    description TEXT,
    artwork_url TEXT,
    pre_save_url TEXT,
    platforms JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'announced',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    progress JSONB DEFAULT '{}'::jsonb,
    is_displayed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER ACTIVITY
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER BADGES
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    awarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    is_displayed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER CONNECTIONS
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_type TEXT DEFAULT 'follow',
    status TEXT DEFAULT 'active',
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, connected_user_id, connection_type)
);

-- USER DEVICES
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_type TEXT NOT NULL,
    device_name TEXT,
    device_id TEXT,
    push_token TEXT,
    platform TEXT,
    os_version TEXT,
    app_version TEXT,
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER FEEDBACK
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    feedback_type TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    rating INTEGER,
    page_url TEXT,
    screenshot_url TEXT,
    status TEXT DEFAULT 'new',
    responded_at TIMESTAMPTZ,
    response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER INTERESTS
CREATE TABLE IF NOT EXISTS public.user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interest_type TEXT NOT NULL,
    interest_value TEXT NOT NULL,
    weight DECIMAL(5,4) DEFAULT 1,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER LOCATIONS
CREATE TABLE IF NOT EXISTS public.user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    location_type TEXT DEFAULT 'current',
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    timezone TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}'::jsonb,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER POINTS
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze',
    tier_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'system',
    language TEXT DEFAULT 'en',
    timezone TEXT,
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_format TEXT DEFAULT '12h',
    currency TEXT DEFAULT 'USD',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER REWARDS
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    points_spent INTEGER,
    status TEXT DEFAULT 'redeemed',
    fulfillment_status TEXT DEFAULT 'pending',
    fulfilled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER SESSIONS
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- USER SKILLS
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT,
    years_experience DECIMAL(4,1),
    is_primary BOOLEAN DEFAULT false,
    endorsement_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- USER WALLETS
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(14,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (with conditional checks for existing tables with different schemas)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_time_entries_user ON public.time_entries(user_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'project_id') THEN
        CREATE INDEX IF NOT EXISTS idx_time_entries_project ON public.time_entries(project_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_time_off_balances_employee ON public.time_off_balances(employee_id);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'time_off_requests' AND column_name = 'employee_id') THEN
        CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee ON public.time_off_requests(employee_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'timesheets' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_timesheets_user ON public.timesheets(user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tour_dates_tour ON public.tour_dates(tour_id);
CREATE INDEX IF NOT EXISTS idx_tours_artist ON public.tours(artist_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_user ON public.training_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_program ON public.training_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org ON public.transactions(organization_id);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'travel_bookings' AND column_name = 'event_id') THEN
        CREATE INDEX IF NOT EXISTS idx_travel_bookings_event ON public.travel_bookings(event_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_travel_requests_requester ON public.travel_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_truck_manifests_event ON public.truck_manifests(event_id);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_activity' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_activity_user ON public.user_activity(user_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_connections' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_connections_user ON public.user_connections(user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_sessions' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skills(user_id);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truck_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.union_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.union_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upcoming_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
