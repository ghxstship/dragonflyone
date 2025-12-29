-- 0242_rename_tech_svc_to_apps.sql
-- Rename TECH-SVC category to APPS (Applications & Technology Services)

-- Update the category code and name
UPDATE catalog_categories 
SET 
  category_code = 'APPS',
  category_name = 'Applications & Technology Services',
  updated_at = now()
WHERE category_code = 'TECH-SVC';

-- Update child categories to point to the renamed parent
-- (This is handled automatically since we're updating by code, not by id)
