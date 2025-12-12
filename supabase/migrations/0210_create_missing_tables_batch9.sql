-- Migration: Create missing tables (Batch 9 - NDA through Opportunity)
-- Tables: nda_signatures through opportunity_views

-- NDA SIGNATURES
CREATE TABLE IF NOT EXISTS public.nda_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nda_id UUID NOT NULL,
    signer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    signer_name TEXT,
    signer_email TEXT,
    signer_title TEXT,
    signer_company TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    signature_url TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NDAS
CREATE TABLE IF NOT EXISTS public.ndas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    nda_type TEXT DEFAULT 'mutual',
    content TEXT,
    template_id UUID,
    effective_date DATE,
    expiration_date DATE,
    parties JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEGOTIATION HISTORY
CREATE TABLE IF NOT EXISTS public.negotiation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    round_number INTEGER DEFAULT 1,
    proposed_by TEXT,
    proposed_terms JSONB DEFAULT '{}'::jsonb,
    counter_terms JSONB,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFT TICKETS
CREATE TABLE IF NOT EXISTS public.nft_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    token_id TEXT,
    contract_address TEXT,
    blockchain TEXT DEFAULT 'ethereum',
    metadata_url TEXT,
    image_url TEXT,
    owner_wallet TEXT,
    minted_at TIMESTAMPTZ,
    transferred_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NFT TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.nft_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nft_ticket_id UUID REFERENCES public.nft_tickets(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    from_wallet TEXT,
    to_wallet TEXT,
    transaction_hash TEXT,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price DECIMAL(18,9),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION CHANNELS
CREATE TABLE IF NOT EXISTS public.notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    channel_type TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION DELIVERY QUEUE
CREATE TABLE IF NOT EXISTS public.notification_delivery_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    channel TEXT NOT NULL,
    recipient TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION READS
CREATE TABLE IF NOT EXISTS public.notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- NOTIFICATION RECIPIENTS
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    recipient_type TEXT NOT NULL,
    recipient_id UUID,
    recipient_email TEXT,
    status TEXT DEFAULT 'pending',
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION ROUTING RULES
CREATE TABLE IF NOT EXISTS public.notification_routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    rule_name TEXT NOT NULL,
    notification_type TEXT,
    conditions JSONB DEFAULT '{}'::jsonb,
    channels TEXT[],
    recipients JSONB DEFAULT '[]'::jsonb,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPS RESPONSES
CREATE TABLE IF NOT EXISTS public.nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    score INTEGER CHECK (score >= 0 AND score <= 10),
    feedback TEXT,
    category TEXT,
    tags TEXT[],
    responded_at TIMESTAMPTZ DEFAULT NOW(),
    follow_up_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPS SURVEYS
CREATE TABLE IF NOT EXISTS public.nps_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    survey_name TEXT NOT NULL,
    question TEXT,
    follow_up_question TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    target_audience TEXT,
    response_count INTEGER DEFAULT 0,
    average_score DECIMAL(4,2),
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAUTH ACCESS TOKENS
CREATE TABLE IF NOT EXISTS public.oauth_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    scopes TEXT[],
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAUTH AUTHORIZATION CODES
CREATE TABLE IF NOT EXISTS public.oauth_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    redirect_uri TEXT,
    scopes TEXT[],
    code_challenge TEXT,
    code_challenge_method TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAUTH CLIENTS
CREATE TABLE IF NOT EXISTS public.oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    client_name TEXT NOT NULL,
    client_id TEXT UNIQUE NOT NULL,
    client_secret_hash TEXT,
    redirect_uris TEXT[],
    allowed_scopes TEXT[],
    grant_types TEXT[],
    is_confidential BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAUTH REFRESH TOKENS
CREATE TABLE IF NOT EXISTS public.oauth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_token_id UUID REFERENCES public.oauth_access_tokens(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OFFER LETTERS
CREATE TABLE IF NOT EXISTS public.offer_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    candidate_id UUID,
    job_id UUID,
    position_title TEXT NOT NULL,
    department TEXT,
    salary DECIMAL(12,2),
    salary_type TEXT DEFAULT 'annual',
    start_date DATE,
    benefits JSONB DEFAULT '{}'::jsonb,
    terms TEXT,
    status TEXT DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OFFLINE CONTENT
CREATE TABLE IF NOT EXISTS public.offline_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    title TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    file_size INTEGER,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OFFLINE DOCUMENTS
CREATE TABLE IF NOT EXISTS public.offline_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    file_url TEXT,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

-- OFFLINE PREFERENCES
CREATE TABLE IF NOT EXISTS public.offline_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    auto_download BOOLEAN DEFAULT false,
    download_on_wifi_only BOOLEAN DEFAULT true,
    max_storage_mb INTEGER DEFAULT 500,
    content_types TEXT[],
    sync_frequency TEXT DEFAULT 'daily',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OFFLINE SYNC QUEUE
CREATE TABLE IF NOT EXISTS public.offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    operation TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    synced_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OKRS
CREATE TABLE IF NOT EXISTS public.okrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    parent_id UUID REFERENCES public.okrs(id) ON DELETE SET NULL,
    okr_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    period_start DATE,
    period_end DATE,
    target_value DECIMAL(18,4),
    current_value DECIMAL(18,4),
    unit TEXT,
    progress_percentage DECIMAL(5,2),
    status TEXT DEFAULT 'on_track',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ONBOARDING DOCUMENTS
CREATE TABLE IF NOT EXISTS public.onboarding_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    is_required BOOLEAN DEFAULT false,
    requires_signature BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ONBOARDING TEMPLATES
CREATE TABLE IF NOT EXISTS public.onboarding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT DEFAULT 'employee',
    steps JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    estimated_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ONBOARDING WORKFLOWS
CREATE TABLE IF NOT EXISTS public.onboarding_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.onboarding_templates(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'not_started',
    current_step INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    progress JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OPPORTUNITY SHARE CLICKS
CREATE TABLE IF NOT EXISTS public.opportunity_share_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL,
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- OPPORTUNITY SHARES
CREATE TABLE IF NOT EXISTS public.opportunity_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    share_type TEXT NOT NULL,
    share_url TEXT,
    share_code TEXT UNIQUE,
    recipient_email TEXT,
    message TEXT,
    expires_at TIMESTAMPTZ,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OPPORTUNITY VIEWS
CREATE TABLE IF NOT EXISTS public.opportunity_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER,
    source TEXT,
    ip_address INET
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nda_signatures_nda ON public.nda_signatures(nda_id);
CREATE INDEX IF NOT EXISTS idx_ndas_org ON public.ndas(organization_id);
CREATE INDEX IF NOT EXISTS idx_nft_tickets_event ON public.nft_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_queue_status ON public.notification_delivery_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON public.notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_survey ON public.nps_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_user ON public.oauth_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_clients_org ON public.oauth_clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_queue_user ON public.offline_sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_okrs_org ON public.okrs(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_workflows_employee ON public.onboarding_workflows(employee_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_shares_opportunity ON public.opportunity_shares(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_views_opportunity ON public.opportunity_views(opportunity_id);

-- Enable RLS
ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_share_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_views ENABLE ROW LEVEL SECURITY;
