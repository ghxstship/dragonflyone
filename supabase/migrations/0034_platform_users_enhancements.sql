-- ============================================================================
-- 0034_platform_users_enhancements.sql
-- Adds missing columns to platform_users for admin user management
-- ============================================================================

-- Add missing columns to platform_users
ALTER TABLE platform_users 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS platform_roles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Create index on platform_roles for role-based queries
CREATE INDEX IF NOT EXISTS idx_platform_users_roles ON platform_users USING GIN(platform_roles);

-- ============================================================================
-- SYNC FUNCTION: Update platform_roles from user_roles table
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_platform_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Update platform_roles array on platform_users when user_roles changes
  UPDATE platform_users
  SET platform_roles = (
    SELECT COALESCE(array_agg(role_code), '{}')
    FROM user_roles
    WHERE platform_user_id = COALESCE(NEW.platform_user_id, OLD.platform_user_id)
  )
  WHERE id = COALESCE(NEW.platform_user_id, OLD.platform_user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync roles
DROP TRIGGER IF EXISTS sync_platform_roles_trigger ON user_roles;
CREATE TRIGGER sync_platform_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION sync_platform_roles();

-- Initial sync of existing roles
UPDATE platform_users pu
SET platform_roles = (
  SELECT COALESCE(array_agg(ur.role_code), '{}')
  FROM user_roles ur
  WHERE ur.platform_user_id = pu.id
);
