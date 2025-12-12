-- Migration: Create missing tables (Batch 4 - Clock through Crew)
-- Tables: clock_events through crew_settlements

-- CLOCK EVENTS
CREATE TABLE IF NOT EXISTS public.clock_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    device_id TEXT,
    ip_address INET,
    notes TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CODE REGULATIONS
CREATE TABLE IF NOT EXISTS public.code_regulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jurisdiction TEXT NOT NULL,
    code_type TEXT NOT NULL,
    code_number TEXT,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    effective_date DATE,
    expiration_date DATE,
    source_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COI RENEWAL REQUESTS
CREATE TABLE IF NOT EXISTS public.coi_renewal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    reminder_count INTEGER DEFAULT 0,
    last_reminder_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPANY POLICIES
CREATE TABLE IF NOT EXISTS public.company_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    policy_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    version TEXT,
    effective_date DATE,
    review_date DATE,
    status TEXT DEFAULT 'draft',
    requires_acknowledgment BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTINGENCIES
CREATE TABLE IF NOT EXISTS public.contingencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    contingency_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    trigger_conditions TEXT,
    response_plan TEXT,
    resources_required JSONB DEFAULT '[]'::jsonb,
    estimated_cost DECIMAL(12,2),
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'identified',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTRACT NEGOTIATIONS
CREATE TABLE IF NOT EXISTS public.contract_negotiations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    negotiation_round INTEGER DEFAULT 1,
    proposed_by TEXT,
    proposed_terms JSONB DEFAULT '{}'::jsonb,
    counter_terms JSONB,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    conversation_type TEXT DEFAULT 'direct',
    title TEXT,
    participants UUID[],
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    is_archived BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREDENTIAL BADGES
CREATE TABLE IF NOT EXISTS public.credential_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    access_level TEXT,
    access_zones TEXT[],
    color TEXT,
    design_template TEXT,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    max_quantity INTEGER,
    issued_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREW CONNECTIONS
CREATE TABLE IF NOT EXISTS public.crew_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_type TEXT DEFAULT 'colleague',
    status TEXT DEFAULT 'pending',
    connected_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREW SETTLEMENTS
CREATE TABLE IF NOT EXISTS public.crew_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
    settlement_date DATE,
    base_pay DECIMAL(12,2) DEFAULT 0,
    overtime_pay DECIMAL(12,2) DEFAULT 0,
    per_diem DECIMAL(12,2) DEFAULT 0,
    travel_reimbursement DECIMAL(12,2) DEFAULT 0,
    equipment_rental DECIMAL(12,2) DEFAULT 0,
    deductions DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRON LOGS
CREATE TABLE IF NOT EXISTS public.cron_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running',
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- DEFERRED REVENUE
CREATE TABLE IF NOT EXISTS public.deferred_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    amount DECIMAL(14,2) NOT NULL,
    recognition_start_date DATE,
    recognition_end_date DATE,
    recognition_method TEXT DEFAULT 'straight_line',
    recognized_amount DECIMAL(14,2) DEFAULT 0,
    remaining_amount DECIMAL(14,2),
    status TEXT DEFAULT 'deferred',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERIES
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    delivery_type TEXT NOT NULL,
    origin_address JSONB,
    destination_address JSONB,
    scheduled_date TIMESTAMPTZ,
    actual_date TIMESTAMPTZ,
    carrier TEXT,
    tracking_number TEXT,
    status TEXT DEFAULT 'pending',
    special_instructions TEXT,
    signature_required BOOLEAN DEFAULT false,
    signed_by TEXT,
    proof_of_delivery_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENT SIGNERS
CREATE TABLE IF NOT EXISTS public.document_signers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    signer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    signer_email TEXT,
    signer_name TEXT,
    signing_order INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    signed_at TIMESTAMPTZ,
    signature_url TEXT,
    ip_address INET,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRONE FLIGHTS
