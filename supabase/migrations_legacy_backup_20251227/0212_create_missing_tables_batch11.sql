-- Migration: Create missing tables (Batch 11 - PO through Project)
-- Tables: po_line_items through project_vendors

-- PO LINE ITEMS
CREATE TABLE IF NOT EXISTS public.po_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL,
    line_number INTEGER,
    description TEXT NOT NULL,
    quantity DECIMAL(12,4) DEFAULT 1,
    unit TEXT,
    unit_price DECIMAL(12,4),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    total_amount DECIMAL(14,2),
    delivery_date DATE,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO RECEIPT ITEMS
CREATE TABLE IF NOT EXISTS public.po_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL,
    line_item_id UUID REFERENCES public.po_line_items(id) ON DELETE CASCADE,
    quantity_received DECIMAL(12,4),
    quantity_accepted DECIMAL(12,4),
    quantity_rejected DECIMAL(12,4),
    rejection_reason TEXT,
    condition TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO RECEIPTS
CREATE TABLE IF NOT EXISTS public.po_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL,
    receipt_number TEXT,
    receipt_date DATE NOT NULL,
    received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    delivery_note TEXT,
    carrier TEXT,
    tracking_number TEXT,
    status TEXT DEFAULT 'received',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL,
    item_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    project_url TEXT,
    client_name TEXT,
    date_completed DATE,
    tags TEXT[],
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PORTFOLIOS
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POST EVENT REPORTS
CREATE TABLE IF NOT EXISTS public.post_event_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    report_type TEXT DEFAULT 'comprehensive',
    executive_summary TEXT,
    attendance_data JSONB DEFAULT '{}'::jsonb,
    financial_summary JSONB DEFAULT '{}'::jsonb,
    operational_notes TEXT,
    successes TEXT,
    challenges TEXT,
    recommendations TEXT,
    lessons_learned TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft',
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POST SHOW PLANS
CREATE TABLE IF NOT EXISTS public.post_show_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    plan_type TEXT DEFAULT 'standard',
    scheduled_start TIMESTAMPTZ,
    estimated_duration_hours DECIMAL(4,1),
    departments JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT DEFAULT 'planned',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POST SHOW TASKS
