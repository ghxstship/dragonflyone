-- Time Clock Entries Table
-- Tracks clock in/out and break entries for crew members

CREATE TABLE IF NOT EXISTS time_clock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT,
  notes TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_user ON time_clock_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_timestamp ON time_clock_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_type ON time_clock_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_user_date ON time_clock_entries(user_id, timestamp);

-- RLS Policies
ALTER TABLE time_clock_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own entries
CREATE POLICY "Users can view own clock entries"
  ON time_clock_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own entries
CREATE POLICY "Users can create own clock entries"
  ON time_clock_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Managers can view all entries (for reporting)
CREATE POLICY "Managers can view all clock entries"
  ON time_clock_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND platform_role IN ('platform_admin', 'platform_manager')
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON time_clock_entries TO authenticated;
GRANT ALL ON time_clock_entries TO service_role;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_time_clock_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS time_clock_entries_updated_at ON time_clock_entries;
CREATE TRIGGER time_clock_entries_updated_at
  BEFORE UPDATE ON time_clock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_time_clock_entries_updated_at();
