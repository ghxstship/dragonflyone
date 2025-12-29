-- Migration: Create missing tables (Batch 16 - Signage through Sponsor)
-- Tables: signage_items through sponsor_tiers

-- SIGNAGE ITEMS
CREATE TABLE IF NOT EXISTS public.signage_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    sign_type TEXT NOT NULL,
    content TEXT,
    location TEXT,
    dimensions TEXT,
    material TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'planned',
    installed_at TIMESTAMPTZ,
    removed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SITE INSPECTIONS
CREATE TABLE IF NOT EXISTS public.site_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    inspection_type TEXT NOT NULL,
    inspection_date TIMESTAMPTZ,
    inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checklist JSONB DEFAULT '[]'::jsonb,
    findings JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    overall_rating TEXT,
    recommendations TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SITE VISITS
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    visit_date TIMESTAMPTZ,
    visit_type TEXT NOT NULL,
    attendees UUID[],
    purpose TEXT,
    notes TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKILL ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.skill_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL,
    assessor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assessment_date DATE,
    proficiency_level TEXT,
    score DECIMAL(5,2),
    notes TEXT,
    next_assessment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKILL CATEGORIES
CREATE TABLE IF NOT EXISTS public.skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.skill_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKILL ENDORSEMENTS
CREATE TABLE IF NOT EXISTS public.skill_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL,
    endorsed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endorsement_text TEXT,
    endorsed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_id, endorsed_by)
);

-- SKILL GAPS
CREATE TABLE IF NOT EXISTS public.skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    department TEXT,
    skill_id UUID NOT NULL,
    required_level TEXT,
    current_level TEXT,
    gap_severity TEXT DEFAULT 'medium',
    employees_affected INTEGER,
    training_plan_id UUID,
    status TEXT DEFAULT 'identified',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKILLS
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    category_id UUID REFERENCES public.skill_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    proficiency_levels JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLA METRICS
CREATE TABLE IF NOT EXISTS public.sla_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sla_id UUID NOT NULL,
    metric_date DATE NOT NULL,
    metric_type TEXT NOT NULL,
    target_value DECIMAL(10,4),
    actual_value DECIMAL(10,4),
    is_met BOOLEAN,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOCIAL CONNECTIONS
CREATE TABLE IF NOT EXISTS public.social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_id TEXT,
    username TEXT,
    profile_url TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    is_connected BOOLEAN DEFAULT true,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOCIAL LINKS
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    username TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOCIAL MEDIA ACCOUNTS
CREATE TABLE IF NOT EXISTS public.social_media_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    platform TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_id TEXT,
    profile_url TEXT,
    follower_count INTEGER,
    is_verified BOOLEAN DEFAULT false,
    access_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOCIAL MEDIA POSTS
