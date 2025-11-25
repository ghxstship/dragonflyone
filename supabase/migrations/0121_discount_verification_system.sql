-- Migration: Discount Verification System
-- Description: Tables for student/military/senior discount verification

-- Discount verifications table
CREATE TABLE IF NOT EXISTS discount_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('student', 'military', 'senior', 'first_responder', 'healthcare', 'teacher', 'veteran', 'disability')),
  verification_method TEXT NOT NULL CHECK (verification_method IN ('sheerid', 'id_me', 'manual', 'document', 'demo')),
  verification_id TEXT,
  provider_response JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'rejected', 'expired', 'revoked')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rejected_reason TEXT,
  document_urls TEXT[],
  institution_name TEXT,
  institution_id TEXT,
  graduation_year INT,
  military_branch TEXT,
  military_status TEXT,
  service_dates JSONB,
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_verifications_user ON discount_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_verifications_type ON discount_verifications(discount_type);
CREATE INDEX IF NOT EXISTS idx_discount_verifications_status ON discount_verifications(status);
CREATE INDEX IF NOT EXISTS idx_discount_verifications_expires ON discount_verifications(expires_at);

-- Discount types configuration
CREATE TABLE IF NOT EXISTS discount_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_percent NUMERIC(5,2) NOT NULL,
  discount_amount NUMERIC(10,2),
  requires_verification BOOLEAN DEFAULT true,
  verification_methods TEXT[] DEFAULT ARRAY['sheerid', 'id_me'],
  verification_frequency TEXT DEFAULT 'annual' CHECK (verification_frequency IN ('once', 'annual', 'per_purchase', 'per_event')),
  min_age INT,
  max_age INT,
  eligible_events UUID[],
  excluded_events UUID[],
  stackable BOOLEAN DEFAULT false,
  max_uses_per_user INT,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_discount_types_org ON discount_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_discount_types_code ON discount_types(code);
CREATE INDEX IF NOT EXISTS idx_discount_types_active ON discount_types(is_active);

-- Discount usage tracking
CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  discount_type_id UUID REFERENCES discount_types(id),
  verification_id UUID REFERENCES discount_verifications(id),
  order_id UUID REFERENCES orders(id),
  event_id UUID REFERENCES events(id),
  discount_type TEXT NOT NULL,
  discount_percent NUMERIC(5,2),
  discount_amount NUMERIC(10,2),
  original_amount NUMERIC(10,2),
  final_amount NUMERIC(10,2),
  savings NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_usage_user ON discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_order ON discount_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_type ON discount_usage(discount_type);

-- Function to get user's available discounts
CREATE OR REPLACE FUNCTION get_user_available_discounts(p_user_id UUID, p_event_id UUID DEFAULT NULL)
RETURNS TABLE (
  discount_type TEXT,
  discount_percent NUMERIC,
  verification_id UUID,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dv.discount_type,
    CASE dv.discount_type
      WHEN 'student' THEN 15::NUMERIC
      WHEN 'military' THEN 20::NUMERIC
      WHEN 'senior' THEN 10::NUMERIC
      WHEN 'first_responder' THEN 15::NUMERIC
      WHEN 'healthcare' THEN 15::NUMERIC
      WHEN 'teacher' THEN 10::NUMERIC
      WHEN 'veteran' THEN 20::NUMERIC
      WHEN 'disability' THEN 15::NUMERIC
      ELSE 0::NUMERIC
    END as discount_percent,
    dv.id as verification_id,
    dv.expires_at
  FROM discount_verifications dv
  WHERE dv.user_id = p_user_id
    AND dv.status = 'verified'
    AND (dv.expires_at IS NULL OR dv.expires_at > NOW());
END;
$$;

-- Function to apply discount to order
CREATE OR REPLACE FUNCTION apply_discount_to_order(
  p_order_id UUID,
  p_user_id UUID,
  p_verification_id UUID,
  p_original_amount NUMERIC
)
RETURNS TABLE (
  success BOOLEAN,
  discount_amount NUMERIC,
  final_amount NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_verification RECORD;
  v_discount_percent NUMERIC;
  v_discount_amount NUMERIC;
  v_final_amount NUMERIC;
BEGIN
  -- Get verification
  SELECT * INTO v_verification
  FROM discount_verifications
  WHERE id = p_verification_id
    AND user_id = p_user_id
    AND status = 'verified'
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, p_original_amount, 'Invalid or expired verification';
    RETURN;
  END IF;
  
  -- Get discount percent
  v_discount_percent := CASE v_verification.discount_type
    WHEN 'student' THEN 15
    WHEN 'military' THEN 20
    WHEN 'senior' THEN 10
    WHEN 'first_responder' THEN 15
    WHEN 'healthcare' THEN 15
    WHEN 'teacher' THEN 10
    WHEN 'veteran' THEN 20
    WHEN 'disability' THEN 15
    ELSE 0
  END;
  
  v_discount_amount := ROUND(p_original_amount * (v_discount_percent / 100), 2);
  v_final_amount := p_original_amount - v_discount_amount;
  
  -- Record usage
  INSERT INTO discount_usage (
    user_id, verification_id, order_id, discount_type, discount_percent,
    discount_amount, original_amount, final_amount, savings
  )
  VALUES (
    p_user_id, p_verification_id, p_order_id, v_verification.discount_type, v_discount_percent,
    v_discount_amount, p_original_amount, v_final_amount, v_discount_amount
  );
  
  RETURN QUERY SELECT TRUE, v_discount_amount, v_final_amount, NULL::TEXT;
END;
$$;

-- Insert default discount types
INSERT INTO discount_types (code, name, description, discount_percent, requires_verification, verification_methods)
VALUES 
  ('student', 'Student Discount', 'Valid for currently enrolled students', 15, true, ARRAY['sheerid', 'id_me']),
  ('military', 'Military Discount', 'Active duty military personnel', 20, true, ARRAY['id_me', 'manual']),
  ('veteran', 'Veteran Discount', 'Military veterans', 20, true, ARRAY['id_me', 'manual']),
  ('senior', 'Senior Discount', 'Ages 65 and older', 10, true, ARRAY['manual']),
  ('first_responder', 'First Responder Discount', 'Police, fire, and EMT', 15, true, ARRAY['id_me', 'manual']),
  ('healthcare', 'Healthcare Worker Discount', 'Doctors, nurses, and healthcare staff', 15, true, ARRAY['id_me', 'manual']),
  ('teacher', 'Teacher Discount', 'K-12 and college educators', 10, true, ARRAY['sheerid', 'id_me'])
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE discount_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON discount_verifications TO authenticated;
GRANT SELECT ON discount_types TO authenticated;
GRANT SELECT, INSERT ON discount_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_available_discounts(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_discount_to_order(UUID, UUID, UUID, NUMERIC) TO authenticated;
