-- Migration: Create missing tables (Batch 13 - Rate through RFQ)
-- Tables: rate_cards through rfqs

-- RATE CARDS
CREATE TABLE IF NOT EXISTS public.rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    rate_type TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    rates JSONB DEFAULT '[]'::jsonb,
    effective_from DATE,
    effective_until DATE,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RATING AGGREGATES
CREATE TABLE IF NOT EXISTS public.rating_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    rating_distribution JSONB DEFAULT '{}'::jsonb,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- RECEIPT DELIVERIES
CREATE TABLE IF NOT EXISTS public.receipt_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL,
    delivery_method TEXT NOT NULL,
    recipient TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECEIPTS
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    receipt_number TEXT UNIQUE,
    receipt_date TIMESTAMPTZ DEFAULT NOW(),
    amount DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    tax_details JSONB DEFAULT '{}'::jsonb,
    customer_info JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECONCILIATION LOGS
CREATE TABLE IF NOT EXISTS public.reconciliation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_id UUID NOT NULL,
    log_type TEXT NOT NULL,
    message TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REFERRAL PROGRAM SETTINGS
CREATE TABLE IF NOT EXISTS public.referral_program_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    referrer_reward_type TEXT DEFAULT 'credit',
    referrer_reward_value DECIMAL(10,2),
    referee_reward_type TEXT DEFAULT 'discount',
    referee_reward_value DECIMAL(10,2),
    minimum_purchase DECIMAL(10,2),
    expiration_days INTEGER,
    terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REFUNDS
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    refund_number TEXT UNIQUE,
    refund_date TIMESTAMPTZ DEFAULT NOW(),
    amount DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    reason TEXT,
    refund_method TEXT,
    status TEXT DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REHEARSAL NOTES
CREATE TABLE IF NOT EXISTS public.rehearsal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    rehearsal_date DATE,
    session_type TEXT,
    attendees UUID[],
    notes TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    issues JSONB DEFAULT '[]'::jsonb,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REHIRE NOTES
CREATE TABLE IF NOT EXISTS public.rehire_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    is_rehirable BOOLEAN DEFAULT true,
    reason TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RELATED EVENTS
CREATE TABLE IF NOT EXISTS public.related_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    related_event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, related_event_id)
);

-- RELEASE NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.release_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RENTAL BOOKINGS
CREATE TABLE IF NOT EXISTS public.rental_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    customer_id UUID,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    booking_number TEXT UNIQUE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    quantity INTEGER DEFAULT 1,
    daily_rate DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    deposit_amount DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    pickup_location TEXT,
    return_location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RENTAL EQUIPMENT
CREATE TABLE IF NOT EXISTS public.rental_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    is_available_for_rent BOOLEAN DEFAULT true,
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    deposit_required DECIMAL(10,2),
    minimum_rental_days INTEGER DEFAULT 1,
    maximum_rental_days INTEGER,
    delivery_available BOOLEAN DEFAULT false,
    delivery_fee DECIMAL(10,2),
    terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPORT EXECUTIONS
CREATE TABLE IF NOT EXISTS public.report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL,
    executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running',
    row_count INTEGER,
    file_url TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REQUIREMENT ITEMS
CREATE TABLE IF NOT EXISTS public.requirement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL,
    item_type TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESOURCE ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.resource_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    allocated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    allocation_percentage DECIMAL(5,2) DEFAULT 100,
    status TEXT DEFAULT 'allocated',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESTORATION ITEMS
CREATE TABLE IF NOT EXISTS public.restoration_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restoration_id UUID NOT NULL,
    item_description TEXT NOT NULL,
    location TEXT,
    before_photo_url TEXT,
    after_photo_url TEXT,
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESUMES
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    summary TEXT,
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    skills TEXT[],
    certifications JSONB DEFAULT '[]'::jsonb,
    file_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RETAINER TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.retainer_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retainer_id UUID NOT NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    balance_after DECIMAL(12,2),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RETAINERS
CREATE TABLE IF NOT EXISTS public.retainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    client_id UUID NOT NULL,
    retainer_amount DECIMAL(12,2) NOT NULL,
    current_balance DECIMAL(12,2) DEFAULT 0,
    billing_frequency TEXT DEFAULT 'monthly',
    start_date DATE,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RETROSPECTIVES
CREATE TABLE IF NOT EXISTS public.retrospectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    retrospective_date DATE,
    facilitator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    participants UUID[],
    what_went_well JSONB DEFAULT '[]'::jsonb,
    what_could_improve JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVENUE RECOGNITION RULES
