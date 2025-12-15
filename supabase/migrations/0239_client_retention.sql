-- Migration: client_retention
-- Description: Creates client_retention table for tracking client health and churn

CREATE TABLE IF NOT EXISTS public.client_retention (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    segment VARCHAR(100) NOT NULL CHECK (segment IN ('Enterprise', 'Mid-Market', 'SMB', 'Startup')),
    total_revenue DECIMAL(18,2) DEFAULT 0,
    total_deals INTEGER DEFAULT 0,
    avg_deal_size DECIMAL(18,2) DEFAULT 0,
    first_deal_date DATE,
    last_deal_date DATE,
    days_since_last_deal INTEGER DEFAULT 0,
    health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
    nps_score INTEGER CHECK (nps_score >= -100 AND nps_score <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN ('Active', 'At Risk', 'Churned', 'New')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_retention_org ON public.client_retention(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_retention_status ON public.client_retention(status);
CREATE INDEX IF NOT EXISTS idx_client_retention_segment ON public.client_retention(segment);
CREATE INDEX IF NOT EXISTS idx_client_retention_health ON public.client_retention(health_score);

-- Enable RLS
ALTER TABLE public.client_retention ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view client retention in their organization"
    ON public.client_retention FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage client retention in their organization"
    ON public.client_retention FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Grants
GRANT SELECT ON public.client_retention TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.client_retention TO authenticated;

-- Updated at trigger
CREATE TRIGGER update_client_retention_updated_at
    BEFORE UPDATE ON public.client_retention
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.client_retention IS 'Tracks client health scores, revenue, and churn risk';
