-- Migration: Maintenance Management System
-- Description: Tables for asset maintenance schedules, logs, and work orders

-- Maintenance schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'predictive', 'inspection', 'calibration', 'cleaning', 'replacement')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annually', 'annually', 'usage_based', 'on_demand')),
  frequency_value INT,
  description TEXT NOT NULL,
  estimated_duration_hours NUMERIC(5,2) NOT NULL,
  assigned_to UUID REFERENCES platform_users(id),
  checklist JSONB,
  parts_required JSONB,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  next_due_date DATE,
  last_completed_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  notification_days_before INT DEFAULT 7,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_asset ON maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_due ON maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_type ON maintenance_schedules(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_active ON maintenance_schedules(active);

-- Maintenance logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES maintenance_schedules(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  work_order_id UUID,
  performed_by UUID NOT NULL REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ NOT NULL,
  duration_hours NUMERIC(5,2) NOT NULL,
  checklist_completed JSONB,
  parts_used JSONB,
  labor_cost NUMERIC(10,2),
  parts_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  issues_found TEXT,
  recommendations TEXT,
  next_maintenance_date DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'partially_completed', 'failed', 'deferred')),
  photos TEXT[],
  logged_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset ON maintenance_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_schedule ON maintenance_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_completed ON maintenance_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status ON maintenance_logs(status);

-- Work orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  work_order_number TEXT NOT NULL,
  asset_id UUID REFERENCES assets(id),
  maintenance_schedule_id UUID REFERENCES maintenance_schedules(id),
  work_type TEXT NOT NULL CHECK (work_type IN ('maintenance', 'repair', 'installation', 'inspection', 'emergency', 'upgrade')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical', 'emergency')),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  requested_by UUID REFERENCES platform_users(id),
  assigned_to UUID REFERENCES platform_users(id),
  team_id UUID,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2),
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  parts_required JSONB,
  parts_used JSONB,
  checklist JSONB,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, work_order_number)
);

CREATE INDEX IF NOT EXISTS idx_work_orders_org ON work_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset ON work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned ON work_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled ON work_orders(scheduled_start);

-- Spare parts inventory table
CREATE TABLE IF NOT EXISTS spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  part_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  manufacturer TEXT,
  supplier TEXT,
  unit_cost NUMERIC(10,2),
  quantity_on_hand INT DEFAULT 0,
  minimum_quantity INT DEFAULT 0,
  reorder_quantity INT,
  location TEXT,
  compatible_assets UUID[],
  is_critical BOOLEAN DEFAULT false,
  lead_time_days INT,
  last_ordered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, part_number)
);

CREATE INDEX IF NOT EXISTS idx_spare_parts_org ON spare_parts(organization_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_number ON spare_parts(part_number);
CREATE INDEX IF NOT EXISTS idx_spare_parts_low_stock ON spare_parts(quantity_on_hand) WHERE quantity_on_hand <= minimum_quantity;

-- Parts usage history table
CREATE TABLE IF NOT EXISTS parts_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES spare_parts(id),
  work_order_id UUID REFERENCES work_orders(id),
  maintenance_log_id UUID REFERENCES maintenance_logs(id),
  asset_id UUID REFERENCES assets(id),
  quantity INT NOT NULL,
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  used_by UUID REFERENCES platform_users(id),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parts_usage_part ON parts_usage(part_id);
CREATE INDEX IF NOT EXISTS idx_parts_usage_work_order ON parts_usage(work_order_id);

-- Function to generate work order number
CREATE OR REPLACE FUNCTION generate_work_order_number(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE WHEN work_order_number ~ ('^WO-' || year_suffix || '-[0-9]+$')
    THEN CAST(SUBSTRING(work_order_number FROM '[0-9]+$') AS INT) ELSE 0 END
  ), 0) + 1 INTO sequence_num
  FROM work_orders WHERE organization_id = org_id AND work_order_number LIKE 'WO-' || year_suffix || '-%';
  
  RETURN 'WO-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 5, '0');
END;
$$;

-- Function to update asset maintenance status
CREATE OR REPLACE FUNCTION update_asset_maintenance_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE assets SET
    last_maintenance_date = NEW.completed_at,
    maintenance_count = COALESCE(maintenance_count, 0) + 1,
    updated_at = NOW()
  WHERE id = NEW.asset_id;
  
  -- Update schedule next due date if applicable
  IF NEW.schedule_id IS NOT NULL AND NEW.next_maintenance_date IS NOT NULL THEN
    UPDATE maintenance_schedules SET
      next_due_date = NEW.next_maintenance_date,
      last_completed_at = NEW.completed_at,
      updated_at = NOW()
    WHERE id = NEW.schedule_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS maintenance_log_asset_update ON maintenance_logs;
CREATE TRIGGER maintenance_log_asset_update
  AFTER INSERT ON maintenance_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_maintenance_status();

-- Function to update spare parts inventory
CREATE OR REPLACE FUNCTION update_spare_parts_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE spare_parts SET
    quantity_on_hand = quantity_on_hand - NEW.quantity,
    updated_at = NOW()
  WHERE id = NEW.part_id;
  
  -- Check if reorder needed
  IF (SELECT quantity_on_hand <= minimum_quantity FROM spare_parts WHERE id = NEW.part_id) THEN
    -- Create notification for low stock
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT 
      created_by,
      'low_stock_alert',
      'Low Stock Alert',
      'Part ' || (SELECT name FROM spare_parts WHERE id = NEW.part_id) || ' is below minimum quantity',
      jsonb_build_object('part_id', NEW.part_id)
    FROM spare_parts WHERE id = NEW.part_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS parts_usage_inventory_update ON parts_usage;
CREATE TRIGGER parts_usage_inventory_update
  AFTER INSERT ON parts_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_spare_parts_inventory();

-- Function to get upcoming maintenance
CREATE OR REPLACE FUNCTION get_upcoming_maintenance(p_days INT DEFAULT 30)
RETURNS TABLE (
  schedule_id UUID,
  asset_id UUID,
  asset_name TEXT,
  maintenance_type TEXT,
  next_due_date DATE,
  days_until_due INT,
  priority TEXT,
  assigned_to UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.id AS schedule_id,
    ms.asset_id,
    a.name AS asset_name,
    ms.maintenance_type,
    ms.next_due_date,
    (ms.next_due_date - CURRENT_DATE)::INT AS days_until_due,
    ms.priority,
    ms.assigned_to
  FROM maintenance_schedules ms
  JOIN assets a ON ms.asset_id = a.id
  WHERE ms.active = TRUE
    AND ms.next_due_date IS NOT NULL
    AND ms.next_due_date <= CURRENT_DATE + p_days
  ORDER BY ms.next_due_date ASC;
END;
$$;

-- RLS policies
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_usage ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON maintenance_schedules TO authenticated;
GRANT SELECT, INSERT ON maintenance_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON work_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON spare_parts TO authenticated;
GRANT SELECT, INSERT ON parts_usage TO authenticated;
GRANT EXECUTE ON FUNCTION generate_work_order_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_maintenance(INT) TO authenticated;
