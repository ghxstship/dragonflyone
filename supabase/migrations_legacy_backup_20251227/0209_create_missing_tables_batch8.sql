-- Migration: Create missing tables (Batch 8 - Local through Merch)
-- Tables: local_partners through merch_sales

-- LOCAL PARTNERS
CREATE TABLE IF NOT EXISTS public.local_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    partner_name TEXT NOT NULL,
    partner_type TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    description TEXT,
    services_offered TEXT[],
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOCAL PARTNERSHIPS
CREATE TABLE IF NOT EXISTS public.local_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.local_partners(id) ON DELETE CASCADE,
    partnership_type TEXT,
    start_date DATE,
    end_date DATE,
    terms TEXT,
    value DECIMAL(12,2),
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOGIN ATTEMPTS
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    failure_reason TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOST FOUND MATCHES
CREATE TABLE IF NOT EXISTS public.lost_found_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL,
    found_item_id UUID NOT NULL,
    match_score DECIMAL(5,2),
    match_reason TEXT,
    status TEXT DEFAULT 'pending',
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MAINTENANCE RECORDS
CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    cost DECIMAL(12,2),
    parts_used JSONB DEFAULT '[]'::jsonb,
    labor_hours DECIMAL(6,2),
    next_maintenance_date DATE,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MAINTENANCE WINDOWS
CREATE TABLE IF NOT EXISTS public.maintenance_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    affected_services TEXT[],
    notification_sent BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'scheduled',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MANUAL VIDEOS
CREATE TABLE IF NOT EXISTS public.manual_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    video_type TEXT DEFAULT 'tutorial',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MARKETPLACE OPPORTUNITIES
CREATE TABLE IF NOT EXISTS public.marketplace_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    opportunity_type TEXT NOT NULL,
    category TEXT,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    location TEXT,
    deadline DATE,
    requirements JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'open',
    posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA KIT ASSETS
CREATE TABLE IF NOT EXISTS public.media_kit_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_kit_id UUID NOT NULL,
    asset_type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INTEGER,
    dimensions TEXT,
    format TEXT,
    usage_rights TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA KITS
CREATE TABLE IF NOT EXISTS public.media_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    password TEXT,
    expires_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICAL INCIDENTS
CREATE TABLE IF NOT EXISTS public.medical_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    incident_time TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    patient_type TEXT,
    patient_name TEXT,
    patient_age INTEGER,
    chief_complaint TEXT,
    treatment_provided TEXT,
    disposition TEXT,
    transported_to TEXT,
    responding_staff TEXT[],
    severity TEXT DEFAULT 'minor',
    notes TEXT,
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICAL STAFF
CREATE TABLE IF NOT EXISTS public.medical_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    credentials TEXT[],
    license_number TEXT,
    license_state TEXT,
    shift_start TIMESTAMPTZ,
    shift_end TIMESTAMPTZ,
    station_id UUID,
    contact_phone TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICAL STATIONS
CREATE TABLE IF NOT EXISTS public.medical_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    station_name TEXT NOT NULL,
    location TEXT,
    station_type TEXT DEFAULT 'first_aid',
    equipment JSONB DEFAULT '[]'::jsonb,
    supplies JSONB DEFAULT '[]'::jsonb,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT true,
    coordinates JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEETING AGENDA ITEMS
CREATE TABLE IF NOT EXISTS public.meeting_agenda_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    presenter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    duration_minutes INTEGER,
    item_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEETING MINUTES
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL,
    content TEXT,
    decisions JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    attendees UUID[],
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEETINGS
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    meeting_type TEXT DEFAULT 'general',
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    location TEXT,
    virtual_link TEXT,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    attendees UUID[],
    status TEXT DEFAULT 'scheduled',
    recurrence_rule TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEMBER BENEFITS
CREATE TABLE IF NOT EXISTS public.member_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    membership_tier TEXT,
    benefit_name TEXT NOT NULL,
    description TEXT,
    benefit_type TEXT,
    value DECIMAL(10,2),
    redemption_limit INTEGER,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEMORY BOOKS
CREATE TABLE IF NOT EXISTS public.memory_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    cover_image_url TEXT,
    pages JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MERCH BOOTHS
CREATE TABLE IF NOT EXISTS public.merch_booths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    booth_name TEXT NOT NULL,
    location TEXT,
    booth_type TEXT DEFAULT 'general',
    operator TEXT,
    setup_time TIMESTAMPTZ,
    open_time TIMESTAMPTZ,
    close_time TIMESTAMPTZ,
    payment_methods TEXT[],
    status TEXT DEFAULT 'planned',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MERCH INVENTORY
CREATE TABLE IF NOT EXISTS public.merch_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    booth_id UUID REFERENCES public.merch_booths(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    size TEXT,
    color TEXT,
    quantity_start INTEGER DEFAULT 0,
    quantity_sold INTEGER DEFAULT 0,
    quantity_remaining INTEGER DEFAULT 0,
    quantity_damaged INTEGER DEFAULT 0,
    last_counted_at TIMESTAMPTZ,
    counted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MERCH ITEMS
CREATE TABLE IF NOT EXISTS public.merch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sku TEXT,
    base_price DECIMAL(10,2),
    cost DECIMAL(10,2),
    sizes TEXT[],
    colors TEXT[],
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MERCH SALES
CREATE TABLE IF NOT EXISTS public.merch_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    booth_id UUID REFERENCES public.merch_booths(id) ON DELETE SET NULL,
    item_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    payment_method TEXT,
    transaction_id TEXT,
    sold_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sold_at TIMESTAMPTZ DEFAULT NOW(),
    size TEXT,
    color TEXT,
    notes TEXT
);

-- METRICS
CREATE TABLE IF NOT EXISTS public.metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    metric_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    value DECIMAL(18,4),
    unit TEXT,
    dimensions JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MODULE COMPLETIONS
CREATE TABLE IF NOT EXISTS public.module_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    score INTEGER,
    passed BOOLEAN,
    attempts INTEGER DEFAULT 1,
    time_spent_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MUSIC CONNECTIONS
CREATE TABLE IF NOT EXISTS public.music_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_id TEXT,
    profile_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    follower_count INTEGER,
    monthly_listeners INTEGER,
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_local_partners_org ON public.local_partners(organization_id);
CREATE INDEX IF NOT EXISTS idx_local_partnerships_event ON public.local_partnerships(event_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_asset ON public.maintenance_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_equipment ON public.maintenance_records(equipment_id);
CREATE INDEX IF NOT EXISTS idx_media_kits_event ON public.media_kits(event_id);
CREATE INDEX IF NOT EXISTS idx_medical_incidents_event ON public.medical_incidents(event_id);
CREATE INDEX IF NOT EXISTS idx_meetings_org ON public.meetings(organization_id);
CREATE INDEX IF NOT EXISTS idx_merch_inventory_item ON public.merch_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_merch_sales_event ON public.merch_sales(event_id);
CREATE INDEX IF NOT EXISTS idx_metrics_org ON public.metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON public.metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_module_completions_user ON public.module_completions(user_id);

-- Enable RLS
ALTER TABLE public.local_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_kit_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_connections ENABLE ROW LEVEL SECURITY;
