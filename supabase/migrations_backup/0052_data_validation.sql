-- 0052_data_validation.sql
-- Advanced data validation and constraints

-- Validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate phone format (basic international)
CREATE OR REPLACE FUNCTION is_valid_phone(phone text)
RETURNS boolean AS $$
BEGIN
  RETURN phone ~* '^\+?[1-9]\d{1,14}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add email validation to contacts
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_email_check;
ALTER TABLE contacts ADD CONSTRAINT contacts_email_check 
  CHECK (email IS NULL OR is_valid_email(email));

-- Add email validation to vendors
ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_email_check;
ALTER TABLE vendors ADD CONSTRAINT vendors_email_check 
  CHECK (email IS NULL OR is_valid_email(email));

-- Add email validation to staff
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_email_check;
ALTER TABLE staff ADD CONSTRAINT staff_email_check 
  CHECK (email IS NULL OR is_valid_email(email));

-- Validate project dates
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_dates_check;
ALTER TABLE projects ADD CONSTRAINT projects_dates_check 
  CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);

-- Validate task dates
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_dates_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_dates_check 
  CHECK (start_date IS NULL OR due_date IS NULL OR start_date <= due_date);

-- Validate budget values
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_budget_positive;
ALTER TABLE projects ADD CONSTRAINT projects_budget_positive 
  CHECK (budget IS NULL OR budget >= 0);

ALTER TABLE budget_line_items DROP CONSTRAINT IF EXISTS budget_line_items_amounts_positive;
ALTER TABLE budget_line_items ADD CONSTRAINT budget_line_items_amounts_positive 
  CHECK (amount >= 0 AND actual_cost >= 0);

-- Validate ratings
ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_rating_range;
ALTER TABLE vendors ADD CONSTRAINT vendors_rating_range 
  CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

-- Validate staff allocation
ALTER TABLE staff_assignments DROP CONSTRAINT IF EXISTS staff_allocation_range;
ALTER TABLE staff_assignments ADD CONSTRAINT staff_allocation_range 
  CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100);

-- Function to check for overlapping date ranges
CREATE OR REPLACE FUNCTION check_date_overlap(
  p_start_date date,
  p_end_date date,
  p_existing_start date,
  p_existing_end date
)
RETURNS boolean AS $$
BEGIN
  RETURN (p_start_date <= p_existing_end AND p_end_date >= p_existing_start);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Prevent over-allocation of staff
CREATE OR REPLACE FUNCTION validate_staff_allocation()
RETURNS TRIGGER AS $$
DECLARE
  v_total_allocation numeric;
BEGIN
  SELECT COALESCE(SUM(allocation_percentage), 0)
  INTO v_total_allocation
  FROM staff_assignments
  WHERE staff_id = NEW.staff_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.start_date IS NULL AND NEW.end_date IS NULL) OR
      (start_date IS NULL AND end_date IS NULL) OR
      check_date_overlap(NEW.start_date, COALESCE(NEW.end_date, '9999-12-31'), start_date, COALESCE(end_date, '9999-12-31'))
    );
  
  IF (v_total_allocation + NEW.allocation_percentage) > 100 THEN
    RAISE EXCEPTION 'Staff allocation would exceed 100%% (currently at %%). Cannot allocate additional %%%.', 
      v_total_allocation, NEW.allocation_percentage;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_staff_allocation_trigger
  BEFORE INSERT OR UPDATE ON staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_staff_allocation();

COMMENT ON FUNCTION is_valid_email IS 'Validates email address format';
COMMENT ON FUNCTION is_valid_phone IS 'Validates international phone number format';
COMMENT ON FUNCTION check_date_overlap IS 'Checks if two date ranges overlap';
COMMENT ON FUNCTION validate_staff_allocation IS 'Prevents staff over-allocation beyond 100%';
