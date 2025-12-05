-- Cross-Platform Production Sync Triggers
-- This migration creates database triggers to ensure production data
-- stays synchronized across ATLVS, COMPVSS, and GVTEWAY

-- =============================================================================
-- PRODUCTION ID VALIDATION
-- =============================================================================

-- Function to validate unified production ID format
CREATE OR REPLACE FUNCTION validate_production_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Production IDs must follow the format: prod-{timestamp}-{random}
  IF NEW.production_id IS NOT NULL AND NEW.production_id !~ '^prod-[0-9]+-[a-z0-9]+$' THEN
    RAISE EXCEPTION 'Invalid production_id format. Expected: prod-{timestamp}-{random}';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation to events table
DROP TRIGGER IF EXISTS validate_event_production_id ON events;
CREATE TRIGGER validate_event_production_id
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  WHEN (NEW.production_id IS NOT NULL)
  EXECUTE FUNCTION validate_production_id();

-- Apply validation to crew_workspaces table
DROP TRIGGER IF EXISTS validate_workspace_production_id ON crew_workspaces;
CREATE TRIGGER validate_workspace_production_id
  BEFORE INSERT OR UPDATE ON crew_workspaces
  FOR EACH ROW
  WHEN (NEW.production_id IS NOT NULL)
  EXECUTE FUNCTION validate_production_id();

-- =============================================================================
-- PRODUCTION STATUS SYNC
-- =============================================================================

