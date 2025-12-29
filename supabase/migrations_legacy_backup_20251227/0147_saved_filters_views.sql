-- Saved Filters and Views System
-- Allows users to save and manage custom filters and table views

-- Saved Filters table
CREATE TABLE IF NOT EXISTS saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    entity_type TEXT NOT NULL,
    conditions JSONB NOT NULL DEFAULT '[]',
    sort_by TEXT,
    sort_order TEXT CHECK (sort_order IN ('asc', 'desc')),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    use_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved Views table
CREATE TABLE IF NOT EXISTS saved_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    entity_type TEXT NOT NULL,
    visible_columns TEXT[] NOT NULL DEFAULT '{}',
    column_order TEXT[] NOT NULL DEFAULT '{}',
    column_widths JSONB,
    filters JSONB,
    sort_by TEXT,
    sort_order TEXT CHECK (sort_order IN ('asc', 'desc')),
    page_size INTEGER,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for saved_filters
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_entity_type ON saved_filters(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_entity ON saved_filters(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_public ON saved_filters(is_public) WHERE is_public = TRUE;

-- Indexes for saved_views
CREATE INDEX IF NOT EXISTS idx_saved_views_user_id ON saved_views(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_views_entity_type ON saved_views(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_views_user_entity ON saved_views(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_views_public ON saved_views(is_public) WHERE is_public = TRUE;

-- Function to increment filter usage
CREATE OR REPLACE FUNCTION increment_filter_usage(filter_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE saved_filters
    SET use_count = use_count + 1,
        last_used_at = NOW()
    WHERE id = filter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on saved_filters
CREATE OR REPLACE FUNCTION update_saved_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_saved_filters_updated_at
    BEFORE UPDATE ON saved_filters
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_filters_updated_at();

-- Trigger to update updated_at on saved_views
CREATE OR REPLACE FUNCTION update_saved_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_saved_views_updated_at
    BEFORE UPDATE ON saved_views
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_views_updated_at();

-- RLS Policies for saved_filters
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own filters"
    ON saved_filters FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own filters"
    ON saved_filters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters"
    ON saved_filters FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters"
    ON saved_filters FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for saved_views
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own views"
    ON saved_views FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own views"
    ON saved_views FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own views"
    ON saved_views FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own views"
    ON saved_views FOR DELETE
    USING (auth.uid() = user_id);
