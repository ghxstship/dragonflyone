-- 0180_fix_missing_primary_key.sql
-- Fixes linter recommendation: No Primary Key
-- Adds composite primary key to junction table workforce_employee_roles

-- Add composite primary key to workforce_employee_roles
ALTER TABLE public.workforce_employee_roles
ADD CONSTRAINT workforce_employee_roles_pkey PRIMARY KEY (employee_id, role_id);