CREATE TABLE IF NOT EXISTS public.post_show_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.post_show_plans(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 0,
    estimated_duration_minutes INTEGER,
    dependencies UUID[],
    status TEXT DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POWER CIRCUITS
CREATE TABLE IF NOT EXISTS public.power_circuits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    circuit_name TEXT NOT NULL,
    circuit_number TEXT,
    location TEXT,
    voltage INTEGER,
    amperage INTEGER,
    phase TEXT,
    connector_type TEXT,
    is_dedicated BOOLEAN DEFAULT false,
    assigned_to TEXT,
    load_watts INTEGER,
    status TEXT DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POWER PLANS
CREATE TABLE IF NOT EXISTS public.power_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    total_power_required_kw DECIMAL(10,2),
    generator_required BOOLEAN DEFAULT false,
    generator_specs TEXT,
    distribution_plan JSONB DEFAULT '{}'::jsonb,
    circuits JSONB DEFAULT '[]'::jsonb,
    backup_power BOOLEAN DEFAULT false,
    notes TEXT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRE SAVE CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.pre_save_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    campaign_name TEXT NOT NULL,
    release_type TEXT,
    release_date DATE,
    platforms TEXT[],
    landing_page_url TEXT,
    artwork_url TEXT,
    description TEXT,
    save_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRE SAVE RECORDS
CREATE TABLE IF NOT EXISTS public.pre_save_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.pre_save_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    external_user_id TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    notified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- PREDICTIONS
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL,
    prediction_type TEXT NOT NULL,
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(5,4),
    actual_outcome JSONB,
    accuracy_score DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PREDICTIVE MODELS
CREATE TABLE IF NOT EXISTS public.predictive_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    model_name TEXT NOT NULL,
    model_type TEXT NOT NULL,
    description TEXT,
    version TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    training_data_summary JSONB DEFAULT '{}'::jsonb,
    accuracy_metrics JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_trained_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PREFERRED VENDORS
CREATE TABLE IF NOT EXISTS public.preferred_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    category TEXT,
    tier TEXT DEFAULT 'standard',
    discount_percentage DECIMAL(5,2),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PREORDER PRODUCTS
CREATE TABLE IF NOT EXISTS public.preorder_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preorder_id UUID NOT NULL,
    product_id UUID,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    variant_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PREORDERS
CREATE TABLE IF NOT EXISTS public.preorders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    deposit_amount DECIMAL(12,2) DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT false,
    expected_date DATE,
    pickup_location TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESS RELEASE DISTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.press_release_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    press_release_id UUID NOT NULL,
    channel TEXT NOT NULL,
    recipient TEXT,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESS RELEASES
CREATE TABLE IF NOT EXISTS public.press_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    summary TEXT,
    embargo_date TIMESTAMPTZ,
    release_date TIMESTAMPTZ,
    contact_info JSONB DEFAULT '{}'::jsonb,
    media_assets JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROCEDURE STEPS
CREATE TABLE IF NOT EXISTS public.procedure_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    responsible_role TEXT,
    estimated_duration_minutes INTEGER,
    required_resources TEXT[],
    safety_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROCUREMENT AUTOMATION RULES
CREATE TABLE IF NOT EXISTS public.procurement_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    rule_name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    conditions JSONB DEFAULT '{}'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT BUNDLES
CREATE TABLE IF NOT EXISTS public.product_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    bundle_name TEXT NOT NULL,
    description TEXT,
    bundle_price DECIMAL(12,2),
    individual_price_total DECIMAL(12,2),
    savings_amount DECIMAL(12,2),
    products JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT CUSTOMIZATION OPTIONS
CREATE TABLE IF NOT EXISTS public.product_customization_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    option_name TEXT NOT NULL,
    option_type TEXT NOT NULL,
    choices JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT false,
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT DATASHEETS
CREATE TABLE IF NOT EXISTS public.product_datasheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    version TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    sku TEXT,
    variant_name TEXT NOT NULL,
    attributes JSONB DEFAULT '{}'::jsonb,
    price DECIMAL(12,2),
    compare_at_price DECIMAL(12,2),
    cost DECIMAL(12,2),
    quantity INTEGER DEFAULT 0,
    weight DECIMAL(10,4),
    barcode TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION BOOKS
CREATE TABLE IF NOT EXISTS public.production_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    book_type TEXT DEFAULT 'master',
    title TEXT,
    version TEXT,
    sections JSONB DEFAULT '[]'::jsonb,
    file_url TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION CHECKLIST ITEMS
CREATE TABLE IF NOT EXISTS public.production_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL,
    item_text TEXT NOT NULL,
    category TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    priority INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION ISSUES
CREATE TABLE IF NOT EXISTS public.production_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION MEETINGS
CREATE TABLE IF NOT EXISTS public.production_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    meeting_type TEXT NOT NULL,
    title TEXT,
    scheduled_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    location TEXT,
    virtual_link TEXT,
    attendees UUID[],
    agenda TEXT,
    minutes TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION MILESTONES
CREATE TABLE IF NOT EXISTS public.production_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    dependencies UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION NOTES
CREATE TABLE IF NOT EXISTS public.production_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    note_type TEXT DEFAULT 'general',
    title TEXT,
    content TEXT NOT NULL,
    department TEXT,
    priority TEXT DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION PHOTOS
CREATE TABLE IF NOT EXISTS public.production_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    photo_type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    taken_at TIMESTAMPTZ,
    taken_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION TEMPLATES
CREATE TABLE IF NOT EXISTS public.production_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTION TIMELINE ENTRIES
CREATE TABLE IF NOT EXISTS public.production_timeline_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    department TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    dependencies UUID[],
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    barcode TEXT,
    category TEXT,
    price DECIMAL(12,2),
    compare_at_price DECIMAL(12,2),
    cost DECIMAL(12,2),
    quantity INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT true,
    weight DECIMAL(10,4),
    weight_unit TEXT DEFAULT 'lb',
    images JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFIT SHARING ALLOCATIONS
CREATE TABLE IF NOT EXISTS public.profit_sharing_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    allocation_date DATE,
    base_salary DECIMAL(12,2),
    allocation_percentage DECIMAL(5,4),
    allocated_amount DECIMAL(12,2),
    vesting_percentage DECIMAL(5,2),
    vested_amount DECIMAL(12,2),
    status TEXT DEFAULT 'allocated',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFIT SHARING DISTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.profit_sharing_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    distribution_date DATE,
    total_amount DECIMAL(14,2),
    participant_count INTEGER,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFIT SHARING PLANS
CREATE TABLE IF NOT EXISTS public.profit_sharing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    plan_name TEXT NOT NULL,
    description TEXT,
    plan_type TEXT DEFAULT 'discretionary',
    eligibility_criteria JSONB DEFAULT '{}'::jsonb,
    allocation_formula JSONB DEFAULT '{}'::jsonb,
    vesting_schedule JSONB DEFAULT '{}'::jsonb,
    plan_year_start DATE,
    plan_year_end DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAM APPLICATIONS
CREATE TABLE IF NOT EXISTS public.program_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_name TEXT,
    applicant_email TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    responses JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'submitted',
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAM POSITIONS
CREATE TABLE IF NOT EXISTS public.program_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL,
    position_title TEXT NOT NULL,
    description TEXT,
    department TEXT,
    positions_available INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    requirements TEXT,
    responsibilities TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT ALIGNMENT SCORES
CREATE TABLE IF NOT EXISTS public.project_alignment_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    objective_id UUID,
    score DECIMAL(5,2),
    weight DECIMAL(5,2) DEFAULT 1,
    weighted_score DECIMAL(8,4),
    notes TEXT,
    scored_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scored_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    allocation_percentage DECIMAL(5,2) DEFAULT 100,
    start_date DATE,
    end_date DATE,
    hourly_rate DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT BUDGET ITEMS
CREATE TABLE IF NOT EXISTS public.project_budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    budgeted_amount DECIMAL(14,2),
    actual_amount DECIMAL(14,2) DEFAULT 0,
    variance DECIMAL(14,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT BUDGETS
CREATE TABLE IF NOT EXISTS public.project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    budget_name TEXT NOT NULL,
    total_budget DECIMAL(14,2),
    spent_amount DECIMAL(14,2) DEFAULT 0,
    remaining_amount DECIMAL(14,2),
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT CONTACTS
CREATE TABLE IF NOT EXISTS public.project_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    role TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT DEPENDENCIES
CREATE TABLE IF NOT EXISTS public.project_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    depends_on_project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    dependency_type TEXT DEFAULT 'finish_to_start',
    lag_days INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT DOCUMENTS
CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_size INTEGER,
    version TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT FOLDERS
CREATE TABLE IF NOT EXISTS public.project_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.project_folders(id) ON DELETE CASCADE,
    path TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT GOAL ALIGNMENTS
CREATE TABLE IF NOT EXISTS public.project_goal_alignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL,
    alignment_type TEXT,
    contribution_percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT ISSUES
CREATE TABLE IF NOT EXISTS public.project_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date DATE,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT MILESTONES
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed_date DATE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT RISKS
CREATE TABLE IF NOT EXISTS public.project_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    risk_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    probability TEXT DEFAULT 'medium',
    impact TEXT DEFAULT 'medium',
    risk_score INTEGER,
    mitigation_plan TEXT,
    contingency_plan TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'identified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT SETTLEMENTS
CREATE TABLE IF NOT EXISTS public.project_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    settlement_date DATE,
    total_revenue DECIMAL(14,2) DEFAULT 0,
    total_expenses DECIMAL(14,2) DEFAULT 0,
    gross_profit DECIMAL(14,2) DEFAULT 0,
    profit_margin DECIMAL(5,2),
    line_items JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT SHIFTS
CREATE TABLE IF NOT EXISTS public.project_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    shift_name TEXT NOT NULL,
    shift_date DATE,
    start_time TIME,
    end_time TIME,
    required_staff INTEGER,
    assigned_staff UUID[],
    department TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT STAKEHOLDERS
CREATE TABLE IF NOT EXISTS public.project_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stakeholder_type TEXT NOT NULL,
    name TEXT NOT NULL,
    organization TEXT,
    role TEXT,
    email TEXT,
    phone TEXT,
    influence_level TEXT DEFAULT 'medium',
    interest_level TEXT DEFAULT 'medium',
    communication_preference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT SUBCONTRACTORS
CREATE TABLE IF NOT EXISTS public.project_subcontractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    scope_of_work TEXT,
    contract_value DECIMAL(14,2),
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT TASKS
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.project_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    responsibilities TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT VENDORS
CREATE TABLE IF NOT EXISTS public.project_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    service_type TEXT,
    contract_value DECIMAL(14,2),
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_po_line_items_po ON public.po_line_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_receipts_po ON public.po_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_post_event_reports_event ON public.post_event_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_power_circuits_venue ON public.power_circuits(venue_id);
CREATE INDEX IF NOT EXISTS idx_pre_save_campaigns_artist ON public.pre_save_campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_preferred_vendors_org ON public.preferred_vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_preorders_user ON public.preorders(user_id);
CREATE INDEX IF NOT EXISTS idx_press_releases_event ON public.press_releases(event_id);
CREATE INDEX IF NOT EXISTS idx_production_books_event ON public.production_books(event_id);
CREATE INDEX IF NOT EXISTS idx_production_issues_event ON public.production_issues(event_id);
CREATE INDEX IF NOT EXISTS idx_production_meetings_event ON public.production_meetings(event_id);
CREATE INDEX IF NOT EXISTS idx_products_org ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON public.project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user ON public.project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_budgets_project ON public.project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON public.project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_issues_project ON public.project_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_project ON public.project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stakeholders_project ON public.project_stakeholders(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON public.project_tasks(project_id);

-- Enable RLS
ALTER TABLE public.po_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_show_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_show_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_save_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_save_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferred_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preorder_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_release_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_datasheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_sharing_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_sharing_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_sharing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_alignment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_goal_alignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_subcontractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_vendors ENABLE ROW LEVEL SECURITY;
