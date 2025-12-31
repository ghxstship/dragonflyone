-- ============================================================================
-- 0046_3nf_drop_deprecated_columns.sql
-- Final 3NF Compliance: Drop Deprecated Denormalized Columns
-- GHXSTSHIP Platform - Database Normalization Completion
-- ============================================================================
-- 
-- IMPORTANT: This migration should only be run AFTER:
-- 1. Migration 0045_3nf_full_compliance.sql has been applied
-- 2. migrate_all_vendor_names() has been executed successfully
-- 3. migrate_contact_addresses() has been executed successfully
-- 4. All application code has been updated to use the new normalized columns
-- 5. Verification queries confirm no data loss will occur
--
-- Run these verification queries before applying this migration:
--
-- -- Verify all vendor_name data has been migrated
-- SELECT 'finance_expenses' as table_name, COUNT(*) as unmigrated
-- FROM finance_expenses 
-- WHERE vendor_name IS NOT NULL AND vendor_id IS NULL AND ad_hoc_vendor_id IS NULL
-- UNION ALL
-- SELECT 'finance_purchase_orders', COUNT(*)
-- FROM finance_purchase_orders 
-- WHERE vendor_name IS NOT NULL AND vendor_id IS NULL AND ad_hoc_vendor_id IS NULL
-- UNION ALL
-- SELECT 'bills', COUNT(*)
-- FROM bills 
-- WHERE vendor_name IS NOT NULL AND vendor_id IS NULL AND ad_hoc_vendor_id IS NULL
-- UNION ALL
-- SELECT 'procurement_requests', COUNT(*)
-- FROM procurement_requests 
-- WHERE preferred_vendor_name IS NOT NULL AND vendor_id IS NULL AND ad_hoc_vendor_id IS NULL;
--
-- -- Verify all contact addresses have been migrated
-- SELECT COUNT(*) as unmigrated_contacts
-- FROM contacts 
-- WHERE address_id IS NULL AND (address IS NOT NULL OR city IS NOT NULL);
--
-- ============================================================================

-- ============================================================================
-- SECTION 1: DROP VIEWS THAT DEPEND ON DEPRECATED COLUMNS
-- Must drop views before dropping the columns they reference
-- ============================================================================

DROP VIEW IF EXISTS v_expenses_with_vendor;
DROP VIEW IF EXISTS v_purchase_orders_with_vendor;
DROP VIEW IF EXISTS v_bills_with_vendor;
DROP VIEW IF EXISTS v_contacts_with_address;

-- ============================================================================
-- SECTION 2: DROP VENDOR_NAME COLUMNS
-- These columns are now replaced by ad_hoc_vendor_id FK
-- ============================================================================

-- Drop vendor_name from finance_expenses
ALTER TABLE finance_expenses DROP COLUMN IF EXISTS vendor_name;

-- Drop vendor_name from finance_purchase_orders
ALTER TABLE finance_purchase_orders DROP COLUMN IF EXISTS vendor_name;

-- Drop vendor_name from bills
ALTER TABLE bills DROP COLUMN IF EXISTS vendor_name;

-- Drop preferred_vendor_name from procurement_requests
ALTER TABLE procurement_requests DROP COLUMN IF EXISTS preferred_vendor_name;

-- ============================================================================
-- SECTION 2: DROP INLINE ADDRESS COLUMNS FROM CONTACTS
-- These columns are now replaced by address_id FK
-- ============================================================================

-- Drop inline address columns from contacts
ALTER TABLE contacts DROP COLUMN IF EXISTS address;
ALTER TABLE contacts DROP COLUMN IF EXISTS city;
ALTER TABLE contacts DROP COLUMN IF EXISTS state;
ALTER TABLE contacts DROP COLUMN IF EXISTS postal_code;
ALTER TABLE contacts DROP COLUMN IF EXISTS country;

-- ============================================================================
-- SECTION 4: RECREATE VIEWS WITHOUT LEGACY REFERENCES
-- ============================================================================

-- Recreate v_contacts_with_address without legacy columns
CREATE VIEW v_contacts_with_address AS
SELECT 
  c.id,
  c.organization_id,
  c.person_id,
  c.company,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.title,
  c.department,
  c.source,
  c.lead_status,
  c.tags,
  c.metadata,
  c.created_at,
  c.updated_at,
  a.id AS address_id,
  a.street_address,
  a.street_address_2,
  a.city,
  a.state_province AS state,
  a.postal_code,
  a.country
FROM contacts c
LEFT JOIN addresses a ON c.address_id = a.id;

