-- Migration: Create missing tables (Batch 18 - Sustainability through Ticket)
-- Tables: sustainability_initiatives through ticket_waitlist

-- SUSTAINABILITY INITIATIVES
CREATE TABLE IF NOT EXISTS public.sustainability_initiatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    initiative_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    goals JSONB DEFAULT '[]'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    status TEXT DEFAULT 'planned',
    impact_report TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYNC LOGS
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL,
    source TEXT,
    destination TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running',
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    details JSONB DEFAULT '{}'::jsonb
);

-- SYSTEM ALERTS
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT,
    source TEXT,
    affected_services TEXT[],
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- SYSTEM CONFIGURATIONS
CREATE TABLE IF NOT EXISTS public.system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYSTEM HEALTH CHECKS
CREATE TABLE IF NOT EXISTS public.system_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    check_type TEXT NOT NULL,
    status TEXT NOT NULL,
    response_time_ms INTEGER,
    details JSONB DEFAULT '{}'::jsonb,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYSTEM LOGS
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_level TEXT NOT NULL,
    service TEXT,
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TALENT POOLS
CREATE TABLE IF NOT EXISTS public.talent_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    criteria JSONB DEFAULT '{}'::jsonb,
    member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'assignee',
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK CHECKLISTS
CREATE TABLE IF NOT EXISTS public.task_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    title TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    completed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK COMMENTS
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK DEPENDENCIES
CREATE TABLE IF NOT EXISTS public.task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    depends_on_task_id UUID NOT NULL,
    dependency_type TEXT DEFAULT 'finish_to_start',
    lag_hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id)
);

-- TASK LABELS
CREATE TABLE IF NOT EXISTS public.task_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK TEMPLATES
CREATE TABLE IF NOT EXISTS public.task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    estimated_hours DECIMAL(8,2),
    priority TEXT DEFAULT 'medium',
    checklist JSONB DEFAULT '[]'::jsonb,
    labels TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK TIME ENTRIES
CREATE TABLE IF NOT EXISTS public.task_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    description TEXT,
    is_billable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    labels TEXT[],
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAX CALCULATIONS
CREATE TABLE IF NOT EXISTS public.tax_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    tax_type TEXT NOT NULL,
    jurisdiction TEXT,
    taxable_amount DECIMAL(14,2),
    tax_rate DECIMAL(8,6),
    tax_amount DECIMAL(14,2),
    is_exempt BOOLEAN DEFAULT false,
    exemption_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAX EXEMPTIONS
CREATE TABLE IF NOT EXISTS public.tax_exemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    customer_id UUID,
    exemption_type TEXT NOT NULL,
    certificate_number TEXT,
    issuing_authority TEXT,
    valid_from DATE,
    valid_until DATE,
    document_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAX RATES
CREATE TABLE IF NOT EXISTS public.tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name TEXT NOT NULL,
    rate DECIMAL(8,6) NOT NULL,
    tax_type TEXT NOT NULL,
    jurisdiction TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    postal_code TEXT,
    is_compound BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEAM AVAILABILITY
CREATE TABLE IF NOT EXISTS public.team_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    available_from TIME,
    available_until TIME,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    team_type TEXT DEFAULT 'general',
    lead_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parent_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TECHNICAL REQUIREMENTS
CREATE TABLE IF NOT EXISTS public.technical_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    requirement_type TEXT NOT NULL,
    category TEXT,
    description TEXT NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb,
    quantity INTEGER DEFAULT 1,
    is_provided BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEMPLATE CATEGORIES
CREATE TABLE IF NOT EXISTS public.template_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    category_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
    template_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    variables JSONB DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    use_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TERMINATION RECORDS
CREATE TABLE IF NOT EXISTS public.termination_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    termination_type TEXT NOT NULL,
    termination_date DATE NOT NULL,
    last_work_date DATE,
    reason TEXT,
    exit_interview_conducted BOOLEAN DEFAULT false,
    exit_interview_notes TEXT,
    final_pay_date DATE,
    severance_amount DECIMAL(12,2),
    is_rehirable BOOLEAN,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    author_name TEXT NOT NULL,
    author_title TEXT,
    author_company TEXT,
    author_photo_url TEXT,
    content TEXT NOT NULL,
    rating INTEGER,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET ADDONS
