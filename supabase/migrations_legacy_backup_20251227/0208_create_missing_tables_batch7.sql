-- Migration: Create missing tables (Batch 7 - IOT through Load)
-- Tables: iot_alerts through load_schedules

-- IOT ALERTS
CREATE TABLE IF NOT EXISTS public.iot_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    message TEXT,
    threshold_value DECIMAL(18,4),
    actual_value DECIMAL(18,4),
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- IOT AUTOMATIONS
CREATE TABLE IF NOT EXISTS public.iot_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    trigger_conditions JSONB DEFAULT '{}'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IOT COMMANDS
CREATE TABLE IF NOT EXISTS public.iot_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    command_type TEXT NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    response JSONB,
    error_message TEXT,
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IOT DEVICES
CREATE TABLE IF NOT EXISTS public.iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    serial_number TEXT,
    mac_address TEXT,
    ip_address INET,
    firmware_version TEXT,
    location TEXT,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'offline',
    last_seen_at TIMESTAMPTZ,
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IOT READINGS
CREATE TABLE IF NOT EXISTS public.iot_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL,
    reading_type TEXT NOT NULL,
    value DECIMAL(18,4),
    unit TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    quality TEXT DEFAULT 'good',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ISSUE COMMENTS
CREATE TABLE IF NOT EXISTS public.issue_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_name TEXT,
    applicant_email TEXT,
    applicant_phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'submitted',
    source TEXT,
    referral_id UUID,
    screening_score INTEGER,
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOB COSTS
CREATE TABLE IF NOT EXISTS public.job_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    cost_category TEXT NOT NULL,
    description TEXT,
    budgeted_amount DECIMAL(12,2),
    actual_amount DECIMAL(12,2),
    variance DECIMAL(12,2),
    cost_date DATE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KB ARTICLE FEEDBACK
CREATE TABLE IF NOT EXISTS public.kb_article_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_helpful BOOLEAN,
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KB ARTICLE VERSIONS
CREATE TABLE IF NOT EXISTS public.kb_article_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    change_summary TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KB ARTICLES
CREATE TABLE IF NOT EXISTS public.kb_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    category_id UUID,
    title TEXT NOT NULL,
    slug TEXT,
    content TEXT,
    summary TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KB CATEGORIES
CREATE TABLE IF NOT EXISTS public.kb_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    parent_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KEY POSITIONS
CREATE TABLE IF NOT EXISTS public.key_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    position_title TEXT NOT NULL,
    department TEXT,
    description TEXT,
    criticality_level TEXT DEFAULT 'medium',
    current_holder_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    succession_plan_id UUID,
    risk_assessment TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KNOWLEDGE DOCUMENTS
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    document_type TEXT,
    category TEXT,
    tags TEXT[],
    file_url TEXT,
    is_public BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LABOR VIOLATIONS
CREATE TABLE IF NOT EXISTS public.labor_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    violation_type TEXT NOT NULL,
    violation_date DATE,
    description TEXT,
    severity TEXT DEFAULT 'minor',
    corrective_action TEXT,
    resolution_date DATE,
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LANGUAGES
CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    native_name TEXT,
    is_rtl BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEAD SCORING RULES
CREATE TABLE IF NOT EXISTS public.lead_scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB DEFAULT '{}'::jsonb,
    score_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEADS
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    title TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    score INTEGER DEFAULT 0,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    converted_to_contact_id UUID,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEARNING MODULES
CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    path_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    duration_minutes INTEGER,
    module_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    passing_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEARNING PATHS
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty_level TEXT,
    estimated_hours DECIMAL(6,2),
    is_published BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIGHTING FOCUS
CREATE TABLE IF NOT EXISTS public.lighting_focus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    fixture_id UUID,
    fixture_number INTEGER,
    position TEXT,
    focus_target TEXT,
    color TEXT,
    gobo TEXT,
    intensity INTEGER,
    pan DECIMAL(6,2),
    tilt DECIMAL(6,2),
    notes TEXT,
    focused_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    focused_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIMITED RELEASE PURCHASES
CREATE TABLE IF NOT EXISTS public.limited_release_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    purchase_price DECIMAL(12,2),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'completed'
);

-- LIMITED RELEASES
CREATE TABLE IF NOT EXISTS public.limited_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    release_type TEXT NOT NULL,
    total_quantity INTEGER,
    remaining_quantity INTEGER,
    price DECIMAL(12,2),
    release_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    max_per_customer INTEGER,
    status TEXT DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LISTING AGGREGATORS
CREATE TABLE IF NOT EXISTS public.listing_aggregators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    supported_event_types TEXT[],
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIVE SHOW STATUS
CREATE TABLE IF NOT EXISTS public.live_show_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pre_show',
    current_act TEXT,
    current_song TEXT,
    set_start_time TIMESTAMPTZ,
    estimated_end_time TIMESTAMPTZ,
    delay_minutes INTEGER DEFAULT 0,
    notes TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOAD OUT SCHEDULES
CREATE TABLE IF NOT EXISTS public.load_out_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOAD OUT TASKS
CREATE TABLE IF NOT EXISTS public.load_out_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.load_out_schedules(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 0,
    estimated_duration_minutes INTEGER,
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOAD OUT TRUCKS
CREATE TABLE IF NOT EXISTS public.load_out_trucks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.load_out_schedules(id) ON DELETE CASCADE,
    truck_number INTEGER,
    truck_type TEXT,
    carrier TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    license_plate TEXT,
    arrival_time TIMESTAMPTZ,
    departure_time TIMESTAMPTZ,
    destination TEXT,
    contents JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOAD SCHEDULE TASKS
CREATE TABLE IF NOT EXISTS public.load_schedule_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL,
    task_name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    dependencies UUID[],
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOAD SCHEDULES
CREATE TABLE IF NOT EXISTS public.load_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    schedule_type TEXT DEFAULT 'load_in',
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_iot_alerts_device ON public.iot_alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_org ON public.iot_devices(organization_id);
CREATE INDEX IF NOT EXISTS idx_iot_readings_device ON public.iot_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_readings_timestamp ON public.iot_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue ON public.issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_costs_project ON public.job_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON public.kb_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON public.kb_articles(status);
CREATE INDEX IF NOT EXISTS idx_leads_org ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_live_show_status_event ON public.live_show_status(event_id);
CREATE INDEX IF NOT EXISTS idx_load_schedules_event ON public.load_schedules(event_id);

-- Enable RLS
ALTER TABLE public.iot_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighting_focus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.limited_release_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.limited_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_aggregators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_show_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_out_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_out_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_out_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_schedule_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_schedules ENABLE ROW LEVEL SECURITY;
