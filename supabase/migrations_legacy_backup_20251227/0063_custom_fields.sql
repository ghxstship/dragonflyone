-- 0058_custom_fields.sql
-- Custom fields system for flexible entity extension

-- Custom field definitions
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL, -- project, task, contact, vendor, etc.
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL, -- text, number, date, select, multi_select, boolean, url, email
  field_options jsonb DEFAULT '[]'::jsonb, -- for select/multi_select types
  default_value text,
  is_required boolean DEFAULT false,
  is_searchable boolean DEFAULT true,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  help_text text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, entity_type, field_name)
);

-- Custom field values
CREATE TABLE IF NOT EXISTS custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_definition_id uuid NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  value text,
  value_array text[], -- for multi_select
  value_number numeric,
  value_date date,
  value_boolean boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(field_definition_id, entity_id)
);

CREATE INDEX idx_custom_field_defs_org ON custom_field_definitions(organization_id, entity_type);
CREATE INDEX idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX idx_custom_field_values_def ON custom_field_values(field_definition_id);

-- RLS policies
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_field_defs_select ON custom_field_definitions
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY custom_field_defs_manage ON custom_field_definitions
  FOR ALL USING (
    org_matches(organization_id) AND
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY custom_field_values_select ON custom_field_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_field_definitions cfd
      WHERE cfd.id = custom_field_values.field_definition_id
        AND org_matches(cfd.organization_id)
    )
  );

CREATE POLICY custom_field_values_manage ON custom_field_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_field_definitions cfd
      WHERE cfd.id = custom_field_values.field_definition_id
        AND org_matches(cfd.organization_id)
        AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Get custom fields for entity
CREATE OR REPLACE FUNCTION get_custom_fields(
  p_entity_type text,
  p_entity_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_object_agg(
    cfd.field_name,
    jsonb_build_object(
      'label', cfd.field_label,
      'type', cfd.field_type,
      'value', CASE cfd.field_type
        WHEN 'number' THEN to_jsonb(cfv.value_number)
        WHEN 'date' THEN to_jsonb(cfv.value_date)
        WHEN 'boolean' THEN to_jsonb(cfv.value_boolean)
        WHEN 'multi_select' THEN to_jsonb(cfv.value_array)
        ELSE to_jsonb(cfv.value)
      END,
      'options', cfd.field_options,
      'required', cfd.is_required
    )
  )
  INTO v_result
  FROM custom_field_definitions cfd
  LEFT JOIN custom_field_values cfv ON cfv.field_definition_id = cfd.id AND cfv.entity_id = p_entity_id
  WHERE cfd.entity_type = p_entity_type
    AND cfd.is_active = true;
  
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- Set custom field value
CREATE OR REPLACE FUNCTION set_custom_field(
  p_entity_type text,
  p_entity_id uuid,
  p_field_name text,
  p_value text DEFAULT NULL,
  p_value_array text[] DEFAULT NULL,
  p_value_number numeric DEFAULT NULL,
  p_value_date date DEFAULT NULL,
  p_value_boolean boolean DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_field_def_id uuid;
  v_value_id uuid;
BEGIN
  -- Get field definition
  SELECT id INTO v_field_def_id
  FROM custom_field_definitions
  WHERE entity_type = p_entity_type
    AND field_name = p_field_name
    AND is_active = true;
  
  IF v_field_def_id IS NULL THEN
    RAISE EXCEPTION 'Custom field % not found for entity type %', p_field_name, p_entity_type;
  END IF;
  
  -- Upsert value
  INSERT INTO custom_field_values (
    field_definition_id, entity_type, entity_id,
    value, value_array, value_number, value_date, value_boolean
  ) VALUES (
    v_field_def_id, p_entity_type, p_entity_id,
    p_value, p_value_array, p_value_number, p_value_date, p_value_boolean
  )
  ON CONFLICT (field_definition_id, entity_id)
  DO UPDATE SET
    value = EXCLUDED.value,
    value_array = EXCLUDED.value_array,
    value_number = EXCLUDED.value_number,
    value_date = EXCLUDED.value_date,
    value_boolean = EXCLUDED.value_boolean,
    updated_at = now()
  RETURNING id INTO v_value_id;
  
  RETURN v_value_id;
END;
$$;

GRANT SELECT ON custom_field_definitions TO authenticated;
GRANT SELECT ON custom_field_values TO authenticated;
GRANT EXECUTE ON FUNCTION get_custom_fields TO authenticated;
GRANT EXECUTE ON FUNCTION set_custom_field TO authenticated;

COMMENT ON TABLE custom_field_definitions IS 'Custom field schema definitions';
COMMENT ON TABLE custom_field_values IS 'Custom field data values';
COMMENT ON FUNCTION get_custom_fields IS 'Retrieves all custom fields for an entity';
COMMENT ON FUNCTION set_custom_field IS 'Sets a custom field value';
