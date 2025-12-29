-- Migration: Create missing tables (Batch 2 - Association through Budget)
-- Tables: association_resources through budget_forecasts

-- ASSOCIATION RESOURCES
CREATE TABLE IF NOT EXISTS public.association_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id UUID NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    access_level TEXT DEFAULT 'read',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTRIBUTION EVENTS
CREATE TABLE IF NOT EXISTS public.attribution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    source TEXT,
    medium TEXT,
    campaign TEXT,
    content TEXT,
    term TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    conversion_value DECIMAL(12,2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIENCE SEGMENTS
CREATE TABLE IF NOT EXISTS public.audience_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    segment_type TEXT NOT NULL,
    criteria JSONB DEFAULT '{}'::jsonb,
    member_count INTEGER DEFAULT 0,
    is_dynamic BOOLEAN DEFAULT true,
    last_calculated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIO LINES
CREATE TABLE IF NOT EXISTS public.audio_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    line_number INTEGER,
    line_name TEXT NOT NULL,
    line_type TEXT,
    source TEXT,
    destination TEXT,
    channel_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTHORITY CONTACTS
CREATE TABLE IF NOT EXISTS public.authority_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authority_type TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    organization TEXT,
    email TEXT,
    phone TEXT,
    jurisdiction TEXT,
    notes TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AVAILABILITY SCHEDULES
CREATE TABLE IF NOT EXISTS public.availability_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'UTC',
    effective_from DATE,
    effective_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BACKGROUND CHECKS
CREATE TABLE IF NOT EXISTS public.background_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL,
    provider TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    result TEXT,
    result_details JSONB,
    expires_at DATE,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BAD DEBT RECOVERIES
CREATE TABLE IF NOT EXISTS public.bad_debt_recoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    write_off_id UUID NOT NULL,
    recovery_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    recovery_method TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BAD DEBT RESERVE ADJUSTMENTS
CREATE TABLE IF NOT EXISTS public.bad_debt_reserve_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserve_id UUID NOT NULL,
    adjustment_date DATE NOT NULL,
    adjustment_type TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BAD DEBT RESERVES
CREATE TABLE IF NOT EXISTS public.bad_debt_reserves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    period_start DATE,
    period_end DATE,
    opening_balance DECIMAL(12,2) DEFAULT 0,
    additions DECIMAL(12,2) DEFAULT 0,
    write_offs DECIMAL(12,2) DEFAULT 0,
    recoveries DECIMAL(12,2) DEFAULT 0,
    closing_balance DECIMAL(12,2) DEFAULT 0,
    calculation_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BAD DEBT WRITE OFFS
CREATE TABLE IF NOT EXISTS public.bad_debt_write_offs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id UUID,
    write_off_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT,
    routing_number TEXT,
    bank_name TEXT,
    account_type TEXT,
    currency TEXT DEFAULT 'USD',
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    opening_balance DECIMAL(14,2) DEFAULT 0,
    current_balance DECIMAL(14,2) DEFAULT 0,
    last_reconciled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANK RECONCILIATIONS
CREATE TABLE IF NOT EXISTS public.bank_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    statement_date DATE NOT NULL,
    statement_balance DECIMAL(14,2) NOT NULL,
    book_balance DECIMAL(14,2),
    adjusted_balance DECIMAL(14,2),
    difference DECIMAL(14,2),
    status TEXT DEFAULT 'in_progress',
    reconciled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reconciled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANK TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    post_date DATE,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    description TEXT,
    reference_number TEXT,
    payee TEXT,
    category TEXT,
    is_reconciled BOOLEAN DEFAULT false,
    reconciliation_id UUID REFERENCES public.bank_reconciliations(id) ON DELETE SET NULL,
    matched_transaction_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BATCH OPERATIONS LOG
CREATE TABLE IF NOT EXISTS public.batch_operations_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    error_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BEST PRACTICES
CREATE TABLE IF NOT EXISTS public.best_practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BID ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.bid_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    description TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BID DECISION APPROVALS
CREATE TABLE IF NOT EXISTS public.bid_decision_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BID DECISION SCORES
CREATE TABLE IF NOT EXISTS public.bid_decision_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL,
    bid_id UUID NOT NULL,
    criterion TEXT NOT NULL,
    score DECIMAL(5,2),
    weight DECIMAL(5,2) DEFAULT 1,
    weighted_score DECIMAL(8,4),
    notes TEXT,
    scored_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BID DECISIONS
CREATE TABLE IF NOT EXISTS public.bid_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL,
    decision_date DATE,
    winning_bid_id UUID,
    decision_reason TEXT,
    total_score DECIMAL(10,2),
    status TEXT DEFAULT 'pending',
    decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BID OUTCOMES
CREATE TABLE IF NOT EXISTS public.bid_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL,
    outcome TEXT NOT NULL,
    outcome_date DATE,
    feedback TEXT,
    contract_value DECIMAL(14,2),
    lessons_learned TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BID SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.bid_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    proposed_amount DECIMAL(14,2),
    proposed_timeline TEXT,
    technical_proposal TEXT,
    status TEXT DEFAULT 'submitted',
    score DECIMAL(10,2),
    rank INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLACKOUT DATES
CREATE TABLE IF NOT EXISTS public.blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    blackout_type TEXT DEFAULT 'full',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLANKET PO RELEASES
CREATE TABLE IF NOT EXISTS public.blanket_po_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blanket_po_id UUID NOT NULL,
    release_number INTEGER NOT NULL,
    release_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLANKET PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS public.blanket_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    po_number TEXT UNIQUE,
    description TEXT,
    total_amount DECIMAL(14,2),
    released_amount DECIMAL(14,2) DEFAULT 0,
    remaining_amount DECIMAL(14,2),
    start_date DATE,
    end_date DATE,
    terms TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOK DISTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.book_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    recipient_type TEXT NOT NULL,
    recipient_id UUID,
    distribution_date TIMESTAMPTZ DEFAULT NOW(),
    quantity INTEGER DEFAULT 1,
    distribution_method TEXT,
    tracking_number TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOX SHIPMENTS
CREATE TABLE IF NOT EXISTS public.box_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL,
    shipment_date DATE,
    carrier TEXT,
    tracking_number TEXT,
    status TEXT DEFAULT 'pending',
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    items JSONB DEFAULT '[]'::jsonb,
    shipping_cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOX SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.box_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    box_type TEXT NOT NULL,
    frequency TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date DATE,
    next_shipment_date DATE,
    shipping_address JSONB,
    preferences JSONB DEFAULT '{}'::jsonb,
    price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUDGET ALERT CONFIGS
CREATE TABLE IF NOT EXISTS public.budget_alert_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    threshold_percentage DECIMAL(5,2),
    threshold_amount DECIMAL(14,2),
    notification_channels TEXT[],
    recipients UUID[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUDGET ALERTS
CREATE TABLE IF NOT EXISTS public.budget_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.budget_alert_configs(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    threshold_value DECIMAL(14,2),
    current_value DECIMAL(14,2),
    message TEXT,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ
);

-- BUDGET FORECASTS
CREATE TABLE IF NOT EXISTS public.budget_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    budget_id UUID,
    forecast_period DATE NOT NULL,
    category TEXT,
    forecasted_amount DECIMAL(14,2),
    actual_amount DECIMAL(14,2),
    variance DECIMAL(14,2),
    variance_percentage DECIMAL(8,2),
    forecast_method TEXT,
    confidence_level DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attribution_events_org ON public.attribution_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_attribution_events_created ON public.attribution_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audience_segments_org ON public.audience_segments(organization_id);
CREATE INDEX IF NOT EXISTS idx_availability_schedules_user ON public.availability_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_background_checks_user ON public.background_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_background_checks_status ON public.background_checks(status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON public.bank_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON public.bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bid_submissions_rfp ON public.bid_submissions(rfp_id);
CREATE INDEX IF NOT EXISTS idx_blackout_dates_venue ON public.blackout_dates(venue_id);
CREATE INDEX IF NOT EXISTS idx_blanket_purchase_orders_vendor ON public.blanket_purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_box_subscriptions_user ON public.box_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_budget ON public.budget_alerts(budget_id);

-- Enable RLS
ALTER TABLE public.association_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authority_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bad_debt_recoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bad_debt_reserve_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bad_debt_reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bad_debt_write_offs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_operations_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.best_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_decision_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_decision_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blanket_po_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blanket_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_forecasts ENABLE ROW LEVEL SECURITY;