-- Function to sync production status changes to related tables
CREATE OR REPLACE FUNCTION sync_production_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When production status changes, update related events
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE events
    SET 
      status = CASE 
        WHEN NEW.status = 'active' THEN 'published'
        WHEN NEW.status = 'completed' THEN 'completed'
        WHEN NEW.status = 'cancelled' THEN 'cancelled'
        WHEN NEW.status = 'archived' THEN 'archived'
        ELSE status
      END,
      updated_at = NOW()
    WHERE production_id = NEW.id;

    -- Update crew workspaces
    UPDATE crew_workspaces
    SET 
      status = CASE 
        WHEN NEW.status = 'active' THEN 'active'
        WHEN NEW.status = 'completed' THEN 'completed'
        WHEN NEW.status = 'cancelled' THEN 'inactive'
        WHEN NEW.status = 'archived' THEN 'archived'
        ELSE status
      END,
      updated_at = NOW()
    WHERE production_id = NEW.id;

    -- Log the sync event
    INSERT INTO sync_logs (
      source_table,
      source_id,
      action,
      old_value,
      new_value,
      synced_tables,
      created_at
    ) VALUES (
      'productions',
      NEW.id,
      'status_change',
      OLD.status,
      NEW.status,
      ARRAY['events', 'crew_workspaces'],
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply status sync trigger to productions
DROP TRIGGER IF EXISTS sync_production_status_trigger ON productions;
CREATE TRIGGER sync_production_status_trigger
  AFTER UPDATE ON productions
  FOR EACH ROW
  EXECUTE FUNCTION sync_production_status();

-- =============================================================================
-- PRODUCTION DATE SYNC
-- =============================================================================

-- Function to sync production date changes
CREATE OR REPLACE FUNCTION sync_production_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- When production dates change, update related events
  IF OLD.start_date IS DISTINCT FROM NEW.start_date OR OLD.end_date IS DISTINCT FROM NEW.end_date THEN
    UPDATE events
    SET 
      start_date = COALESCE(NEW.start_date, start_date),
      end_date = COALESCE(NEW.end_date, end_date),
      updated_at = NOW()
    WHERE production_id = NEW.id;

    -- Log the sync event
    INSERT INTO sync_logs (
      source_table,
      source_id,
      action,
      old_value,
      new_value,
      synced_tables,
      created_at
    ) VALUES (
      'productions',
      NEW.id,
      'date_change',
      jsonb_build_object('start_date', OLD.start_date, 'end_date', OLD.end_date)::text,
      jsonb_build_object('start_date', NEW.start_date, 'end_date', NEW.end_date)::text,
      ARRAY['events'],
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply date sync trigger to productions
DROP TRIGGER IF EXISTS sync_production_dates_trigger ON productions;
CREATE TRIGGER sync_production_dates_trigger
  AFTER UPDATE ON productions
  FOR EACH ROW
  EXECUTE FUNCTION sync_production_dates();

-- =============================================================================
-- EVENT TO PRODUCTION SYNC (Reverse Sync)
-- =============================================================================

-- Function to sync event changes back to production
CREATE OR REPLACE FUNCTION sync_event_to_production()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if event has a production_id
  IF NEW.production_id IS NOT NULL THEN
    -- Sync ticket sales data to production metrics
    IF TG_OP = 'UPDATE' AND OLD.tickets_sold IS DISTINCT FROM NEW.tickets_sold THEN
      UPDATE productions
      SET 
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{ticket_sales}',
          jsonb_build_object(
            'total_sold', NEW.tickets_sold,
            'capacity', NEW.capacity,
            'revenue', NEW.ticket_revenue,
            'last_updated', NOW()
          )
        ),
        updated_at = NOW()
      WHERE id = NEW.production_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply event sync trigger
DROP TRIGGER IF EXISTS sync_event_to_production_trigger ON events;
CREATE TRIGGER sync_event_to_production_trigger
  AFTER UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION sync_event_to_production();

-- =============================================================================
-- SYNC LOGS TABLE
-- =============================================================================

-- Create sync_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  synced_tables TEXT[],
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_source ON sync_logs(source_table, source_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at DESC);

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime for cross-platform tables
ALTER PUBLICATION supabase_realtime ADD TABLE productions;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE crew_workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE sync_logs;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get all related records for a production
CREATE OR REPLACE FUNCTION get_production_ecosystem(p_production_id TEXT)
RETURNS TABLE (
  production JSONB,
  events JSONB,
  crew_workspaces JSONB,
  sync_history JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT row_to_json(p.*) FROM productions p WHERE p.id = p_production_id)::jsonb AS production,
    (SELECT jsonb_agg(row_to_json(e.*)) FROM events e WHERE e.production_id = p_production_id) AS events,
    (SELECT jsonb_agg(row_to_json(cw.*)) FROM crew_workspaces cw WHERE cw.production_id = p_production_id) AS crew_workspaces,
    (SELECT jsonb_agg(row_to_json(sl.*)) FROM sync_logs sl WHERE sl.source_id = p_production_id ORDER BY sl.created_at DESC LIMIT 50) AS sync_history;
END;
$$ LANGUAGE plpgsql;

-- Function to manually trigger a full sync for a production
CREATE OR REPLACE FUNCTION trigger_production_sync(p_production_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_production RECORD;
  v_result JSONB;
BEGIN
  -- Get the production
  SELECT * INTO v_production FROM productions WHERE id = p_production_id;
  
  IF v_production IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Production not found');
  END IF;

  -- Sync to events
  UPDATE events
  SET 
    status = CASE 
      WHEN v_production.status = 'active' THEN 'published'
      WHEN v_production.status = 'completed' THEN 'completed'
      WHEN v_production.status = 'cancelled' THEN 'cancelled'
      WHEN v_production.status = 'archived' THEN 'archived'
      ELSE status
    END,
    start_date = v_production.start_date,
    end_date = v_production.end_date,
    updated_at = NOW()
  WHERE production_id = p_production_id;

  -- Sync to crew workspaces
  UPDATE crew_workspaces
  SET 
    status = CASE 
      WHEN v_production.status = 'active' THEN 'active'
      WHEN v_production.status = 'completed' THEN 'completed'
      WHEN v_production.status = 'cancelled' THEN 'inactive'
      WHEN v_production.status = 'archived' THEN 'archived'
      ELSE status
    END,
    updated_at = NOW()
  WHERE production_id = p_production_id;

  -- Log the manual sync
  INSERT INTO sync_logs (
    source_table,
    source_id,
    action,
    synced_tables,
    created_at
  ) VALUES (
    'productions',
    p_production_id,
    'manual_sync',
    ARRAY['events', 'crew_workspaces'],
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'production_id', p_production_id,
    'synced_at', NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_production_ecosystem(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_production_sync(TEXT) TO authenticated;
