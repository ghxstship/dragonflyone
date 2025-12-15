-- Migration: dashboard_configs
-- Description: Creates dashboard_configs table for custom dashboard builder

CREATE TABLE IF NOT EXISTS public.dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    widget_count INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Active', 'Draft')),
    config JSONB DEFAULT '{}',
    layout JSONB DEFAULT '[]',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dashboard_configs_org ON public.dashboard_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_status ON public.dashboard_configs(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_default ON public.dashboard_configs(is_default);

ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dashboard configs in their organization"
    ON public.dashboard_configs FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage dashboard configs"
    ON public.dashboard_configs FOR ALL
    USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_configs TO authenticated;

CREATE TRIGGER update_dashboard_configs_updated_at
    BEFORE UPDATE ON public.dashboard_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.dashboard_configs IS 'Custom dashboard configurations for dashboard builder';
