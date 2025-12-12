-- Migration: Create missing tables (Batch 14 - Rider through Schedule)
-- Tables: rider_items through schedules

-- RIDER ITEMS
CREATE TABLE IF NOT EXISTS public.rider_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    specifications TEXT,
    is_required BOOLEAN DEFAULT true,
    is_provided BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIDER NOTES
CREATE TABLE IF NOT EXISTS public.rider_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL,
    note_type TEXT DEFAULT 'general',
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIGGING CALCULATIONS
CREATE TABLE IF NOT EXISTS public.rigging_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rigging_plan_id UUID NOT NULL,
    point_id UUID,
    load_type TEXT NOT NULL,
    dead_load_lbs DECIMAL(10,2),
    live_load_lbs DECIMAL(10,2),
    total_load_lbs DECIMAL(10,2),
    safety_factor DECIMAL(4,2) DEFAULT 5,
    working_load_limit_lbs DECIMAL(10,2),
    hardware_specs JSONB DEFAULT '{}'::jsonb,
    calculated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIGGING PLANS
CREATE TABLE IF NOT EXISTS public.rigging_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    description TEXT,
    total_weight_lbs DECIMAL(12,2),
    points JSONB DEFAULT '[]'::jsonb,
    drawings JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIGGING POINTS
CREATE TABLE IF NOT EXISTS public.rigging_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.rigging_plans(id) ON DELETE CASCADE,
    point_number TEXT,
    point_type TEXT NOT NULL,
    location TEXT,
    x_position DECIMAL(10,4),
    y_position DECIMAL(10,4),
    z_position DECIMAL(10,4),
    capacity_lbs DECIMAL(10,2),
    load_lbs DECIMAL(10,2),
    hardware TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RISK ALERTS
CREATE TABLE IF NOT EXISTS public.risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',
    message TEXT,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RISK ASSESSMENT SCHEDULES
CREATE TABLE IF NOT EXISTS public.risk_assessment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    assessment_type TEXT NOT NULL,
    frequency TEXT NOT NULL,
    last_assessment_date DATE,
    next_assessment_date DATE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RISK MITIGATIONS
CREATE TABLE IF NOT EXISTS public.risk_mitigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id UUID NOT NULL,
    mitigation_type TEXT NOT NULL,
    description TEXT NOT NULL,
    implementation_date DATE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cost DECIMAL(12,2),
    effectiveness TEXT,
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RUN OF SHOW
CREATE TABLE IF NOT EXISTS public.run_of_show (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    entries JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAFETY BRIEFING ATTENDEES
CREATE TABLE IF NOT EXISTS public.safety_briefing_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    briefing_id UUID NOT NULL,
    attendee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    attendee_name TEXT,
    attendee_company TEXT,
    signed_at TIMESTAMPTZ,
    signature_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAFETY BRIEFINGS
CREATE TABLE IF NOT EXISTS public.safety_briefings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
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

-- SAFETY CHECKLISTS
CREATE TABLE IF NOT EXISTS public.safety_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    checklist_type TEXT NOT NULL,
    title TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    completed_items INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALARY DATA
CREATE TABLE IF NOT EXISTS public.salary_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    job_title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    salary_min DECIMAL(12,2),
    salary_mid DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    currency TEXT DEFAULT 'USD',
    effective_date DATE,
    source TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALES FORECASTS
CREATE TABLE IF NOT EXISTS public.sales_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    forecast_period DATE NOT NULL,
    category TEXT,
    product_id UUID,
    forecasted_units INTEGER,
    forecasted_revenue DECIMAL(14,2),
    actual_units INTEGER,
    actual_revenue DECIMAL(14,2),
    variance_units INTEGER,
    variance_revenue DECIMAL(14,2),
    confidence_level DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAVED JOBS
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, job_id)
);

-- SCENARIOS
CREATE TABLE IF NOT EXISTS public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    scenario_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    assumptions JSONB DEFAULT '{}'::jsonb,
    parameters JSONB DEFAULT '{}'::jsonb,
    results JSONB DEFAULT '{}'::jsonb,
    is_baseline BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULE ITEMS
CREATE TABLE IF NOT EXISTS public.schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL,
    item_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    location TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    dependencies UUID[],
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULE PHASES
CREATE TABLE IF NOT EXISTS public.schedule_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL,
    phase_name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    phase_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULE TASKS
CREATE TABLE IF NOT EXISTS public.schedule_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL,
    phase_id UUID REFERENCES public.schedule_phases(id) ON DELETE SET NULL,
    task_name TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    department TEXT,
    priority INTEGER DEFAULT 0,
    dependencies UUID[],
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULED MAINTENANCE
CREATE TABLE IF NOT EXISTS public.scheduled_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    frequency TEXT,
    last_performed_date DATE,
    next_due_date DATE,
    estimated_duration_hours DECIMAL(6,2),
    estimated_cost DECIMAL(10,2),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULED NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    notification_type TEXT NOT NULL,
    title TEXT,
    message TEXT,
    recipients JSONB DEFAULT '[]'::jsonb,
    channels TEXT[],
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULES
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    schedule_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    timezone TEXT DEFAULT 'UTC',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rider_items_rider ON public.rider_items(rider_id);
CREATE INDEX IF NOT EXISTS idx_rigging_plans_event ON public.rigging_plans(event_id);
CREATE INDEX IF NOT EXISTS idx_rigging_points_plan ON public.rigging_points(plan_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_risk ON public.risk_alerts(risk_id);
CREATE INDEX IF NOT EXISTS idx_run_of_show_event ON public.run_of_show(event_id);
CREATE INDEX IF NOT EXISTS idx_safety_briefings_event ON public.safety_briefings(event_id);
CREATE INDEX IF NOT EXISTS idx_safety_checklists_event ON public.safety_checklists(event_id);
CREATE INDEX IF NOT EXISTS idx_sales_forecasts_org ON public.sales_forecasts(organization_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_schedule ON public.schedule_items(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_schedule ON public.schedule_tasks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_maintenance_asset ON public.scheduled_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled ON public.scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_schedules_event ON public.schedules(event_id);

-- Enable RLS
ALTER TABLE public.rider_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rigging_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rigging_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rigging_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_mitigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_of_show ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_briefing_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