CREATE TABLE IF NOT EXISTS public.drone_flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    pilot_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    drone_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    flight_date DATE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    flight_purpose TEXT,
    flight_area TEXT,
    max_altitude_feet INTEGER,
    weather_conditions TEXT,
    authorization_number TEXT,
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    relationship TEXT,
    phone_primary TEXT,
    phone_secondary TEXT,
    email TEXT,
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEE ACKNOWLEDGMENTS
CREATE TABLE IF NOT EXISTS public.employee_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    document_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    signature_url TEXT,
    version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEE CREDENTIALS
CREATE TABLE IF NOT EXISTS public.employee_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    credential_type TEXT NOT NULL,
    credential_name TEXT NOT NULL,
    issuing_authority TEXT,
    credential_number TEXT,
    issue_date DATE,
    expiration_date DATE,
    document_url TEXT,
    status TEXT DEFAULT 'active',
    verification_status TEXT DEFAULT 'pending',
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEE SKILLS
CREATE TABLE IF NOT EXISTS public.employee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_category TEXT,
    proficiency_level TEXT,
    years_experience DECIMAL(4,1),
    is_certified BOOLEAN DEFAULT false,
    certification_id UUID,
    last_used_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEE WORKFLOWS
CREATE TABLE IF NOT EXISTS public.employee_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    workflow_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checklist JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENCORES
CREATE TABLE IF NOT EXISTS public.encores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    encore_number INTEGER DEFAULT 1,
    planned_songs JSONB DEFAULT '[]'::jsonb,
    actual_songs JSONB DEFAULT '[]'::jsonb,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'assigned',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.equipment_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    certification_type TEXT NOT NULL,
    certification_number TEXT,
    issuing_authority TEXT,
    issue_date DATE,
    expiration_date DATE,
    document_url TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT FAVORITES
CREATE TABLE IF NOT EXISTS public.equipment_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, equipment_id)
);

-- EQUIPMENT MANUALS
CREATE TABLE IF NOT EXISTS public.equipment_manuals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    manual_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    version TEXT,
    language TEXT DEFAULT 'en',
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT RETURNS
CREATE TABLE IF NOT EXISTS public.equipment_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.equipment_assignments(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    returned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    return_date TIMESTAMPTZ DEFAULT NOW(),
    condition TEXT,
    condition_notes TEXT,
    damage_reported BOOLEAN DEFAULT false,
    damage_description TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT SPEC CORRECTIONS
CREATE TABLE IF NOT EXISTS public.equipment_spec_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT SPEC REQUESTS
CREATE TABLE IF NOT EXISTS public.equipment_spec_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_type TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    requested_specs JSONB DEFAULT '{}'::jsonb,
    reason TEXT,
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    fulfilled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT SPECS
CREATE TABLE IF NOT EXISTS public.equipment_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    spec_category TEXT NOT NULL,
    spec_name TEXT NOT NULL,
    spec_value TEXT,
    unit TEXT,
    is_verified BOOLEAN DEFAULT false,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUITY GRANTS
CREATE TABLE IF NOT EXISTS public.equity_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    grant_type TEXT NOT NULL,
    grant_date DATE NOT NULL,
    shares_granted INTEGER,
    strike_price DECIMAL(10,4),
    vesting_schedule JSONB,
    vesting_start_date DATE,
    cliff_months INTEGER,
    vesting_months INTEGER,
    shares_vested INTEGER DEFAULT 0,
    shares_exercised INTEGER DEFAULT 0,
    expiration_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clock_events_employee ON public.clock_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_clock_events_timestamp ON public.clock_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_crew_settlements_event ON public.crew_settlements(event_id);
CREATE INDEX IF NOT EXISTS idx_crew_settlements_crew ON public.crew_settlements(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_cron_logs_job ON public.cron_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_logs_started ON public.cron_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_deferred_revenue_org ON public.deferred_revenue(organization_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_employee ON public.emergency_contacts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_employee ON public.employee_credentials(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_employee ON public.employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_equipment ON public.equipment_assignments(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_specs_equipment ON public.equipment_specs(equipment_id);

-- Enable RLS
ALTER TABLE public.clock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coi_renewal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contingencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deferred_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_spec_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_spec_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_grants ENABLE ROW LEVEL SECURITY;