-- Recreate v_expenses_with_vendor without legacy vendor_name reference
CREATE VIEW v_expenses_with_vendor AS
SELECT 
  fe.id,
  fe.organization_id,
  fe.expense_number,
  fe.category_id,
  fe.project_id,
  fe.department_id,
  fe.submitter_id,
  fe.amount,
  fe.currency,
  fe.expense_date,
  fe.description,
  fe.receipt_url,
  fe.receipt_required,
  fe.status,
  fe.approved_by,
  fe.approved_at,
  fe.paid_at,
  fe.rejection_reason,
  fe.ledger_entry_id,
  fe.metadata,
  fe.created_at,
  fe.updated_at,
  COALESCE(fe.vendor_id, ahv.promoted_to_vendor_id) AS resolved_vendor_id,
  fe.ad_hoc_vendor_id,
  COALESCE(lo.name, ahv.name) AS vendor_display_name,
  CASE 
    WHEN fe.vendor_id IS NOT NULL THEN 'legend_organization'
    WHEN fe.ad_hoc_vendor_id IS NOT NULL THEN 'ad_hoc_vendor'
    ELSE NULL
  END AS vendor_source
FROM finance_expenses fe
LEFT JOIN legend_organizations lo ON fe.vendor_id = lo.id
LEFT JOIN ad_hoc_vendors ahv ON fe.ad_hoc_vendor_id = ahv.id;

-- Recreate v_purchase_orders_with_vendor without legacy vendor_name reference
CREATE VIEW v_purchase_orders_with_vendor AS
SELECT 
  fpo.id,
  fpo.organization_id,
  fpo.po_number,
  fpo.project_id,
  fpo.department_id,
  fpo.requested_by,
  fpo.status,
  fpo.order_date,
  fpo.expected_delivery_date,
  fpo.shipping_address,
  fpo.billing_address,
  fpo.subtotal,
  fpo.tax_amount,
  fpo.shipping_amount,
  fpo.total_amount,
  fpo.currency,
  fpo.payment_terms,
  fpo.notes,
  fpo.approved_by,
  fpo.approved_at,
  fpo.received_by,
  fpo.received_at,
  fpo.metadata,
  fpo.created_at,
  fpo.updated_at,
  COALESCE(fpo.vendor_id, ahv.promoted_to_vendor_id) AS resolved_vendor_id,
  fpo.ad_hoc_vendor_id,
  COALESCE(lo.name, ahv.name) AS vendor_display_name,
  CASE 
    WHEN fpo.vendor_id IS NOT NULL THEN 'legend_organization'
    WHEN fpo.ad_hoc_vendor_id IS NOT NULL THEN 'ad_hoc_vendor'
    ELSE NULL
  END AS vendor_source
FROM finance_purchase_orders fpo
LEFT JOIN legend_organizations lo ON fpo.vendor_id = lo.id
LEFT JOIN ad_hoc_vendors ahv ON fpo.ad_hoc_vendor_id = ahv.id;

-- Recreate v_bills_with_vendor without legacy vendor_name reference
CREATE VIEW v_bills_with_vendor AS
SELECT 
  b.id,
  b.organization_id,
  b.bill_number,
  b.purchase_order_id,
  b.project_id,
  b.bill_date,
  b.due_date,
  b.subtotal,
  b.tax_amount,
  b.total_amount,
  b.currency,
  b.status,
  b.paid_amount,
  b.paid_at,
  b.notes,
  b.attachments,
  b.metadata,
  b.created_at,
  b.updated_at,
  COALESCE(b.vendor_id, ahv.promoted_to_vendor_id) AS resolved_vendor_id,
  b.ad_hoc_vendor_id,
  COALESCE(lo.name, ahv.name) AS vendor_display_name,
  CASE 
    WHEN b.vendor_id IS NOT NULL THEN 'legend_organization'
    WHEN b.ad_hoc_vendor_id IS NOT NULL THEN 'ad_hoc_vendor'
    ELSE NULL
  END AS vendor_source
FROM bills b
LEFT JOIN legend_organizations lo ON b.vendor_id = lo.id
LEFT JOIN ad_hoc_vendors ahv ON b.ad_hoc_vendor_id = ahv.id;

-- ============================================================================
-- SECTION 5: DROP MIGRATION FUNCTIONS (No longer needed)
-- ============================================================================

DROP FUNCTION IF EXISTS migrate_expense_vendor_names();
DROP FUNCTION IF EXISTS migrate_po_vendor_names();
DROP FUNCTION IF EXISTS migrate_bill_vendor_names();
DROP FUNCTION IF EXISTS migrate_procurement_vendor_names();
DROP FUNCTION IF EXISTS migrate_all_vendor_names();
DROP FUNCTION IF EXISTS migrate_contact_addresses();
DROP FUNCTION IF EXISTS verify_contacts_address_migration();

-- ============================================================================
-- SECTION 6: DOCUMENTATION
-- ============================================================================

COMMENT ON VIEW v_contacts_with_address IS 'View providing contacts with normalized address data. Legacy inline address columns have been removed.';
COMMENT ON VIEW v_expenses_with_vendor IS 'View providing expenses with unified vendor information. Legacy vendor_name column has been removed.';
COMMENT ON VIEW v_purchase_orders_with_vendor IS 'View providing purchase orders with unified vendor information. Legacy vendor_name column has been removed.';
COMMENT ON VIEW v_bills_with_vendor IS 'View providing bills with unified vendor information. Legacy vendor_name column has been removed.';

