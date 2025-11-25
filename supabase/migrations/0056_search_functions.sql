-- 0051_search_functions.sql
-- Global search and discovery functions

-- Universal search function
CREATE OR REPLACE FUNCTION universal_search(
  p_org_id uuid,
  p_query text,
  p_types text[] DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  result_type text,
  result_id uuid,
  result_name text,
  result_description text,
  result_metadata jsonb,
  relevance real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  
  -- Search projects
  SELECT 
    'project'::text,
    p.id,
    p.name,
    p.description,
    jsonb_build_object('status', p.status, 'code', p.code, 'budget', p.budget),
    ts_rank(
      to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.code, '') || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', p_query)
    ) as relevance
  FROM projects p
  WHERE p.organization_id = p_org_id
    AND (p_types IS NULL OR 'project' = ANY(p_types))
    AND to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.code, '') || ' ' || COALESCE(p.description, '')) 
        @@ plainto_tsquery('english', p_query)
  
  UNION ALL
  
  -- Search tasks
  SELECT 
    'task'::text,
    t.id,
    t.title,
    t.description,
    jsonb_build_object('status', t.status, 'priority', t.priority, 'project_id', t.project_id),
    ts_rank(
      to_tsvector('english', COALESCE(t.title, '') || ' ' || COALESCE(t.description, '')),
      plainto_tsquery('english', p_query)
    )
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
  WHERE p.organization_id = p_org_id
    AND (p_types IS NULL OR 'task' = ANY(p_types))
    AND to_tsvector('english', COALESCE(t.title, '') || ' ' || COALESCE(t.description, '')) 
        @@ plainto_tsquery('english', p_query)
  
  UNION ALL
  
  -- Search contacts
  SELECT 
    'contact'::text,
    c.id,
    c.first_name || ' ' || c.last_name,
    c.company,
    jsonb_build_object('email', c.email, 'phone', c.phone, 'role', c.role),
    ts_rank(
      to_tsvector('english', COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') || ' ' || COALESCE(c.company, '')),
      plainto_tsquery('english', p_query)
    )
  FROM contacts c
  WHERE c.organization_id = p_org_id
    AND (p_types IS NULL OR 'contact' = ANY(p_types))
    AND to_tsvector('english', COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') || ' ' || COALESCE(c.company, '')) 
        @@ plainto_tsquery('english', p_query)
  
  UNION ALL
  
  -- Search vendors
  SELECT 
    'vendor'::text,
    v.id,
    v.name,
    v.vendor_type,
    jsonb_build_object('email', v.email, 'phone', v.phone, 'rating', v.rating),
    ts_rank(
      to_tsvector('english', COALESCE(v.name, '') || ' ' || COALESCE(v.vendor_type, '')),
      plainto_tsquery('english', p_query)
    )
  FROM vendors v
  WHERE v.organization_id = p_org_id
    AND (p_types IS NULL OR 'vendor' = ANY(p_types))
    AND to_tsvector('english', COALESCE(v.name, '') || ' ' || COALESCE(v.vendor_type, '')) 
        @@ plainto_tsquery('english', p_query)
  
  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$;

-- Advanced project search with filters
CREATE OR REPLACE FUNCTION search_projects_advanced(
  p_org_id uuid,
  p_search_text text DEFAULT NULL,
  p_status text[] DEFAULT NULL,
  p_min_budget numeric DEFAULT NULL,
  p_max_budget numeric DEFAULT NULL,
  p_start_date_from date DEFAULT NULL,
  p_start_date_to date DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  code text,
  status text,
  budget numeric,
  start_date date,
  end_date date,
  task_count bigint,
  completed_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.code,
    p.status,
    p.budget,
    p.start_date,
    p.end_date,
    COUNT(DISTINCT t.id) as task_count,
    ROUND(
      COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::numeric / 
      NULLIF(COUNT(DISTINCT t.id), 0) * 100,
      2
    ) as completed_percentage
  FROM projects p
  LEFT JOIN tasks t ON t.project_id = p.id
  WHERE p.organization_id = p_org_id
    AND (p_search_text IS NULL OR 
         to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.code, '') || ' ' || COALESCE(p.description, '')) 
         @@ plainto_tsquery('english', p_search_text))
    AND (p_status IS NULL OR p.status = ANY(p_status))
    AND (p_min_budget IS NULL OR p.budget >= p_min_budget)
    AND (p_max_budget IS NULL OR p.budget <= p_max_budget)
    AND (p_start_date_from IS NULL OR p.start_date >= p_start_date_from)
    AND (p_start_date_to IS NULL OR p.start_date <= p_start_date_to)
  GROUP BY p.id, p.name, p.code, p.status, p.budget, p.start_date, p.end_date
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Search staff by skills or availability
CREATE OR REPLACE FUNCTION search_staff(
  p_org_id uuid,
  p_query text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_department text DEFAULT NULL,
  p_available_only boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text,
  department text,
  active_projects bigint,
  utilization_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.first_name || ' ' || s.last_name as name,
    s.email,
    s.role,
    s.department,
    COUNT(DISTINCT sa.project_id) as active_projects,
    COALESCE(SUM(sa.allocation_percentage), 0) as utilization_percentage
  FROM staff s
  LEFT JOIN staff_assignments sa ON sa.staff_id = s.id
  WHERE s.organization_id = p_org_id
    AND (p_query IS NULL OR 
         to_tsvector('english', COALESCE(s.first_name, '') || ' ' || COALESCE(s.last_name, '') || ' ' || COALESCE(s.role, '')) 
         @@ plainto_tsquery('english', p_query))
    AND (p_role IS NULL OR s.role ILIKE '%' || p_role || '%')
    AND (p_department IS NULL OR s.department ILIKE '%' || p_department || '%')
    AND (NOT p_available_only OR COALESCE(SUM(sa.allocation_percentage), 0) < 100)
  GROUP BY s.id, s.first_name, s.last_name, s.email, s.role, s.department
  ORDER BY utilization_percentage ASC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION universal_search TO authenticated;
GRANT EXECUTE ON FUNCTION search_projects_advanced TO authenticated;
GRANT EXECUTE ON FUNCTION search_staff TO authenticated;

COMMENT ON FUNCTION universal_search IS 'Global search across multiple resource types';
COMMENT ON FUNCTION search_projects_advanced IS 'Advanced project search with multiple filters';
COMMENT ON FUNCTION search_staff IS 'Search staff by skills, role, and availability';
