-- Migration: Add missing columns to analytics_dashboards
-- Description: Adds visibility, is_starred, view_count, widget_count columns

-- Add missing columns
ALTER TABLE public.analytics_dashboards 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'organization'));

ALTER TABLE public.analytics_dashboards 
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;

ALTER TABLE public.analytics_dashboards 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

ALTER TABLE public.analytics_dashboards 
ADD COLUMN IF NOT EXISTS widget_count INTEGER DEFAULT 0;

ALTER TABLE public.analytics_dashboards 
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

ALTER TABLE public.analytics_dashboards 
ADD COLUMN IF NOT EXISTS owner TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_org ON public.analytics_dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_visibility ON public.analytics_dashboards(visibility);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_starred ON public.analytics_dashboards(is_starred);

-- Add RLS policies if not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_dashboards' AND policyname = 'Users can view dashboards in their organization') THEN
        CREATE POLICY "Users can view dashboards in their organization"
            ON public.analytics_dashboards FOR SELECT
            USING (
                organization_id IN (
                    SELECT organization_id FROM public.organization_members 
                    WHERE user_id = auth.uid()
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_dashboards' AND policyname = 'Users can create dashboards in their organization') THEN
        CREATE POLICY "Users can create dashboards in their organization"
            ON public.analytics_dashboards FOR INSERT
            WITH CHECK (
                organization_id IN (
                    SELECT organization_id FROM public.organization_members 
                    WHERE user_id = auth.uid()
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_dashboards' AND policyname = 'Users can update their own dashboards') THEN
        CREATE POLICY "Users can update their own dashboards"
            ON public.analytics_dashboards FOR UPDATE
            USING (
                created_by = auth.uid() OR
                organization_id IN (
                    SELECT organization_id FROM public.organization_members 
                    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_dashboards' AND policyname = 'Users can delete their own dashboards') THEN
        CREATE POLICY "Users can delete their own dashboards"
            ON public.analytics_dashboards FOR DELETE
            USING (
                created_by = auth.uid() OR
                organization_id IN (
                    SELECT organization_id FROM public.organization_members 
                    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
                )
            );
    END IF;
END
$$;

COMMENT ON COLUMN public.analytics_dashboards.visibility IS 'Dashboard visibility: private, team, or organization';
COMMENT ON COLUMN public.analytics_dashboards.is_starred IS 'Whether the dashboard is starred/favorited';
COMMENT ON COLUMN public.analytics_dashboards.view_count IS 'Number of times the dashboard has been viewed';
COMMENT ON COLUMN public.analytics_dashboards.widget_count IS 'Number of widgets on the dashboard';
