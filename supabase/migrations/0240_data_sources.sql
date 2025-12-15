-- Migration: data_sources
-- Description: Creates data_sources table for data warehouse integration

CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Database', 'API', 'File', 'Streaming')),
    connection_string TEXT,
    sync_frequency VARCHAR(50) DEFAULT 'Daily',
    last_sync TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'Disconnected' CHECK (status IN ('Connected', 'Syncing', 'Error', 'Disconnected')),
    record_count INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_data_sources_org ON public.data_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON public.data_sources(type);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON public.data_sources(status);

ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view data sources in their organization"
    ON public.data_sources FOR SELECT
    USING (org_matches(organization_id));

CREATE POLICY "Admins can manage data sources"
    ON public.data_sources FOR ALL
    USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

GRANT SELECT ON public.data_sources TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.data_sources TO authenticated;

CREATE TRIGGER update_data_sources_updated_at
    BEFORE UPDATE ON public.data_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.data_sources IS 'Data warehouse integration sources';
