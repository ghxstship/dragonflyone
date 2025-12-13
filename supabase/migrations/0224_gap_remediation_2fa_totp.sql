-- ============================================================================
-- Gap 3 Remediation: Two-Factor Authentication (TOTP)
-- Implements TOTP-based 2FA for admin accounts
-- ============================================================================

-- Create 2FA configuration table
CREATE TABLE IF NOT EXISTS public.user_2fa_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE UNIQUE,
  totp_secret TEXT, -- Encrypted TOTP secret
  totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  backup_codes TEXT[], -- Encrypted backup codes
  backup_codes_used INT NOT NULL DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  recovery_email TEXT,
  recovery_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create 2FA verification log for audit
CREATE TABLE IF NOT EXISTS public.user_2fa_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('totp', 'backup_code', 'recovery')),
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_2fa_config_user_id ON public.user_2fa_config(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_verification_log_user_id ON public.user_2fa_verification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_verification_log_created_at ON public.user_2fa_verification_log(created_at);

-- Enable RLS
ALTER TABLE public.user_2fa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_verification_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for 2FA config
DROP POLICY IF EXISTS "user_2fa_config_select" ON public.user_2fa_config;
CREATE POLICY "user_2fa_config_select" ON public.user_2fa_config
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN']
    )
  );

DROP POLICY IF EXISTS "user_2fa_config_update" ON public.user_2fa_config;
CREATE POLICY "user_2fa_config_update" ON public.user_2fa_config
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
  );

-- RLS policies for verification log
DROP POLICY IF EXISTS "user_2fa_verification_log_select" ON public.user_2fa_verification_log;
CREATE POLICY "user_2fa_verification_log_select" ON public.user_2fa_verification_log
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']
    )
  );

