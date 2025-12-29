-- Migration: Create missing tables (Batch 12 - Proposal through Quote)
-- Tables: proposal_collaborators through quotes

-- PROPOSAL COLLABORATORS
CREATE TABLE IF NOT EXISTS public.proposal_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'contributor',
    permissions TEXT[] DEFAULT ARRAY['view'],
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPOSAL TEMPLATES
CREATE TABLE IF NOT EXISTS public.proposal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    sections JSONB DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPOSAL VERSIONS
CREATE TABLE IF NOT EXISTS public.proposal_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    change_summary TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPOSALS
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    client_id UUID,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    total_value DECIMAL(14,2),
    valid_until DATE,
    status TEXT DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PUNCH LIST ITEMS
CREATE TABLE IF NOT EXISTS public.punch_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    item_number INTEGER,
    description TEXT NOT NULL,
    location TEXT,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date DATE,
    status TEXT DEFAULT 'open',
    photos JSONB DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDER ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.purchase_order_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDER APPROVALS
CREATE TABLE IF NOT EXISTS public.purchase_order_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approval_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL,
    item_number INTEGER,
    description TEXT NOT NULL,
    quantity DECIMAL(12,4) DEFAULT 1,
    unit TEXT,
    unit_price DECIMAL(12,4),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    total_amount DECIMAL(14,2),
    delivery_date DATE,
    received_quantity DECIMAL(12,4) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDER LINE ITEMS
CREATE TABLE IF NOT EXISTS public.purchase_order_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL,
    line_number INTEGER,
    product_id UUID,
    description TEXT NOT NULL,
    quantity DECIMAL(12,4) DEFAULT 1,
    unit TEXT,
    unit_price DECIMAL(12,4),
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(14,2),
    gl_account TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    po_number TEXT UNIQUE,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    shipping_address JSONB,
    billing_address JSONB,
    subtotal DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    shipping_amount DECIMAL(14,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    payment_terms TEXT,
    shipping_method TEXT,
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QA CHECKPOINTS
CREATE TABLE IF NOT EXISTS public.qa_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    checkpoint_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    criteria JSONB DEFAULT '[]'::jsonb,
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    passed BOOLEAN,
    score DECIMAL(5,2),
    issues_found JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUEUE ENTRIES
CREATE TABLE IF NOT EXISTS public.queue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    position INTEGER,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    estimated_wait_minutes INTEGER,
    status TEXT DEFAULT 'waiting',
    called_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- QUOTE ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.quote_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTE LINE ITEMS
CREATE TABLE IF NOT EXISTS public.quote_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL,
    line_number INTEGER,
    description TEXT NOT NULL,
    quantity DECIMAL(12,4) DEFAULT 1,
    unit TEXT,
    unit_price DECIMAL(12,4),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(14,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTES
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    client_id UUID,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    quote_number TEXT UNIQUE,
    quote_date DATE NOT NULL,
    valid_until DATE,
    subtotal DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    terms TEXT,
    notes TEXT,
    status TEXT DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    converted_to_order_id UUID,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposal_collaborators_proposal ON public.proposal_collaborators(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_org ON public.proposal_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_org ON public.proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_punch_list_items_project ON public.punch_list_items(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_activity_log_po ON public.purchase_order_activity_log(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON public.purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_org ON public.purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON public.purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_qa_checkpoints_project ON public.qa_checkpoints(project_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_queue ON public.queue_entries(queue_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote ON public.quote_line_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_org ON public.quotes(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);

-- Enable RLS
ALTER TABLE public.proposal_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