CREATE TABLE IF NOT EXISTS public.revenue_recognition_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    rule_name TEXT NOT NULL,
    description TEXT,
    recognition_method TEXT NOT NULL,
    conditions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVENUE RECOGNITION SCHEDULE
CREATE TABLE IF NOT EXISTS public.revenue_recognition_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    recognition_date DATE NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    is_recognized BOOLEAN DEFAULT false,
    recognized_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVENUE RECOGNITIONS
CREATE TABLE IF NOT EXISTS public.revenue_recognitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    schedule_id UUID REFERENCES public.revenue_recognition_schedule(id) ON DELETE CASCADE,
    recognition_date DATE NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    gl_entry_id UUID,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REWARD TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID,
    transaction_type TEXT NOT NULL,
    points INTEGER,
    amount DECIMAL(10,2),
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    balance_after INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REWARDS
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    reward_name TEXT NOT NULL,
    description TEXT,
    reward_type TEXT NOT NULL,
    points_required INTEGER,
    value DECIMAL(10,2),
    quantity_available INTEGER,
    quantity_redeemed INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    terms TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REWARDS CATALOG
CREATE TABLE IF NOT EXISTS public.rewards_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    category TEXT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    points_cost INTEGER NOT NULL,
    retail_value DECIMAL(10,2),
    quantity_available INTEGER,
    redemption_limit_per_user INTEGER,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFID SCANS
CREATE TABLE IF NOT EXISTS public.rfid_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL,
    scan_type TEXT NOT NULL,
    location TEXT,
    reader_id TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RFP EVALUATIONS
CREATE TABLE IF NOT EXISTS public.rfp_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL,
    submission_id UUID NOT NULL,
    evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criteria_scores JSONB DEFAULT '{}'::jsonb,
    total_score DECIMAL(10,2),
    comments TEXT,
    recommendation TEXT,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFP RESPONSES
CREATE TABLE IF NOT EXISTS public.rfp_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    response_date TIMESTAMPTZ DEFAULT NOW(),
    proposed_amount DECIMAL(14,2),
    proposed_timeline TEXT,
    technical_response TEXT,
    pricing_breakdown JSONB DEFAULT '{}'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'submitted',
    score DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFPS
CREATE TABLE IF NOT EXISTS public.rfps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    rfp_number TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    budget_range_min DECIMAL(14,2),
    budget_range_max DECIMAL(14,2),
    requirements JSONB DEFAULT '[]'::jsonb,
    evaluation_criteria JSONB DEFAULT '[]'::jsonb,
    issue_date DATE,
    question_deadline DATE,
    submission_deadline DATE,
    decision_date DATE,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQ QUOTES
CREATE TABLE IF NOT EXISTS public.rfq_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    quote_date TIMESTAMPTZ DEFAULT NOW(),
    total_amount DECIMAL(14,2),
    line_items JSONB DEFAULT '[]'::jsonb,
    delivery_terms TEXT,
    payment_terms TEXT,
    validity_days INTEGER,
    notes TEXT,
    status TEXT DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQS
CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    rfq_number TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    delivery_requirements TEXT,
    issue_date DATE,
    response_deadline DATE,
    status TEXT DEFAULT 'draft',
    selected_vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_cards_org ON public.rate_cards(organization_id);
CREATE INDEX IF NOT EXISTS idx_rating_aggregates_entity ON public.rating_aggregates(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_receipts_order ON public.receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_rehearsal_notes_event ON public.rehearsal_notes(event_id);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_equipment ON public.rental_bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_project ON public.resource_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_retainer_transactions_retainer ON public.retainer_transactions(retainer_id);
CREATE INDEX IF NOT EXISTS idx_retainers_client ON public.retainers(client_id);
CREATE INDEX IF NOT EXISTS idx_retrospectives_project ON public.retrospectives(project_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_user ON public.reward_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_org ON public.rewards(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfid_scans_event ON public.rfid_scans(event_id);
CREATE INDEX IF NOT EXISTS idx_rfid_scans_tag ON public.rfid_scans(tag_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_rfp ON public.rfp_responses(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfps_org ON public.rfps(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfps_status ON public.rfps(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_org ON public.rfqs(organization_id);

-- Enable RLS
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_program_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehearsal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehire_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restoration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retainer_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_recognition_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_recognition_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfid_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfp_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
