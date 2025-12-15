-- Migration: analytics_reports
-- Description: Creates analytics_reports table for storing report configurations

-- Create analytics_reports table
CREATE TABLE IF NOT EXISTS public.analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (type IN ('financial', 'operational', 'hr', 'custom')),
    schedule VARCHAR(50) NOT NULL DEFAULT 'on-demand' CHECK (schedule IN ('daily', 'weekly', 'monthly', 'on-demand')),
    format VARCHAR(20) NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    config JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_reports_org ON public.analytics_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON public.analytics_reports(type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_status ON public.analytics_reports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_schedule ON public.analytics_reports(schedule);

-- Enable RLS
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reports in their organization"
    ON public.analytics_reports FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert reports in their organization"
    ON public.analytics_reports FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Admins can update reports in their organization"
    ON public.analytics_reports FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Admins can delete reports in their organization"
    ON public.analytics_reports FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Grant permissions
GRANT SELECT ON public.analytics_reports TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.analytics_reports TO authenticated;

-- Trigger for updated_at
CREATE TRIGGER update_analytics_reports_updated_at
    BEFORE UPDATE ON public.analytics_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.analytics_reports IS 'Stores analytics report configurations and scheduling';
