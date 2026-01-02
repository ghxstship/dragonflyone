-- Migration: Social Media & POS Tables
-- Creates tables for TikTok challenges, cashless payments, and related features
-- 3NF & SSOT Compliant - All tables have organization_id and proper RLS

-- =============================================================================
-- TIKTOK CHALLENGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tiktok_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.legend_events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hashtag TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    prize_description TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'ended', 'cancelled')),
    submission_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for event lookups
CREATE INDEX IF NOT EXISTS idx_tiktok_challenges_org_id ON public.tiktok_challenges(organization_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_challenges_event_id ON public.tiktok_challenges(event_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_challenges_status ON public.tiktok_challenges(status);
CREATE INDEX IF NOT EXISTS idx_tiktok_challenges_hashtag ON public.tiktok_challenges(hashtag);

-- RLS policies
ALTER TABLE public.tiktok_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tiktok_challenges_select_policy" ON public.tiktok_challenges
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "tiktok_challenges_insert_policy" ON public.tiktok_challenges
    FOR INSERT WITH CHECK (org_matches(organization_id));

CREATE POLICY "tiktok_challenges_update_policy" ON public.tiktok_challenges
    FOR UPDATE USING (org_matches(organization_id));

CREATE POLICY "tiktok_challenges_delete_policy" ON public.tiktok_challenges
    FOR DELETE USING (org_matches(organization_id));

-- =============================================================================
-- CASHLESS PAYMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cashless_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.legend_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.platform_users(id) ON DELETE SET NULL,
    vendor_id UUID,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('nfc', 'qr_code', 'wristband', 'mobile_wallet')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    description TEXT,
    transaction_reference TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cashless_payments_org_id ON public.cashless_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_cashless_payments_event_id ON public.cashless_payments(event_id);
CREATE INDEX IF NOT EXISTS idx_cashless_payments_user_id ON public.cashless_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_cashless_payments_status ON public.cashless_payments(status);
CREATE INDEX IF NOT EXISTS idx_cashless_payments_created_at ON public.cashless_payments(created_at);

-- RLS policies
ALTER TABLE public.cashless_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cashless_payments_select_policy" ON public.cashless_payments
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "cashless_payments_insert_policy" ON public.cashless_payments
    FOR INSERT WITH CHECK (org_matches(organization_id));

CREATE POLICY "cashless_payments_update_policy" ON public.cashless_payments
    FOR UPDATE USING (org_matches(organization_id));

-- =============================================================================
-- MEDIA KITS TABLE (if not exists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.media_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.legend_events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    press_contact_name TEXT NOT NULL,
    press_contact_email TEXT NOT NULL,
    press_contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_kits_org_id ON public.media_kits(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_kits_event_id ON public.media_kits(event_id);

ALTER TABLE public.media_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_kits_select_policy" ON public.media_kits
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "media_kits_insert_policy" ON public.media_kits
    FOR INSERT WITH CHECK (org_matches(organization_id));

CREATE POLICY "media_kits_update_policy" ON public.media_kits
    FOR UPDATE USING (org_matches(organization_id));

-- =============================================================================
-- MEDIA KIT ASSETS TABLE (if not exists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.media_kit_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.legend_events(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'photo', 'video', 'document', 'press_release')),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_kit_assets_org_id ON public.media_kit_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_kit_assets_event_id ON public.media_kit_assets(event_id);

ALTER TABLE public.media_kit_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_kit_assets_select_policy" ON public.media_kit_assets
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "media_kit_assets_insert_policy" ON public.media_kit_assets
    FOR INSERT WITH CHECK (org_matches(organization_id));

CREATE POLICY "media_kit_assets_delete_policy" ON public.media_kit_assets
    FOR DELETE USING (org_matches(organization_id));

-- =============================================================================
-- PRESS RELEASES TABLE (if not exists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.press_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.legend_events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    release_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    embargo_until TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'embargoed', 'published', 'archived')),
    distributed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_press_releases_org_id ON public.press_releases(organization_id);
CREATE INDEX IF NOT EXISTS idx_press_releases_event_id ON public.press_releases(event_id);
CREATE INDEX IF NOT EXISTS idx_press_releases_status ON public.press_releases(status);

ALTER TABLE public.press_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "press_releases_select_policy" ON public.press_releases
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "press_releases_insert_policy" ON public.press_releases
    FOR INSERT WITH CHECK (org_matches(organization_id));

CREATE POLICY "press_releases_update_policy" ON public.press_releases
    FOR UPDATE USING (org_matches(organization_id));

CREATE POLICY "press_releases_delete_policy" ON public.press_releases
    FOR DELETE USING (org_matches(organization_id));

-- =============================================================================
-- PRESS RELEASE DISTRIBUTIONS TABLE (if not exists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.press_release_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    press_release_id UUID NOT NULL REFERENCES public.press_releases(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'opened'))
);

CREATE INDEX IF NOT EXISTS idx_press_release_distributions_org_id ON public.press_release_distributions(organization_id);
CREATE INDEX IF NOT EXISTS idx_press_release_distributions_release_id ON public.press_release_distributions(press_release_id);

ALTER TABLE public.press_release_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "press_release_distributions_select_policy" ON public.press_release_distributions
    FOR SELECT USING (org_matches(organization_id));

CREATE POLICY "press_release_distributions_insert_policy" ON public.press_release_distributions
    FOR INSERT WITH CHECK (org_matches(organization_id));

-- =============================================================================
-- COOKIE CONSENT TABLE (if not exists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cookie_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.platform_users(id) ON DELETE SET NULL,
    necessary BOOLEAN NOT NULL DEFAULT true,
    functional BOOLEAN NOT NULL DEFAULT false,
    analytics BOOLEAN NOT NULL DEFAULT false,
    advertising BOOLEAN NOT NULL DEFAULT false,
    ip_address TEXT,
    user_agent TEXT,
    country_code TEXT,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cookie_consent_session_id ON public.cookie_consent(session_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consent_user_id ON public.cookie_consent(user_id);

ALTER TABLE public.cookie_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cookie_consent_select_policy" ON public.cookie_consent
    FOR SELECT USING (true);

CREATE POLICY "cookie_consent_insert_policy" ON public.cookie_consent
    FOR INSERT WITH CHECK (true);

CREATE POLICY "cookie_consent_update_policy" ON public.cookie_consent
    FOR UPDATE USING (true);

-- Grant permissions
GRANT ALL ON public.tiktok_challenges TO authenticated;
GRANT SELECT ON public.tiktok_challenges TO anon;

GRANT ALL ON public.cashless_payments TO authenticated;
GRANT SELECT ON public.cashless_payments TO anon;

GRANT ALL ON public.media_kits TO authenticated;
GRANT SELECT ON public.media_kits TO anon;

GRANT ALL ON public.media_kit_assets TO authenticated;
GRANT SELECT ON public.media_kit_assets TO anon;

GRANT ALL ON public.press_releases TO authenticated;
GRANT SELECT ON public.press_releases TO anon;

GRANT ALL ON public.press_release_distributions TO authenticated;

GRANT ALL ON public.cookie_consent TO authenticated;
GRANT ALL ON public.cookie_consent TO anon;
