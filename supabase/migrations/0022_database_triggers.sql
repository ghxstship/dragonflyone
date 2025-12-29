-- ============================================================================
-- 0022_database_triggers.sql
-- Business Logic Triggers - Comprehensive Business Automation
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================
-- 
-- This migration provides robust triggers for:
-- 1. Deal/CRM Pipeline Management
-- 2. Project Lifecycle Management
-- 3. Asset State Machine & Inventory
-- 4. Finance: Expenses, POs, Budgets, Orders, Invoices
-- 5. Workforce: Time Entries, Shifts, Certifications, Clock Entries
-- 6. Procurement: Requests, Vendor Contracts
-- 7. Production Advancing
-- 8. Integration Sync Management
-- 9. Saga/Workflow State Machine
-- 10. KPI & Alert Management
-- 11. Audit & Compliance Logging
-- 12. Legend Entity Lifecycle
-- ============================================================================

-- ============================================================================
-- SECTION 1: DEAL/CRM PIPELINE MANAGEMENT
-- ============================================================================

-- ============================================================================
-- DEAL STATUS CHANGE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_log_deal_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO chronicle_entries (
      organization_id,
      chronicle_type,
      action_category,
      actor_id,
      entity_type,
      entity_id,
      title,
      description,
      old_value,
      new_value,
      metadata
    ) VALUES (
      NEW.organization_id,
      'audit',
      'update',
      current_platform_user_id(),
      'deal',
      NEW.id,
      'Deal status changed',
      format('Deal "%s" status changed from %s to %s', NEW.title, OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('deal_id', NEW.id, 'deal_title', NEW.title)
    );
    
    IF NEW.status = 'won' AND OLD.status != 'won' THEN
      NEW.actual_close_date := COALESCE(NEW.actual_close_date, CURRENT_DATE);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_deal_status_change
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_deal_status_change();

-- ============================================================================
-- AUTO CREATE PROJECT ON DEAL WON (Optional - can be disabled)
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_auto_create_project_on_deal_won()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_auto_create BOOLEAN;
BEGIN
  SELECT COALESCE((config->>'auto_create_project_on_deal_won')::BOOLEAN, false)
  INTO v_auto_create
  FROM security_policy_config
  WHERE organization_id = NEW.organization_id
    AND policy_type = 'workflow'
    AND policy_name = 'deal_to_project'
    AND is_active = true
  LIMIT 1;

  IF v_auto_create AND NEW.status = 'won' AND OLD.status != 'won' THEN
    INSERT INTO projects (
      organization_id,
      code,
      name,
      deal_id,
      client_id,
      budget,
      currency,
      project_manager_id
    ) VALUES (
      NEW.organization_id,
      'PRJ-' || to_char(now(), 'YYYYMMDD') || '-' || substr(NEW.id::TEXT, 1, 8),
      NEW.title,
      NEW.id,
      NEW.company_id,
      NEW.value,
      NEW.currency,
      NEW.owner_id
    ) RETURNING id INTO v_project_id;

    INSERT INTO chronicle_entries (
      organization_id,
      chronicle_type,
      action_category,
      actor_id,
      entity_type,
      entity_id,
      title,
      description,
      metadata
    ) VALUES (
      NEW.organization_id,
      'automation',
      'create',
      current_platform_user_id(),
      'project',
      v_project_id,
      'Project auto-created from won deal',
      format('Project automatically created from deal "%s"', NEW.title),
      jsonb_build_object('deal_id', NEW.id, 'project_id', v_project_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_create_project_on_deal_won
  AFTER UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_create_project_on_deal_won();

-- ============================================================================
-- VALIDATE ASSET STATE CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_validate_asset_state_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.state = 'retired' AND NEW.state != 'retired' THEN
    RAISE EXCEPTION 'Cannot change state of retired asset. Asset must be reactivated first.';
  END IF;

  IF OLD.state = 'deployed' AND NEW.state = 'available' AND NEW.project_id IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot mark deployed asset as available while still assigned to a project.';
  END IF;

  IF NEW.state = 'deployed' AND NEW.project_id IS NULL THEN
    RAISE EXCEPTION 'Cannot deploy asset without assigning to a project.';
  END IF;

  IF OLD.state IS DISTINCT FROM NEW.state THEN
    INSERT INTO chronicle_entries (
      organization_id,
      chronicle_type,
      action_category,
      actor_id,
      entity_type,
      entity_id,
      title,
      description,
      old_value,
      new_value,
      metadata
    ) VALUES (
      NEW.organization_id,
      'movement',
      'update',
      current_platform_user_id(),
      'asset',
      NEW.id,
      'Asset state changed',
      format('Asset "%s" state changed from %s to %s', NEW.name, OLD.state, NEW.state),
      jsonb_build_object('state', OLD.state, 'project_id', OLD.project_id),
      jsonb_build_object('state', NEW.state, 'project_id', NEW.project_id),
      jsonb_build_object('asset_tag', NEW.tag)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_asset_state_change
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_asset_state_change();

-- ============================================================================
-- AUTO APPROVE SMALL EXPENSES
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_auto_approve_small_expenses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_threshold NUMERIC;
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
    SELECT COALESCE((config->>'auto_approve_threshold')::NUMERIC, 0)
    INTO v_threshold
    FROM security_policy_config
    WHERE organization_id = NEW.organization_id
      AND policy_type = 'expense'
      AND policy_name = 'auto_approve'
      AND is_active = true
    LIMIT 1;

    IF v_threshold > 0 AND NEW.amount <= v_threshold THEN
      NEW.status := 'approved';
      NEW.approved_at := now();
      
      INSERT INTO chronicle_entries (
        organization_id,
        chronicle_type,
        action_category,
        actor_id,
        entity_type,
        entity_id,
        title,
        description,
        metadata
      ) VALUES (
        NEW.organization_id,
        'automation',
        'approve',
        NEW.submitter_id,
        'expense',
        NEW.id,
        'Expense auto-approved',
        format('Expense #%s auto-approved (amount $%.2f <= threshold $%.2f)', NEW.expense_number, NEW.amount, v_threshold),
        jsonb_build_object('expense_id', NEW.id, 'amount', NEW.amount, 'threshold', v_threshold)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_approve_small_expenses
  BEFORE UPDATE ON finance_expenses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_approve_small_expenses();

-- ============================================================================
-- CALCULATE PO TOTAL
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_calculate_po_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subtotal NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_cost), 0)
  INTO v_subtotal
  FROM finance_purchase_order_items
  WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

  UPDATE finance_purchase_orders
  SET subtotal = v_subtotal,
      total_amount = v_subtotal + COALESCE(tax_amount, 0) + COALESCE(shipping_amount, 0)
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER calculate_po_total_insert
  AFTER INSERT ON finance_purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_po_total();

CREATE TRIGGER calculate_po_total_update
  AFTER UPDATE ON finance_purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_po_total();

CREATE TRIGGER calculate_po_total_delete
  AFTER DELETE ON finance_purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_po_total();

-- ============================================================================
-- LOG PROCUREMENT STATUS CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_log_procurement_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO chronicle_entries (
      organization_id,
      chronicle_type,
      action_category,
      actor_id,
      entity_type,
      entity_id,
      title,
      description,
      old_value,
      new_value,
      metadata
    ) VALUES (
      NEW.organization_id,
      'audit',
      'update',
      current_platform_user_id(),
      'procurement_request',
      NEW.id,
      'Procurement request status changed',
      format('Request #%s status changed from %s to %s', NEW.request_number, OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('request_id', NEW.id, 'request_number', NEW.request_number)
    );

    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
      NEW.approved_at := now();
      NEW.approved_by := current_platform_user_id();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_procurement_status_change
  BEFORE UPDATE ON procurement_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_procurement_status_change();

-- ============================================================================
-- PREVENT PROJECT DELETION WITH ASSETS
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_prevent_project_deletion_with_assets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_asset_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_asset_count
  FROM assets
  WHERE project_id = OLD.id;

  IF v_asset_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete project with % assigned assets. Unassign assets first.', v_asset_count;
  END IF;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER prevent_project_deletion_with_assets
  BEFORE DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_prevent_project_deletion_with_assets();

-- ============================================================================
-- UPDATE INTEGRATION SYNC TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_update_integration_sync_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'synced' AND OLD.status != 'synced' THEN
    NEW.completed_at := now();
  ELSIF NEW.status = 'in_progress' AND OLD.status = 'pending' THEN
    NEW.started_at := now();
  ELSIF NEW.status = 'failed' THEN
    NEW.retry_count := OLD.retry_count + 1;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_integration_sync_timestamp
  BEFORE UPDATE ON integration_sync_jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_integration_sync_timestamp();

-- ============================================================================
-- TIME ENTRY VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_validate_time_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.hours > 24 THEN
    RAISE EXCEPTION 'Time entry cannot exceed 24 hours per day';
  END IF;

  IF NEW.hours < 0 THEN
    RAISE EXCEPTION 'Time entry hours cannot be negative';
  END IF;

  IF NEW.overtime_hours > NEW.hours THEN
    RAISE EXCEPTION 'Overtime hours cannot exceed total hours';
  END IF;

  IF NEW.hourly_rate IS NOT NULL AND NEW.hours IS NOT NULL THEN
    NEW.total_pay := NEW.hours * NEW.hourly_rate + 
                     COALESCE(NEW.overtime_hours, 0) * NEW.hourly_rate * 0.5;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_time_entry
  BEFORE INSERT OR UPDATE ON workforce_time_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_time_entry();

-- ============================================================================
-- SHIFT ASSIGNMENT HEADCOUNT UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_update_shift_headcount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE workforce_shifts
    SET headcount_filled = headcount_filled + 1
    WHERE id = NEW.shift_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE workforce_shifts
    SET headcount_filled = GREATEST(0, headcount_filled - 1)
    WHERE id = OLD.shift_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_shift_headcount_insert
  AFTER INSERT ON workforce_shift_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_shift_headcount();

CREATE TRIGGER update_shift_headcount_delete
  AFTER DELETE ON workforce_shift_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_shift_headcount();

-- ============================================================================
-- ORDER TOTAL CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_calculate_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subtotal NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_subtotal
  FROM order_items
  WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

  UPDATE orders
  SET subtotal = v_subtotal,
      total_amount = v_subtotal + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER calculate_order_total_insert
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_order_total();

CREATE TRIGGER calculate_order_total_update
  AFTER UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_order_total();

CREATE TRIGGER calculate_order_total_delete
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_order_total();

-- ============================================================================
-- CERTIFICATION EXPIRY ALERT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_certification_expiry_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.expiration_date IS NOT NULL AND NEW.expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    INSERT INTO alert_history (
      organization_id,
      alert_type,
      severity,
      title,
      message,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      NEW.organization_id,
      'certification_expiry',
      CASE 
        WHEN NEW.expiration_date <= CURRENT_DATE THEN 'critical'
        WHEN NEW.expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
        ELSE 'info'
      END,
      'Certification expiring soon',
      format('Certification "%s" for employee expires on %s', NEW.certification_name, NEW.expiration_date),
      'certification',
      NEW.id,
      jsonb_build_object(
        'employee_id', NEW.employee_id,
        'certification_type', NEW.certification_type,
        'expiration_date', NEW.expiration_date
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER certification_expiry_check
  AFTER INSERT OR UPDATE ON workforce_certifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_certification_expiry_check();

-- ============================================================================
-- SAGA STATE TRANSITION VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_validate_saga_state_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid_transitions JSONB := '{
    "draft": ["pending", "cancelled"],
    "pending": ["in_progress", "cancelled", "expired"],
    "in_progress": ["review", "completed", "failed", "cancelled"],
    "review": ["approved", "rejected", "in_progress"],
    "approved": ["completed"],
    "rejected": ["draft", "cancelled"],
    "completed": [],
    "cancelled": [],
    "failed": ["draft", "pending"],
    "expired": ["draft"]
  }'::JSONB;
  v_allowed TEXT[];
BEGIN
  IF OLD.current_state IS DISTINCT FROM NEW.current_state THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(v_valid_transitions -> OLD.current_state::TEXT))
    INTO v_allowed;

    IF NOT (NEW.current_state::TEXT = ANY(v_allowed)) THEN
      RAISE EXCEPTION 'Invalid state transition from % to %', OLD.current_state, NEW.current_state;
    END IF;

    PERFORM record_saga_transition(
      NEW.id,
      OLD.current_state,
      NEW.current_state,
      current_platform_user_id(),
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_saga_state_transition
  BEFORE UPDATE ON saga_instances
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_saga_state_transition();

-- ============================================================================
-- SECTION 2: PROJECT LIFECYCLE MANAGEMENT
-- ============================================================================

-- ============================================================================
-- PROJECT PHASE CHANGE VALIDATION & LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_project_phase_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid_transitions JSONB := '{
    "intake": ["preproduction", "cancelled"],
    "preproduction": ["in_production", "cancelled"],
    "in_production": ["post", "cancelled"],
    "post": ["completed", "cancelled"],
    "completed": [],
    "cancelled": []
  }'::JSONB;
  v_allowed TEXT[];
BEGIN
  IF OLD.phase IS DISTINCT FROM NEW.phase THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(v_valid_transitions -> OLD.phase::TEXT))
    INTO v_allowed;

    IF NOT (NEW.phase::TEXT = ANY(v_allowed)) THEN
      RAISE EXCEPTION 'Invalid project phase transition from % to %', OLD.phase, NEW.phase;
    END IF;

    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'audit', 'update', current_platform_user_id(),
      'project', NEW.id, 'Project phase changed',
      format('Project "%s" phase changed from %s to %s', NEW.name, OLD.phase, NEW.phase),
      jsonb_build_object('phase', OLD.phase),
      jsonb_build_object('phase', NEW.phase),
      jsonb_build_object('project_code', NEW.code)
    );

    IF NEW.phase = 'in_production' AND OLD.phase != 'in_production' THEN
      NEW.start_date := COALESCE(NEW.start_date, CURRENT_DATE);
    ELSIF NEW.phase = 'completed' AND OLD.phase != 'completed' THEN
      NEW.end_date := COALESCE(NEW.end_date, CURRENT_DATE);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER project_phase_change
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_project_phase_change();

-- ============================================================================
-- PREVENT PROJECT BUDGET OVERSPEND ALERT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_project_budget_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_expenses NUMERIC;
  v_budget_threshold NUMERIC;
BEGIN
  IF NEW.project_id IS NOT NULL AND NEW.status = 'approved' AND OLD.status != 'approved' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
    FROM finance_expenses
    WHERE project_id = NEW.project_id AND status IN ('approved', 'paid');

    SELECT budget INTO v_budget_threshold
    FROM projects
    WHERE id = NEW.project_id;

    IF v_budget_threshold IS NOT NULL AND v_total_expenses + NEW.amount > v_budget_threshold * 0.9 THEN
      INSERT INTO alert_history (
        organization_id, alert_type, severity, title, message,
        entity_type, entity_id, metric_value, threshold_value, metadata
      ) VALUES (
        NEW.organization_id, 'budget_threshold', 
        CASE WHEN v_total_expenses + NEW.amount > v_budget_threshold THEN 'critical' ELSE 'warning' END,
        'Project budget threshold exceeded',
        format('Project expenses (%.2f) approaching/exceeding budget (%.2f)', v_total_expenses + NEW.amount, v_budget_threshold),
        'project', NEW.project_id, v_total_expenses + NEW.amount, v_budget_threshold,
        jsonb_build_object('expense_id', NEW.id, 'expense_amount', NEW.amount)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER project_budget_alert
  AFTER UPDATE ON finance_expenses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_project_budget_alert();

-- ============================================================================
-- SECTION 3: ASSET STATE MACHINE & INVENTORY
-- ============================================================================

-- ============================================================================
-- ASSET MAINTENANCE SCHEDULING
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_schedule_asset_maintenance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE assets
  SET last_maintenance_at = NEW.event_date,
      next_maintenance_at = NEW.next_scheduled,
      updated_at = now()
  WHERE id = NEW.asset_id;

  INSERT INTO chronicle_entries (
    organization_id, chronicle_type, action_category, actor_id,
    entity_type, entity_id, title, description, metadata
  )
  SELECT 
    a.organization_id, 'movement', 'maintenance', NEW.performed_by,
    'asset', NEW.asset_id, 'Asset maintenance recorded',
    format('Maintenance (%s) performed on asset "%s"', NEW.event_type, a.name),
    jsonb_build_object('event_type', NEW.event_type, 'cost', NEW.cost, 'next_scheduled', NEW.next_scheduled)
  FROM assets a WHERE a.id = NEW.asset_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER schedule_asset_maintenance
  AFTER INSERT ON asset_maintenance_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_schedule_asset_maintenance();

-- ============================================================================
-- ASSET WARRANTY EXPIRY ALERT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_asset_warranty_expiry_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.warranty_expires_at IS NOT NULL AND NEW.warranty_expires_at <= CURRENT_DATE + INTERVAL '30 days' THEN
    INSERT INTO alert_history (
      organization_id, alert_type, severity, title, message,
      entity_type, entity_id, metadata
    ) VALUES (
      NEW.organization_id, 'warranty_expiry',
      CASE 
        WHEN NEW.warranty_expires_at <= CURRENT_DATE THEN 'critical'
        WHEN NEW.warranty_expires_at <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
        ELSE 'info'
      END,
      'Asset warranty expiring',
      format('Asset "%s" (tag: %s) warranty expires on %s', NEW.name, NEW.tag, NEW.warranty_expires_at),
      'asset', NEW.id,
      jsonb_build_object('warranty_expires_at', NEW.warranty_expires_at, 'asset_tag', NEW.tag)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER asset_warranty_expiry_check
  AFTER INSERT OR UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_asset_warranty_expiry_check();

-- ============================================================================
-- ASSET INVENTORY LOW STOCK ALERT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_product_low_stock_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reorder_point INTEGER;
BEGIN
  v_reorder_point := COALESCE((NEW.metadata->>'reorder_point')::INTEGER, 10);
  
  IF NEW.quantity_on_hand <= v_reorder_point AND 
     (OLD.quantity_on_hand IS NULL OR OLD.quantity_on_hand > v_reorder_point) THEN
    INSERT INTO alert_history (
      organization_id, alert_type, severity, title, message,
      entity_type, entity_id, metric_value, threshold_value, metadata
    ) VALUES (
      NEW.organization_id, 'low_stock',
      CASE WHEN NEW.quantity_on_hand = 0 THEN 'critical' ELSE 'warning' END,
      'Low stock alert',
      format('Product "%s" (SKU: %s) is low on stock: %s remaining', NEW.name, NEW.sku, NEW.quantity_on_hand),
      'product', NEW.id, NEW.quantity_on_hand, v_reorder_point,
      jsonb_build_object('sku', NEW.sku, 'quantity_on_hand', NEW.quantity_on_hand)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER product_low_stock_alert
  AFTER UPDATE ON legend_products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_product_low_stock_alert();

-- ============================================================================
-- SECTION 4: FINANCE - BUDGETS, INVOICES, BILLS
-- ============================================================================

-- ============================================================================
-- BUDGET LINE ITEM ACTUAL AMOUNT UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_update_budget_actuals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_budget_id UUID;
  v_category_id UUID;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.project_id IS NOT NULL THEN
    SELECT b.id INTO v_budget_id
    FROM budgets b
    WHERE b.project_id = NEW.project_id AND b.status = 'active'
    LIMIT 1;

    IF v_budget_id IS NOT NULL THEN
      UPDATE budget_line_items
      SET actual_amount = actual_amount + NEW.amount
      WHERE budget_id = v_budget_id 
        AND (category_id = NEW.category_id OR category_id IS NULL);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_budget_actuals
  AFTER UPDATE ON finance_expenses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_budget_actuals();

-- ============================================================================
-- BILL PAYMENT STATUS UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_bill_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'transaction', 'update', current_platform_user_id(),
      'bill', NEW.id, 'Bill status changed',
      format('Bill #%s status changed from %s to %s', NEW.bill_number, OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('bill_number', NEW.bill_number, 'amount', NEW.total_amount)
    );

    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
      NEW.paid_at := COALESCE(NEW.paid_at, now());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER bill_payment_status
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION trigger_bill_payment_status();

-- ============================================================================
-- ORDER STATUS CHANGE & INVENTORY UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'transaction', 'update', current_platform_user_id(),
      'order', NEW.id, 'Order status changed',
      format('Order #%s status changed from %s to %s', NEW.order_number, OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('order_number', NEW.order_number, 'total', NEW.total_amount)
    );

    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
      UPDATE legend_products p
      SET quantity_on_hand = quantity_on_hand - oi.quantity,
          updated_at = now()
      FROM order_items oi
      WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    ELSIF NEW.status = 'cancelled' AND OLD.status IN ('pending', 'confirmed', 'processing') THEN
      UPDATE legend_products p
      SET quantity_on_hand = quantity_on_hand + oi.quantity,
          updated_at = now()
      FROM order_items oi
      WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER order_status_change
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_order_status_change();

-- ============================================================================
-- SECTION 5: WORKFORCE MANAGEMENT
-- ============================================================================

-- ============================================================================
-- TIME ENTRY APPROVAL WORKFLOW
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_time_entry_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'approved' THEN
      NEW.approved_at := now();
      NEW.approved_by := COALESCE(NEW.approved_by, current_platform_user_id());
      
      INSERT INTO chronicle_entries (
        organization_id, chronicle_type, action_category, actor_id,
        entity_type, entity_id, title, description, metadata
      ) VALUES (
        NEW.organization_id, 'timesheet', 'approve', NEW.approved_by,
        'time_entry', NEW.id, 'Time entry approved',
        format('Time entry for %s approved: %.2f hours', NEW.work_date, NEW.hours),
        jsonb_build_object('employee_id', NEW.employee_id, 'hours', NEW.hours, 'work_date', NEW.work_date)
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO chronicle_entries (
        organization_id, chronicle_type, action_category, actor_id,
        entity_type, entity_id, title, description, metadata
      ) VALUES (
        NEW.organization_id, 'timesheet', 'reject', current_platform_user_id(),
        'time_entry', NEW.id, 'Time entry rejected',
        format('Time entry for %s rejected: %s', NEW.work_date, COALESCE(NEW.rejection_reason, 'No reason provided')),
        jsonb_build_object('employee_id', NEW.employee_id, 'rejection_reason', NEW.rejection_reason)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER time_entry_approval
  BEFORE UPDATE ON workforce_time_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_time_entry_approval();

-- ============================================================================
-- SHIFT ASSIGNMENT STATUS SYNC
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_shift_assignment_status_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_all_confirmed BOOLEAN;
  v_any_in_progress BOOLEAN;
  v_all_completed BOOLEAN;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'confirmed' AND OLD.status = 'scheduled' THEN
      NEW.confirmed_at := now();
    ELSIF NEW.status = 'in_progress' AND OLD.status IN ('scheduled', 'confirmed') THEN
      NEW.check_in_at := COALESCE(NEW.check_in_at, now());
    ELSIF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
      NEW.check_out_at := COALESCE(NEW.check_out_at, now());
      NEW.actual_hours := EXTRACT(EPOCH FROM (NEW.check_out_at - NEW.check_in_at)) / 3600;
    END IF;

    SELECT 
      bool_and(status = 'confirmed' OR status = 'in_progress' OR status = 'completed'),
      bool_or(status = 'in_progress'),
      bool_and(status = 'completed' OR status = 'no_show' OR status = 'cancelled')
    INTO v_all_confirmed, v_any_in_progress, v_all_completed
    FROM workforce_shift_assignments
    WHERE shift_id = NEW.shift_id;

    UPDATE workforce_shifts
    SET status = CASE
      WHEN v_all_completed THEN 'completed'
      WHEN v_any_in_progress THEN 'in_progress'
      WHEN v_all_confirmed THEN 'confirmed'
      ELSE status
    END,
    updated_at = now()
    WHERE id = NEW.shift_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER shift_assignment_status_sync
  BEFORE UPDATE ON workforce_shift_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_shift_assignment_status_sync();

-- ============================================================================
-- CLOCK ENTRY AUTO-CREATE TIME ENTRY
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_clock_out_create_time_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hours NUMERIC;
  v_employee workforce_employees%ROWTYPE;
  v_shift workforce_shifts%ROWTYPE;
BEGIN
  IF NEW.clock_out IS NOT NULL AND OLD.clock_out IS NULL THEN
    v_hours := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600 - COALESCE(NEW.total_break_minutes, 0) / 60.0;
    
    SELECT * INTO v_employee FROM workforce_employees WHERE id = NEW.employee_id;
    
    IF NEW.shift_assignment_id IS NOT NULL THEN
      SELECT s.* INTO v_shift 
      FROM workforce_shifts s
      JOIN workforce_shift_assignments sa ON sa.shift_id = s.id
      WHERE sa.id = NEW.shift_assignment_id;
    END IF;

    INSERT INTO workforce_time_entries (
      organization_id, employee_id, project_id, event_id, role_id,
      work_date, start_time, end_time, hours, break_hours,
      hourly_rate, status, description
    ) VALUES (
      NEW.organization_id, NEW.employee_id, v_shift.project_id, v_shift.event_id, v_shift.role_id,
      NEW.clock_in::DATE, NEW.clock_in::TIME, NEW.clock_out::TIME, v_hours, COALESCE(NEW.total_break_minutes, 0) / 60.0,
      COALESCE(v_shift.hourly_rate, v_employee.hourly_rate), 'pending',
      format('Auto-generated from clock entry %s', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER clock_out_create_time_entry
  AFTER UPDATE ON time_clock_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_clock_out_create_time_entry();

-- ============================================================================
-- EMPLOYEE STATUS CHANGE VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_employee_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'terminated' THEN
      NEW.termination_date := COALESCE(NEW.termination_date, CURRENT_DATE);
      
      UPDATE workforce_shift_assignments sa
      SET status = 'cancelled', notes = 'Employee terminated', updated_at = now()
      FROM workforce_shifts s
      WHERE sa.shift_id = s.id 
        AND sa.employee_id = NEW.id 
        AND s.shift_date > CURRENT_DATE
        AND sa.status IN ('scheduled', 'confirmed');
    END IF;

    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'audit', 'update', current_platform_user_id(),
      'employee', NEW.id, 'Employee status changed',
      format('Employee %s %s status changed from %s to %s', NEW.first_name, NEW.last_name, OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('employee_number', NEW.employee_number)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER employee_status_change
  BEFORE UPDATE ON workforce_employees
  FOR EACH ROW
  EXECUTE FUNCTION trigger_employee_status_change();

-- ============================================================================
-- SECTION 6: PROCUREMENT MANAGEMENT
-- ============================================================================

-- ============================================================================
-- VENDOR CONTRACT EXPIRY ALERT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_vendor_contract_expiry_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.end_date IS NOT NULL AND NEW.end_date <= CURRENT_DATE + INTERVAL '30 days' AND NEW.status = 'active' THEN
    INSERT INTO alert_history (
      organization_id, alert_type, severity, title, message,
      entity_type, entity_id, metadata
    ) VALUES (
      NEW.organization_id, 'contract_expiry',
      CASE 
        WHEN NEW.end_date <= CURRENT_DATE THEN 'critical'
        WHEN NEW.end_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
        ELSE 'info'
      END,
      'Vendor contract expiring',
      format('Contract "%s" with vendor expires on %s', NEW.contract_name, NEW.end_date),
      'vendor_contract', NEW.id,
      jsonb_build_object('vendor_id', NEW.vendor_id, 'end_date', NEW.end_date, 'contract_value', NEW.contract_value)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER vendor_contract_expiry_check
  AFTER INSERT OR UPDATE ON vendor_contracts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_vendor_contract_expiry_check();

-- ============================================================================
-- PO RECEIVED QUANTITY VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_po_item_received_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_all_received BOOLEAN;
  v_any_received BOOLEAN;
  v_po_id UUID;
BEGIN
  IF NEW.received_quantity IS DISTINCT FROM OLD.received_quantity THEN
    IF NEW.received_quantity > NEW.quantity THEN
      RAISE EXCEPTION 'Received quantity (%) cannot exceed ordered quantity (%)', NEW.received_quantity, NEW.quantity;
    END IF;

    v_po_id := NEW.purchase_order_id;
    
    SELECT 
      bool_and(received_quantity >= quantity),
      bool_or(received_quantity > 0)
    INTO v_all_received, v_any_received
    FROM finance_purchase_order_items
    WHERE purchase_order_id = v_po_id;

    UPDATE finance_purchase_orders
    SET status = CASE
      WHEN v_all_received THEN 'received'
      WHEN v_any_received THEN 'ordered'
      ELSE status
    END,
    received_at = CASE WHEN v_all_received THEN now() ELSE received_at END,
    received_by = CASE WHEN v_all_received THEN current_platform_user_id() ELSE received_by END,
    updated_at = now()
    WHERE id = v_po_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER po_item_received_validation
  BEFORE UPDATE ON finance_purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_po_item_received_validation();

-- ============================================================================
-- SECTION 7: PRODUCTION ADVANCING
-- ============================================================================

-- ============================================================================
-- PRODUCTION ADVANCE STATUS CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_production_advance_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO production_advance_history (
      advance_id, previous_status, new_status, changed_by, notes
    ) VALUES (
      NEW.id, OLD.status, NEW.status, current_platform_user_id(), NULL
    );

    CASE NEW.status
      WHEN 'submitted' THEN
        NEW.submitted_at := COALESCE(NEW.submitted_at, now());
      WHEN 'under_review' THEN
        NEW.reviewed_by := COALESCE(NEW.reviewed_by, current_platform_user_id());
        NEW.reviewed_at := now();
      WHEN 'approved' THEN
        NEW.approved_by := COALESCE(NEW.approved_by, current_platform_user_id());
        NEW.approved_at := now();
      WHEN 'fulfilled' THEN
        NEW.fulfilled_by := COALESCE(NEW.fulfilled_by, current_platform_user_id());
        NEW.fulfilled_at := now();
      ELSE NULL;
    END CASE;

    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'audit', 'update', current_platform_user_id(),
      'production_advance', NEW.id, 'Production advance status changed',
      format('Advance #%s status changed from %s to %s', NEW.advance_number, OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('advance_number', NEW.advance_number, 'project_id', NEW.project_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER production_advance_status_change
  BEFORE UPDATE ON production_advances
  FOR EACH ROW
  EXECUTE FUNCTION trigger_production_advance_status_change();

-- ============================================================================
-- PRODUCTION ADVANCE ITEM COST CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_advance_item_cost_calculation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_cost NUMERIC;
BEGIN
  IF NEW.unit_cost IS NOT NULL THEN
    NEW.total_cost := NEW.quantity * NEW.unit_cost;
  END IF;

  SELECT COALESCE(SUM(total_cost), 0) INTO v_total_cost
  FROM production_advance_items
  WHERE advance_id = NEW.advance_id AND id != NEW.id;

  UPDATE production_advances
  SET estimated_cost = v_total_cost + COALESCE(NEW.total_cost, 0),
      updated_at = now()
  WHERE id = NEW.advance_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER advance_item_cost_calculation
  BEFORE INSERT OR UPDATE ON production_advance_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_advance_item_cost_calculation();

-- ============================================================================
-- SECTION 8: INTEGRATION SYNC MANAGEMENT
-- ============================================================================

-- ============================================================================
-- ORGANIZATION INTEGRATION STATUS CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_org_integration_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'active' AND OLD.status = 'inactive' THEN
      NEW.last_auth_at := now();
      NEW.error_count := 0;
      NEW.last_error := NULL;
    ELSIF NEW.status = 'failed' THEN
      NEW.error_count := COALESCE(OLD.error_count, 0) + 1;
    END IF;

    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'automation', 'update', current_platform_user_id(),
      'integration', NEW.id, 'Integration status changed',
      format('Integration status changed from %s to %s', OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('provider_id', NEW.provider_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER org_integration_status_change
  BEFORE UPDATE ON organization_integrations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_org_integration_status_change();

-- ============================================================================
-- SECTION 9: KPI & ALERT MANAGEMENT
-- ============================================================================

-- ============================================================================
-- KPI TARGET BREACH ALERT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_kpi_target_breach_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target kpi_targets%ROWTYPE;
  v_breached BOOLEAN := false;
  v_severity TEXT := 'info';
BEGIN
  SELECT * INTO v_target
  FROM kpi_targets
  WHERE organization_id = NEW.organization_id
    AND kpi_code = NEW.kpi_code
    AND valid_from <= now()
    AND (valid_to IS NULL OR valid_to >= now())
  ORDER BY valid_from DESC
  LIMIT 1;

  IF v_target.id IS NOT NULL THEN
    CASE v_target.comparison_operator
      WHEN 'gte' THEN v_breached := NEW.value < v_target.target_value;
      WHEN 'gt' THEN v_breached := NEW.value <= v_target.target_value;
      WHEN 'lte' THEN v_breached := NEW.value > v_target.target_value;
      WHEN 'lt' THEN v_breached := NEW.value >= v_target.target_value;
      WHEN 'eq' THEN v_breached := NEW.value != v_target.target_value;
      ELSE v_breached := false;
    END CASE;

    IF v_breached THEN
      IF v_target.critical_threshold IS NOT NULL THEN
        CASE v_target.comparison_operator
          WHEN 'gte', 'gt' THEN 
            IF NEW.value < v_target.critical_threshold THEN v_severity := 'critical';
            ELSIF NEW.value < v_target.warning_threshold THEN v_severity := 'warning';
            END IF;
          WHEN 'lte', 'lt' THEN
            IF NEW.value > v_target.critical_threshold THEN v_severity := 'critical';
            ELSIF NEW.value > v_target.warning_threshold THEN v_severity := 'warning';
            END IF;
          ELSE NULL;
        END CASE;
      ELSE
        v_severity := 'warning';
      END IF;

      INSERT INTO alert_history (
        organization_id, alert_type, severity, title, message,
        entity_type, entity_id, metric_value, threshold_value, metadata
      ) VALUES (
        NEW.organization_id, 'kpi_breach', v_severity,
        format('KPI target breach: %s', NEW.kpi_name),
        format('KPI "%s" value (%.2f) breached target (%.2f)', NEW.kpi_name, NEW.value, v_target.target_value),
        'kpi', NEW.id, NEW.value, v_target.target_value,
        jsonb_build_object('kpi_code', NEW.kpi_code, 'target_id', v_target.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER kpi_target_breach_check
  AFTER INSERT ON kpi_data_points
  FOR EACH ROW
  EXECUTE FUNCTION trigger_kpi_target_breach_check();

-- ============================================================================
-- ALERT AUTO-RESOLUTION CHECK
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_alert_auto_resolution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'acknowledged' AND OLD.status = 'triggered' THEN
    NEW.acknowledged_at := now();
    NEW.acknowledged_by := COALESCE(NEW.acknowledged_by, current_platform_user_id());
  ELSIF NEW.status = 'resolved' AND OLD.status IN ('triggered', 'acknowledged') THEN
    NEW.resolved_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER alert_auto_resolution
  BEFORE UPDATE ON alert_history
  FOR EACH ROW
  EXECUTE FUNCTION trigger_alert_auto_resolution();

-- ============================================================================
-- SECTION 10: AUDIT & COMPLIANCE
-- ============================================================================

-- ============================================================================
-- GENERIC AUDIT LOG TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_audit_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_changes JSONB;
  v_org_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
    v_org_id := OLD.organization_id;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
    v_org_id := NEW.organization_id;
  ELSE
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    v_org_id := NEW.organization_id;
    
    SELECT jsonb_object_agg(key, value) INTO v_changes
    FROM (
      SELECT key, jsonb_build_object('old', v_old_data->key, 'new', v_new_data->key) as value
      FROM jsonb_object_keys(v_new_data) as key
      WHERE v_old_data->key IS DISTINCT FROM v_new_data->key
    ) changes;
  END IF;

  INSERT INTO audit_log (
    organization_id, table_name, record_id, action,
    old_data, new_data, changes, changed_by
  ) VALUES (
    v_org_id, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id)::TEXT, TG_OP,
    v_old_data, v_new_data, v_changes, current_platform_user_id()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- IMPERSONATION SESSION TRACKING
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_impersonation_session_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    INSERT INTO audit_log (
      organization_id, table_name, record_id, action,
      old_data, new_data, changed_by, metadata
    ) VALUES (
      NEW.organization_id, 'impersonation_sessions', NEW.id::TEXT, 'OTHER',
      jsonb_build_object('started_at', NEW.started_at),
      jsonb_build_object('ended_at', NEW.ended_at, 'actions_performed', NEW.actions_performed),
      NEW.impersonator_id,
      jsonb_build_object(
        'impersonator_id', NEW.impersonator_id,
        'target_user_id', NEW.target_user_id,
        'reason', NEW.reason,
        'duration_minutes', EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER impersonation_session_tracking
  AFTER UPDATE ON impersonation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_impersonation_session_tracking();

-- ============================================================================
-- DATA EXPORT LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_data_export_logging()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO chronicle_entries (
    organization_id, chronicle_type, action_category, actor_id,
    entity_type, entity_id, title, description, metadata
  ) VALUES (
    NEW.organization_id, 'audit', 'export', NEW.exported_by,
    'data_export', NEW.id, 'Data exported',
    format('Data export: %s (%s records)', NEW.export_type, NEW.record_count),
    jsonb_build_object(
      'export_type', NEW.export_type,
      'record_count', NEW.record_count,
      'format', NEW.format,
      'filters', NEW.filters
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER data_export_logging
  AFTER INSERT ON data_export_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_data_export_logging();

-- ============================================================================
-- SECTION 11: LEGEND ENTITY LIFECYCLE
-- ============================================================================

-- ============================================================================
-- LEGEND PEOPLE STATUS CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_legend_people_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'audit', 'update', current_platform_user_id(),
      'legend_people', NEW.id, 'Person status changed',
      format('Person "%s" status changed from %s to %s', NEW.display_name, OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('email', NEW.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER legend_people_status_change
  BEFORE UPDATE ON legend_people
  FOR EACH ROW
  EXECUTE FUNCTION trigger_legend_people_status_change();

-- ============================================================================
-- LEGEND EVENTS DATE VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_legend_event_date_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.end_date IS NOT NULL AND NEW.start_date IS NOT NULL AND NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'Event end date cannot be before start date';
  END IF;

  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, metadata
    ) VALUES (
      NEW.organization_id, 'audit', 'activate', current_platform_user_id(),
      'legend_event', NEW.id, 'Event activated',
      format('Event "%s" has been activated', NEW.name),
      jsonb_build_object('start_date', NEW.start_date, 'end_date', NEW.end_date)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER legend_event_date_validation
  BEFORE INSERT OR UPDATE ON legend_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_legend_event_date_validation();

-- ============================================================================
-- LEGEND ORGANIZATION PRIMARY CONTACT SYNC
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_legend_org_primary_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.primary_contact_id IS NOT NULL AND NEW.primary_contact_id IS DISTINCT FROM OLD.primary_contact_id THEN
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, metadata
    )
    SELECT 
      NEW.organization_id, 'audit', 'update', current_platform_user_id(),
      'legend_organization', NEW.id, 'Primary contact updated',
      format('Primary contact for "%s" changed to %s', NEW.name, p.display_name),
      jsonb_build_object('old_contact_id', OLD.primary_contact_id, 'new_contact_id', NEW.primary_contact_id)
    FROM legend_people p WHERE p.id = NEW.primary_contact_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER legend_org_primary_contact
  BEFORE UPDATE ON legend_organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_legend_org_primary_contact();

-- ============================================================================
-- SECTION 12: CLIENT FEEDBACK & NPS
-- ============================================================================

-- ============================================================================
-- CLIENT FEEDBACK SENTIMENT ANALYSIS PLACEHOLDER
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_client_feedback_processing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.nps_score IS NOT NULL AND NEW.sentiment IS NULL THEN
    NEW.sentiment := CASE
      WHEN NEW.nps_score >= 9 THEN 'positive'
      WHEN NEW.nps_score >= 7 THEN 'neutral'
      ELSE 'negative'
    END;
  END IF;

  IF NEW.nps_score IS NOT NULL AND NEW.nps_score <= 6 THEN
    INSERT INTO alert_history (
      organization_id, alert_type, severity, title, message,
      entity_type, entity_id, metric_value, metadata
    ) VALUES (
      NEW.organization_id, 'detractor_feedback', 
      CASE WHEN NEW.nps_score <= 3 THEN 'critical' ELSE 'warning' END,
      'Detractor feedback received',
      format('NPS score of %s received for %s', NEW.nps_score, NEW.platform),
      'client_feedback', NEW.id, NEW.nps_score,
      jsonb_build_object('project_id', NEW.project_id, 'event_id', NEW.event_id, 'comment', NEW.comment)
    );
  END IF;

  INSERT INTO chronicle_entries (
    organization_id, chronicle_type, action_category, actor_id,
    entity_type, entity_id, title, description, metadata
  ) VALUES (
    NEW.organization_id, 'communication', 'feedback', NEW.contact_id,
    'client_feedback', NEW.id, 'Client feedback received',
    format('NPS: %s, Sentiment: %s', COALESCE(NEW.nps_score::TEXT, 'N/A'), COALESCE(NEW.sentiment, 'unknown')),
    jsonb_build_object('nps_score', NEW.nps_score, 'sentiment', NEW.sentiment, 'platform', NEW.platform)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER client_feedback_processing
  BEFORE INSERT ON client_feedback
  FOR EACH ROW
  EXECUTE FUNCTION trigger_client_feedback_processing();

-- ============================================================================
-- SECTION 13: CONTACT/LEAD MANAGEMENT
-- ============================================================================

-- ============================================================================
-- CONTACT LEAD STATUS PROGRESSION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_contact_lead_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.lead_status IS DISTINCT FROM NEW.lead_status THEN
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'audit', 'update', current_platform_user_id(),
      'contact', NEW.id, 'Lead status changed',
      format('Contact %s %s lead status changed from %s to %s', 
        COALESCE(NEW.first_name, ''), COALESCE(NEW.last_name, ''), OLD.lead_status, NEW.lead_status),
      jsonb_build_object('lead_status', OLD.lead_status),
      jsonb_build_object('lead_status', NEW.lead_status),
      jsonb_build_object('email', NEW.email, 'company', NEW.company)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER contact_lead_status_change
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_contact_lead_status_change();

-- ============================================================================
-- SECTION 14: SCHEDULED JOB MANAGEMENT
-- ============================================================================

-- ============================================================================
-- SCHEDULED JOB EXECUTION TRACKING
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_scheduled_job_execution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_run_at IS DISTINCT FROM OLD.last_run_at THEN
    IF NEW.last_run_status = 'success' THEN
      NEW.consecutive_failures := 0;
      NEW.next_run_at := CASE NEW.schedule_type
        WHEN 'interval' THEN now() + (NEW.schedule_config->>'interval')::INTERVAL
        WHEN 'cron' THEN NULL
        ELSE NEW.next_run_at
      END;
    ELSIF NEW.last_run_status = 'failure' THEN
      NEW.consecutive_failures := COALESCE(OLD.consecutive_failures, 0) + 1;
      
      IF NEW.consecutive_failures >= 3 THEN
        INSERT INTO alert_history (
          organization_id, alert_type, severity, title, message,
          entity_type, entity_id, metadata
        ) VALUES (
          NEW.organization_id, 'scheduled_job_failure', 'critical',
          'Scheduled job failing repeatedly',
          format('Job "%s" has failed %s consecutive times', NEW.name, NEW.consecutive_failures),
          'scheduled_job', NEW.id,
          jsonb_build_object('last_error', NEW.last_error, 'consecutive_failures', NEW.consecutive_failures)
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER scheduled_job_execution
  BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_scheduled_job_execution();

-- ============================================================================
-- SECTION 15: EVENT ROLE MANAGEMENT
-- ============================================================================

-- ============================================================================
-- EVENT ROLE ASSIGNMENT VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_event_role_assignment_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_def event_role_definitions%ROWTYPE;
  v_current_count INTEGER;
BEGIN
  SELECT * INTO v_role_def
  FROM event_role_definitions
  WHERE id = NEW.role_definition_id;

  IF v_role_def.id IS NULL THEN
    RAISE EXCEPTION 'Invalid role definition ID';
  END IF;

  IF v_role_def.max_assignments IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count
    FROM event_role_assignments
    WHERE event_id = NEW.event_id 
      AND role_definition_id = NEW.role_definition_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

    IF v_current_count >= v_role_def.max_assignments THEN
      RAISE EXCEPTION 'Maximum assignments (%) reached for role %', v_role_def.max_assignments, v_role_def.role_name;
    END IF;
  END IF;

  IF NEW.valid_from IS NULL THEN
    NEW.valid_from := now();
  END IF;

  INSERT INTO chronicle_entries (
    organization_id, chronicle_type, action_category, actor_id,
    entity_type, entity_id, title, description, metadata
  )
  SELECT 
    e.organization_id, 'audit', 'assign', current_platform_user_id(),
    'event_role_assignment', NEW.id, 'Event role assigned',
    format('User assigned role "%s" for event', v_role_def.role_name),
    jsonb_build_object('event_id', NEW.event_id, 'role_code', v_role_def.role_code, 'user_id', NEW.user_id)
  FROM legend_events e WHERE e.id = NEW.event_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER event_role_assignment_validation
  BEFORE INSERT ON event_role_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_event_role_assignment_validation();

-- ============================================================================
-- EVENT ROLE REVOCATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_event_role_revocation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.valid_to IS NOT NULL AND OLD.valid_to IS NULL THEN
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, metadata
    )
    SELECT 
      e.organization_id, 'audit', 'revoke', current_platform_user_id(),
      'event_role_assignment', NEW.id, 'Event role revoked',
      format('Role revoked for event'),
      jsonb_build_object('event_id', NEW.event_id, 'user_id', NEW.user_id, 'revoked_at', NEW.valid_to)
    FROM legend_events e WHERE e.id = NEW.event_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER event_role_revocation
  BEFORE UPDATE ON event_role_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_event_role_revocation();

-- ============================================================================
-- SECTION 16: AUTOMATION RULES
-- ============================================================================

-- ============================================================================
-- AUTOMATION RULE EXECUTION LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_automation_rule_execution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_triggered_at IS DISTINCT FROM OLD.last_triggered_at THEN
    NEW.trigger_count := COALESCE(OLD.trigger_count, 0) + 1;
    
    INSERT INTO automation_usage_log (
      organization_id, rule_id, trigger_type, action_type,
      entity_type, entity_id, success, execution_time_ms
    ) VALUES (
      NEW.organization_id, NEW.id, NEW.trigger_type, NEW.action_type,
      NEW.entity_type, NULL, true, NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER automation_rule_execution
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_automation_rule_execution();

-- ============================================================================
-- AUTOMATION RULE ACTIVATION/DEACTIVATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_automation_rule_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, metadata
    ) VALUES (
      NEW.organization_id, 'automation', 
      CASE WHEN NEW.is_active THEN 'activate' ELSE 'deactivate' END,
      current_platform_user_id(),
      'automation_rule', NEW.id,
      CASE WHEN NEW.is_active THEN 'Automation rule activated' ELSE 'Automation rule deactivated' END,
      format('Rule "%s" has been %s', NEW.name, CASE WHEN NEW.is_active THEN 'activated' ELSE 'deactivated' END),
      jsonb_build_object('rule_name', NEW.name, 'trigger_type', NEW.trigger_type, 'action_type', NEW.action_type)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER automation_rule_status_change
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_automation_rule_status_change();

-- ============================================================================
-- SECTION 17: SOCIAL MEDIA INTEGRATION
-- ============================================================================

-- ============================================================================
-- SOCIAL POST SCHEDULING & STATUS
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_social_post_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'published' AND OLD.status IN ('scheduled', 'draft') THEN
      NEW.published_at := COALESCE(NEW.published_at, now());
    ELSIF NEW.status = 'failed' THEN
      NEW.error_message := COALESCE(NEW.error_message, 'Unknown error during publishing');
      NEW.retry_count := COALESCE(OLD.retry_count, 0) + 1;
      
      IF NEW.retry_count >= 3 THEN
        INSERT INTO alert_history (
          organization_id, alert_type, severity, title, message,
          entity_type, entity_id, metadata
        ) VALUES (
          NEW.organization_id, 'social_post_failure', 'warning',
          'Social post publishing failed',
          format('Post to %s failed after %s retries', NEW.platform, NEW.retry_count),
          'social_post', NEW.id,
          jsonb_build_object('platform', NEW.platform, 'error', NEW.error_message)
        );
      END IF;
    END IF;

    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, old_value, new_value, metadata
    ) VALUES (
      NEW.organization_id, 'communication', 'update', current_platform_user_id(),
      'social_post', NEW.id, 'Social post status changed',
      format('Social post status changed from %s to %s', OLD.status, NEW.status),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object('platform', NEW.platform, 'account_id', NEW.account_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER social_post_status_change
  BEFORE UPDATE ON integration_social_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_social_post_status_change();

-- ============================================================================
-- SECTION 18: USER & PLATFORM MANAGEMENT
-- ============================================================================

-- ============================================================================
-- PLATFORM USER ROLE CHANGE AUDIT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_user_role_change_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (
      organization_id, table_name, record_id, action,
      new_data, changed_by, metadata
    )
    SELECT 
      pu.organization_id, 'user_roles', NEW.id::TEXT, 'INSERT',
      jsonb_build_object('role_code', NEW.role_user_id, 'platform_user_id', NEW.platform_user_id),
      current_platform_user_id(),
      jsonb_build_object('action', 'role_granted')
    FROM platform_users pu WHERE pu.id = NEW.platform_user_id;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (
      organization_id, table_name, record_id, action,
      old_data, changed_by, metadata
    )
    SELECT 
      pu.organization_id, 'user_roles', OLD.id::TEXT, 'DELETE',
      jsonb_build_object('role_code', OLD.role_user_id, 'platform_user_id', OLD.platform_user_id),
      current_platform_user_id(),
      jsonb_build_object('action', 'role_revoked')
    FROM platform_users pu WHERE pu.id = OLD.platform_user_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER user_role_change_audit_insert
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_user_role_change_audit();

CREATE TRIGGER user_role_change_audit_delete
  AFTER DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_user_role_change_audit();

-- ============================================================================
-- SECTION 19: WEBHOOK & API MANAGEMENT
-- ============================================================================

-- ============================================================================
-- WEBHOOK EVENT RETRY LOGIC
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_webhook_event_retry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    NEW.retry_count := COALESCE(OLD.retry_count, 0) + 1;
    
    IF NEW.retry_count < 5 THEN
      NEW.next_retry_at := now() + (POWER(2, NEW.retry_count) || ' minutes')::INTERVAL;
      NEW.status := 'pending_retry';
    ELSE
      INSERT INTO alert_history (
        organization_id, alert_type, severity, title, message,
        entity_type, entity_id, metadata
      ) VALUES (
        NEW.organization_id, 'webhook_failure', 'warning',
        'Webhook delivery failed permanently',
        format('Webhook to %s failed after %s retries', 
          (SELECT url FROM webhook_endpoints WHERE id = NEW.endpoint_id), NEW.retry_count),
        'webhook_event', NEW.id,
        jsonb_build_object('endpoint_id', NEW.endpoint_id, 'error', NEW.error_message)
      );
    END IF;
  ELSIF NEW.status = 'delivered' AND OLD.status IN ('pending', 'pending_retry') THEN
    NEW.delivered_at := now();
    NEW.next_retry_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER webhook_event_retry
  BEFORE UPDATE ON webhook_event_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_webhook_event_retry();

-- ============================================================================
-- API RATE LIMIT ENFORCEMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_api_rate_limit_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit api_rate_limits%ROWTYPE;
  v_current_count INTEGER;
BEGIN
  SELECT * INTO v_limit
  FROM api_rate_limits
  WHERE (organization_id = NEW.organization_id OR organization_id IS NULL)
    AND (user_id = NEW.user_id OR user_id IS NULL)
    AND NEW.endpoint LIKE endpoint_pattern
    AND is_active = true
  ORDER BY user_id NULLS LAST, organization_id NULLS LAST
  LIMIT 1;

  IF v_limit.id IS NOT NULL THEN
    SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
    FROM api_rate_limit_usage
    WHERE organization_id = NEW.organization_id
      AND user_id = NEW.user_id
      AND endpoint = NEW.endpoint
      AND window_type = NEW.window_type
      AND window_start = NEW.window_start;

    IF NEW.window_type = 'minute' AND v_current_count + NEW.request_count > v_limit.requests_per_minute THEN
      RAISE EXCEPTION 'Rate limit exceeded: % requests per minute', v_limit.requests_per_minute;
    ELSIF NEW.window_type = 'hour' AND v_current_count + NEW.request_count > v_limit.requests_per_hour THEN
      RAISE EXCEPTION 'Rate limit exceeded: % requests per hour', v_limit.requests_per_hour;
    ELSIF NEW.window_type = 'day' AND v_current_count + NEW.request_count > v_limit.requests_per_day THEN
      RAISE EXCEPTION 'Rate limit exceeded: % requests per day', v_limit.requests_per_day;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER api_rate_limit_check
  BEFORE INSERT ON api_rate_limit_usage
  FOR EACH ROW
  EXECUTE FUNCTION trigger_api_rate_limit_check();

-- ============================================================================
-- SECTION 20: LEDGER & DOUBLE-ENTRY BOOKKEEPING
-- ============================================================================

-- ============================================================================
-- LEDGER ENTRY BALANCE VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_ledger_entry_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_journal_balance NUMERIC;
BEGIN
  IF NEW.journal_entry_id IS NOT NULL THEN
    SELECT SUM(CASE WHEN side = 'debit' THEN amount ELSE -amount END) INTO v_journal_balance
    FROM ledger_entries
    WHERE journal_entry_id = NEW.journal_entry_id;

    IF v_journal_balance != 0 THEN
      RAISE WARNING 'Journal entry % is unbalanced by %', NEW.journal_entry_id, v_journal_balance;
    END IF;
  END IF;

  INSERT INTO chronicle_entries (
    organization_id, chronicle_type, action_category, actor_id,
    entity_type, entity_id, title, description, metadata
  ) VALUES (
    NEW.organization_id, 'transaction', 'create', NEW.posted_by,
    'ledger_entry', NEW.id, 'Ledger entry posted',
    format('%s entry of %s %s to account', NEW.side, NEW.amount, NEW.currency),
    jsonb_build_object(
      'account_id', NEW.account_id, 
      'side', NEW.side, 
      'amount', NEW.amount,
      'journal_entry_id', NEW.journal_entry_id
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER ledger_entry_validation
  AFTER INSERT ON ledger_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ledger_entry_validation();

-- ============================================================================
-- SECTION 21: DASHBOARD & REPORT MANAGEMENT
-- ============================================================================

-- ============================================================================
-- DASHBOARD CONFIG DEFAULT MANAGEMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_dashboard_default_management()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default = true AND (OLD.is_default IS NULL OR OLD.is_default = false) THEN
    UPDATE dashboard_configs
    SET is_default = false, updated_at = now()
    WHERE organization_id = NEW.organization_id
      AND user_id = NEW.user_id
      AND dashboard_type = NEW.dashboard_type
      AND id != NEW.id
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER dashboard_default_management
  BEFORE INSERT OR UPDATE ON dashboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_dashboard_default_management();

-- ============================================================================
-- SECTION 22: TICKET REVENUE INGESTION
-- ============================================================================

-- ============================================================================
-- TICKET REVENUE VALIDATION & PROCESSING
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_ticket_revenue_processing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.gross_revenue < 0 THEN
    RAISE EXCEPTION 'Gross revenue cannot be negative';
  END IF;

  IF NEW.net_revenue IS NULL THEN
    NEW.net_revenue := NEW.gross_revenue - COALESCE(NEW.fees, 0) - COALESCE(NEW.taxes, 0);
  END IF;

  IF NEW.status = 'processed' AND OLD.status = 'pending' THEN
    NEW.processed_at := now();
    
    INSERT INTO chronicle_entries (
      organization_id, chronicle_type, action_category, actor_id,
      entity_type, entity_id, title, description, metadata
    ) VALUES (
      NEW.organization_id, 'transaction', 'process', current_platform_user_id(),
      'ticket_revenue', NEW.id, 'Ticket revenue processed',
      format('Revenue of %s %s processed for event', NEW.gross_revenue, NEW.currency),
      jsonb_build_object(
        'event_id', NEW.event_id,
        'gross_revenue', NEW.gross_revenue,
        'net_revenue', NEW.net_revenue,
        'ticket_count', NEW.ticket_count
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER ticket_revenue_processing
  BEFORE INSERT OR UPDATE ON ticket_revenue_ingestions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ticket_revenue_processing();

-- ============================================================================
-- ENABLE AUDIT LOGGING FOR SENSITIVE TABLES
-- ============================================================================

CREATE TRIGGER audit_deals
  AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log_changes();

CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log_changes();

CREATE TRIGGER audit_finance_expenses
  AFTER INSERT OR UPDATE OR DELETE ON finance_expenses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log_changes();

CREATE TRIGGER audit_finance_purchase_orders
  AFTER INSERT OR UPDATE OR DELETE ON finance_purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log_changes();

CREATE TRIGGER audit_production_advances
  AFTER INSERT OR UPDATE OR DELETE ON production_advances
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log_changes();

CREATE TRIGGER audit_vendor_contracts
  AFTER INSERT OR UPDATE OR DELETE ON vendor_contracts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log_changes();