CREATE TABLE IF NOT EXISTS public.ticket_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity_available INTEGER,
    quantity_sold INTEGER DEFAULT 0,
    max_per_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.ticket_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    allocation_type TEXT NOT NULL,
    allocated_to TEXT,
    quantity INTEGER NOT NULL,
    used_quantity INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET BUNDLES
CREATE TABLE IF NOT EXISTS public.ticket_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    bundle_price DECIMAL(12,2) NOT NULL,
    individual_price_total DECIMAL(12,2),
    savings_amount DECIMAL(12,2),
    ticket_types JSONB DEFAULT '[]'::jsonb,
    quantity_available INTEGER,
    quantity_sold INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET HOLDS
CREATE TABLE IF NOT EXISTS public.ticket_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    hold_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    held_by TEXT,
    reason TEXT,
    release_date TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET PRICE HISTORY
CREATE TABLE IF NOT EXISTS public.ticket_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_reason TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET RELEASES
CREATE TABLE IF NOT EXISTS public.ticket_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    release_type TEXT DEFAULT 'general',
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    ticket_types JSONB DEFAULT '[]'::jsonb,
    access_code TEXT,
    max_tickets_per_order INTEGER,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET RESALES
CREATE TABLE IF NOT EXISTS public.ticket_resales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    listing_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    platform_fee DECIMAL(10,2),
    seller_payout DECIMAL(10,2),
    listed_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    status TEXT DEFAULT 'listed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TICKET SCANS
CREATE TABLE IF NOT EXISTS public.ticket_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL,
    scan_result TEXT NOT NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location TEXT,
    device_id TEXT,
    notes TEXT
);

-- TICKET TRANSFERS
CREATE TABLE IF NOT EXISTS public.ticket_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    to_email TEXT,
    transfer_type TEXT DEFAULT 'gift',
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    notes TEXT
);

-- TICKET UPGRADES
CREATE TABLE IF NOT EXISTS public.ticket_upgrades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    new_ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    from_ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE SET NULL,
    to_ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE SET NULL,
    price_difference DECIMAL(10,2),
    upgraded_at TIMESTAMPTZ DEFAULT NOW(),
    upgraded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT
);

-- TICKET WAITLIST
CREATE TABLE IF NOT EXISTS public.ticket_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    quantity_requested INTEGER DEFAULT 1,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    notified_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'waiting',
    position INTEGER
);

-- Create indexes (with conditional checks for existing tables with different schemas)
CREATE INDEX IF NOT EXISTS idx_sustainability_initiatives_org ON public.sustainability_initiatives(organization_id);

-- Conditional index for sync_logs (may have different schema)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sync_logs' AND column_name = 'sync_type') THEN
        CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON public.sync_logs(sync_type);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON public.system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_talent_pools_org ON public.talent_pools(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);

-- Conditional indexes for tasks (may have different schema)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'project_id') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'assigned_to') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
    END IF;
END $$;

-- Conditional indexes for team_members and teams (may have different schema)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'team_id') THEN
        CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'organization_id') THEN
        CREATE INDEX IF NOT EXISTS idx_teams_org ON public.teams(organization_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_technical_requirements_event ON public.technical_requirements(event_id);
CREATE INDEX IF NOT EXISTS idx_templates_org ON public.templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_termination_records_employee ON public.termination_records(employee_id);

-- Conditional indexes for ticket tables (may have different schema)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ticket_addons' AND column_name = 'event_id') THEN
        CREATE INDEX IF NOT EXISTS idx_ticket_addons_event ON public.ticket_addons(event_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ticket_allocations_event ON public.ticket_allocations(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_holds_event ON public.ticket_holds(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_releases_event ON public.ticket_releases(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_scans_ticket ON public.ticket_scans(ticket_id);

-- Conditional index for ticket_transfers (may have different schema)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ticket_transfers' AND column_name = 'ticket_id') THEN
        CREATE INDEX IF NOT EXISTS idx_ticket_transfers_ticket ON public.ticket_transfers(ticket_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ticket_waitlist_event ON public.ticket_waitlist(event_id);

-- Enable RLS
ALTER TABLE public.sustainability_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.termination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_resales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_waitlist ENABLE ROW LEVEL SECURITY;