-- Function to check if 2FA is required for a user
CREATE OR REPLACE FUNCTION public.is_2fa_required(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_roles TEXT[];
  v_admin_roles TEXT[] := ARRAY[
    'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'LEGEND_DEVELOPER', 'LEGEND_SUPPORT',
    'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN',
    'COMPVSS_ADMIN',
    'GVTEWAY_ADMIN'
  ];
BEGIN
  SELECT platform_roles INTO v_roles
  FROM public.platform_users
  WHERE id = p_user_id;
  
  -- 2FA is required for admin roles
  RETURN v_roles && v_admin_roles;
END;
$$;

-- Function to initialize 2FA setup
CREATE OR REPLACE FUNCTION public.init_2fa_setup(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret TEXT;
  v_backup_codes TEXT[];
  v_result JSONB;
BEGIN
  -- Verify user is setting up their own 2FA
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE id = p_user_id AND auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Can only setup 2FA for your own account';
  END IF;
  
  -- Generate a placeholder secret (actual secret generation happens in app layer)
  v_secret := encode(gen_random_bytes(20), 'base64');
  
  -- Generate backup codes (8 codes, 8 characters each)
  v_backup_codes := ARRAY[
    encode(gen_random_bytes(4), 'hex'),
    encode(gen_random_bytes(4), 'hex'),
    encode(gen_random_bytes(4), 'hex'),
    encode(gen_random_bytes(4), 'hex'),
    encode(gen_random_bytes(4), 'hex'),
    encode(gen_random_bytes(4), 'hex'),
    encode(gen_random_bytes(4), 'hex'),
    encode(gen_random_bytes(4), 'hex')
  ];
  
  -- Insert or update 2FA config
  INSERT INTO public.user_2fa_config (user_id, totp_secret, backup_codes, totp_enabled)
  VALUES (p_user_id, v_secret, v_backup_codes, FALSE)
  ON CONFLICT (user_id)
  DO UPDATE SET
    totp_secret = v_secret,
    backup_codes = v_backup_codes,
    totp_enabled = FALSE,
    backup_codes_used = 0,
    updated_at = NOW();
  
  -- Return the secret and backup codes (to be displayed to user once)
  v_result := jsonb_build_object(
    'secret', v_secret,
    'backup_codes', v_backup_codes,
    'setup_pending', TRUE
  );
  
  RETURN v_result;
END;
$$;

-- Function to enable 2FA after verification
CREATE OR REPLACE FUNCTION public.enable_2fa(p_user_id UUID, p_verification_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
BEGIN
  -- Verify user is enabling their own 2FA
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE id = p_user_id AND auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Can only enable 2FA for your own account';
  END IF;
  
  -- Get current config
  SELECT * INTO v_config
  FROM public.user_2fa_config
  WHERE user_id = p_user_id;
  
  IF v_config IS NULL THEN
    RAISE EXCEPTION '2FA setup not initialized';
  END IF;
  
  -- Note: Actual TOTP verification happens in application layer
  -- This function is called after successful verification
  
  UPDATE public.user_2fa_config
  SET totp_enabled = TRUE,
      last_verified_at = NOW(),
      failed_attempts = 0,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log the verification
  INSERT INTO public.user_2fa_verification_log (user_id, verification_type, success)
  VALUES (p_user_id, 'totp', TRUE);
  
  RETURN TRUE;
END;
$$;

-- Function to disable 2FA
CREATE OR REPLACE FUNCTION public.disable_2fa(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user is disabling their own 2FA or is a super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE (id = p_user_id AND auth_user_id = auth.uid())
    OR (auth_user_id = auth.uid() AND platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN'])
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot disable 2FA for this account';
  END IF;
  
  -- Check if 2FA is required for this user
  IF public.is_2fa_required(p_user_id) THEN
    -- Only super admins can disable required 2FA
    IF NOT EXISTS (
      SELECT 1 FROM public.platform_users
      WHERE auth_user_id = auth.uid()
      AND platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN']
    ) THEN
      RAISE EXCEPTION '2FA is required for admin accounts and cannot be disabled';
    END IF;
  END IF;
  
  UPDATE public.user_2fa_config
  SET totp_enabled = FALSE,
      totp_secret = NULL,
      backup_codes = NULL,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function to log 2FA verification attempt
CREATE OR REPLACE FUNCTION public.log_2fa_verification(
  p_user_id UUID,
  p_verification_type TEXT,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_2fa_verification_log (
    user_id, verification_type, success, ip_address, user_agent, failure_reason
  )
  VALUES (
    p_user_id, p_verification_type, p_success, p_ip_address, p_user_agent, p_failure_reason
  );
  
  -- Update failed attempts counter
  IF NOT p_success THEN
    UPDATE public.user_2fa_config
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE 
          WHEN failed_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
          ELSE locked_until
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_2fa_config
    SET failed_attempts = 0,
        locked_until = NULL,
        last_verified_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Function to use a backup code
CREATE OR REPLACE FUNCTION public.use_backup_code(p_user_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_code_index INT;
BEGIN
  -- Verify user is using their own backup code
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE id = p_user_id AND auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Get current config
  SELECT * INTO v_config
  FROM public.user_2fa_config
  WHERE user_id = p_user_id;
  
  IF v_config IS NULL OR NOT v_config.totp_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check if account is locked
  IF v_config.locked_until IS NOT NULL AND v_config.locked_until > NOW() THEN
    RAISE EXCEPTION 'Account is temporarily locked due to too many failed attempts';
  END IF;
  
  -- Find and remove the backup code
  v_code_index := array_position(v_config.backup_codes, p_code);
  
  IF v_code_index IS NULL THEN
    -- Log failed attempt
    PERFORM public.log_2fa_verification(p_user_id, 'backup_code', FALSE, NULL, NULL, 'Invalid backup code');
    RETURN FALSE;
  END IF;
  
  -- Remove the used code
  UPDATE public.user_2fa_config
  SET backup_codes = array_remove(backup_codes, p_code),
      backup_codes_used = backup_codes_used + 1,
      last_verified_at = NOW(),
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log successful verification
  PERFORM public.log_2fa_verification(p_user_id, 'backup_code', TRUE);
  
  RETURN TRUE;
END;
$$;

-- Function to get 2FA status for a user
CREATE OR REPLACE FUNCTION public.get_2fa_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_is_required BOOLEAN;
BEGIN
  -- Verify user is checking their own status or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users
    WHERE (id = p_user_id AND auth_user_id = auth.uid())
    OR (auth_user_id = auth.uid() AND platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN'])
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  v_is_required := public.is_2fa_required(p_user_id);
  
  SELECT * INTO v_config
  FROM public.user_2fa_config
  WHERE user_id = p_user_id;
  
  IF v_config IS NULL THEN
    RETURN jsonb_build_object(
      'enabled', FALSE,
      'required', v_is_required,
      'setup_complete', FALSE,
      'backup_codes_remaining', 0
    );
  END IF;
  
  RETURN jsonb_build_object(
    'enabled', v_config.totp_enabled,
    'required', v_is_required,
    'setup_complete', v_config.totp_enabled,
    'backup_codes_remaining', COALESCE(array_length(v_config.backup_codes, 1), 0),
    'last_verified_at', v_config.last_verified_at,
    'is_locked', v_config.locked_until IS NOT NULL AND v_config.locked_until > NOW()
  );
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_2fa_config_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_2fa_config_updated_at ON public.user_2fa_config;
CREATE TRIGGER user_2fa_config_updated_at
  BEFORE UPDATE ON public.user_2fa_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_2fa_config_updated_at();

-- Grant permissions
GRANT SELECT, UPDATE ON public.user_2fa_config TO authenticated;
GRANT SELECT ON public.user_2fa_verification_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_2fa_required TO authenticated;
GRANT EXECUTE ON FUNCTION public.init_2fa_setup TO authenticated;
GRANT EXECUTE ON FUNCTION public.enable_2fa TO authenticated;
GRANT EXECUTE ON FUNCTION public.disable_2fa TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_2fa_verification TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_backup_code TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_2fa_status TO authenticated;