CREATE TABLE IF NOT EXISTS public.social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.social_media_accounts(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    post_type TEXT NOT NULL,
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    external_post_id TEXT,
    external_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOCIAL POSTS
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    platform TEXT NOT NULL,
    post_type TEXT DEFAULT 'post',
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    hashtags TEXT[],
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    external_id TEXT,
    external_url TEXT,
    engagement JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOUND CHECKS
CREATE TABLE IF NOT EXISTS public.sound_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMPTZ,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    stage TEXT,
    engineer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    issues JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPACE ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.space_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    space_name TEXT NOT NULL,
    space_type TEXT NOT NULL,
    allocated_to TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    setup_requirements JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'allocated',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPEAKER ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.speaker_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    session_id UUID,
    speaker_id UUID NOT NULL,
    role TEXT DEFAULT 'speaker',
    presentation_title TEXT,
    presentation_duration_minutes INTEGER,
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPEAKER PROFILES
CREATE TABLE IF NOT EXISTS public.speaker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    headline TEXT,
    company TEXT,
    title TEXT,
    photo_url TEXT,
    topics TEXT[],
    languages TEXT[],
    social_links JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPECIAL EFFECTS
CREATE TABLE IF NOT EXISTS public.special_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    effect_type TEXT NOT NULL,
    description TEXT,
    location TEXT,
    cue_number TEXT,
    trigger_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    equipment_needed JSONB DEFAULT '[]'::jsonb,
    safety_requirements TEXT,
    operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPENDING LIMITS
CREATE TABLE IF NOT EXISTS public.spending_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    department TEXT,
    limit_type TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    period TEXT DEFAULT 'monthly',
    current_spent DECIMAL(12,2) DEFAULT 0,
    requires_approval_above DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR ACTIVATIONS
CREATE TABLE IF NOT EXISTS public.sponsor_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    activation_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    setup_requirements JSONB DEFAULT '{}'::jsonb,
    staff_needed INTEGER,
    budget DECIMAL(12,2),
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR ASSETS
CREATE TABLE IF NOT EXISTS public.sponsor_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID NOT NULL,
    asset_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    thumbnail_url TEXT,
    file_size INTEGER,
    dimensions TEXT,
    format TEXT,
    usage_rights TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR CONTACTS
CREATE TABLE IF NOT EXISTS public.sponsor_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID NOT NULL,
    contact_type TEXT DEFAULT 'primary',
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR DELIVERABLES
CREATE TABLE IF NOT EXISTS public.sponsor_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL,
    deliverable_type TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date DATE,
    completed_date DATE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR FULFILLMENT
CREATE TABLE IF NOT EXISTS public.sponsor_fulfillment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL,
    benefit_id UUID,
    benefit_description TEXT,
    quantity_promised INTEGER DEFAULT 1,
    quantity_delivered INTEGER DEFAULT 0,
    delivery_date DATE,
    proof_url TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR LEADS
CREATE TABLE IF NOT EXISTS public.sponsor_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    industry TEXT,
    estimated_value DECIMAL(14,2),
    source TEXT,
    status TEXT DEFAULT 'new',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR PACKAGES
CREATE TABLE IF NOT EXISTS public.sponsor_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    tier TEXT,
    price DECIMAL(14,2),
    benefits JSONB DEFAULT '[]'::jsonb,
    quantity_available INTEGER,
    quantity_sold INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR REPORTS
CREATE TABLE IF NOT EXISTS public.sponsor_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL,
    report_type TEXT NOT NULL,
    report_period_start DATE,
    report_period_end DATE,
    metrics JSONB DEFAULT '{}'::jsonb,
    highlights TEXT,
    file_url TEXT,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPONSOR TIERS
CREATE TABLE IF NOT EXISTS public.sponsor_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tier_level INTEGER,
    minimum_investment DECIMAL(14,2),
    maximum_investment DECIMAL(14,2),
    benefits JSONB DEFAULT '[]'::jsonb,
    color TEXT,
    logo_placement TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (conditionally - some tables may already exist with different schemas)
CREATE INDEX IF NOT EXISTS idx_signage_items_event ON public.signage_items(event_id);
CREATE INDEX IF NOT EXISTS idx_site_inspections_venue ON public.site_inspections(venue_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_venue ON public.site_visits(venue_id);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_employee ON public.skill_assessments(employee_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);
-- idx_social_connections_user handled in repair migration 0222
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_org ON public.social_media_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_account ON public.social_media_posts(account_id);
CREATE INDEX IF NOT EXISTS idx_sound_checks_event ON public.sound_checks(event_id);
CREATE INDEX IF NOT EXISTS idx_space_allocations_event ON public.space_allocations(event_id);
CREATE INDEX IF NOT EXISTS idx_speaker_assignments_event ON public.speaker_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_special_effects_event ON public.special_effects(event_id);
-- idx_sponsor_activations_event handled in repair migration 0222
-- idx_sponsor_deliverables_sponsorship handled in repair migration 0222
CREATE INDEX IF NOT EXISTS idx_sponsor_leads_org ON public.sponsor_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_packages_org ON public.sponsor_packages(organization_id);

-- Enable RLS
ALTER TABLE public.signage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaker_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_tiers ENABLE ROW LEVEL SECURITY;
