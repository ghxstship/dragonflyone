-- Migration: Group Orders System
-- Description: Tables for group ticket purchases, members, and discounts

-- Group orders table
CREATE TABLE IF NOT EXISTS group_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID NOT NULL REFERENCES events(id),
  organizer_id UUID NOT NULL REFERENCES platform_users(id),
  group_name TEXT NOT NULL,
  description TEXT,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  quantity INT NOT NULL,
  min_quantity INT DEFAULT 5,
  max_quantity INT,
  base_price NUMERIC(15,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  service_fee NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(15,2) NOT NULL,
  price_per_ticket NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'collecting', 'payment_pending', 'paid', 'confirmed', 'cancelled', 'expired')),
  payment_method TEXT,
  payment_deadline TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  confirmed_members INT DEFAULT 0,
  pending_members INT DEFAULT 0,
  seats_assigned BOOLEAN DEFAULT false,
  section TEXT,
  row TEXT,
  seat_start INT,
  special_requests TEXT,
  internal_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_orders_event ON group_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_group_orders_organizer ON group_orders(organizer_id);
CREATE INDEX IF NOT EXISTS idx_group_orders_status ON group_orders(status);
CREATE INDEX IF NOT EXISTS idx_group_orders_deadline ON group_orders(payment_deadline);

-- Group order members table
CREATE TABLE IF NOT EXISTS group_order_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'pending', 'confirmed', 'paid', 'cancelled', 'declined')),
  is_organizer BOOLEAN DEFAULT false,
  invite_token TEXT UNIQUE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  amount_paid NUMERIC(10,2),
  payment_method TEXT,
  ticket_id UUID REFERENCES tickets(id),
  seat TEXT,
  dietary_restrictions TEXT,
  accessibility_needs TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_order_members_group ON group_order_members(group_order_id);
CREATE INDEX IF NOT EXISTS idx_group_order_members_user ON group_order_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_order_members_email ON group_order_members(email);
CREATE INDEX IF NOT EXISTS idx_group_order_members_token ON group_order_members(invite_token);
CREATE INDEX IF NOT EXISTS idx_group_order_members_status ON group_order_members(status);

-- Group discount tiers table
CREATE TABLE IF NOT EXISTS group_discount_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  min_quantity INT NOT NULL,
  max_quantity INT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_per_ticket', 'fixed_total')),
  discount_value NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_discount_tiers_org ON group_discount_tiers(organization_id);
CREATE INDEX IF NOT EXISTS idx_group_discount_tiers_event ON group_discount_tiers(event_id);

-- Group order payments table
CREATE TABLE IF NOT EXISTS group_order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id),
  member_id UUID REFERENCES group_order_members(id),
  user_id UUID REFERENCES platform_users(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('full', 'partial', 'member_share', 'organizer_cover')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  provider TEXT,
  provider_payment_id TEXT,
  processed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_order_payments_group ON group_order_payments(group_order_id);
CREATE INDEX IF NOT EXISTS idx_group_order_payments_member ON group_order_payments(member_id);
CREATE INDEX IF NOT EXISTS idx_group_order_payments_status ON group_order_payments(status);

-- Group order activity log
CREATE TABLE IF NOT EXISTS group_order_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'member_invited', 'member_joined', 'member_declined', 'member_removed', 'payment_received', 'status_changed', 'reminder_sent', 'tickets_assigned', 'cancelled')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_order_activity_group ON group_order_activity(group_order_id);
CREATE INDEX IF NOT EXISTS idx_group_order_activity_type ON group_order_activity(activity_type);

-- Function to calculate group discount
CREATE OR REPLACE FUNCTION calculate_group_discount(
  p_event_id UUID,
  p_quantity INT
)
RETURNS TABLE (
  discount_percent NUMERIC,
  discount_type TEXT,
  tier_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gdt.discount_value,
    gdt.discount_type,
    gdt.name
  FROM group_discount_tiers gdt
  WHERE (gdt.event_id = p_event_id OR gdt.event_id IS NULL)
    AND gdt.is_active = TRUE
    AND gdt.min_quantity <= p_quantity
    AND (gdt.max_quantity IS NULL OR gdt.max_quantity >= p_quantity)
    AND (gdt.valid_from IS NULL OR gdt.valid_from <= NOW())
    AND (gdt.valid_until IS NULL OR gdt.valid_until >= NOW())
  ORDER BY gdt.discount_value DESC
  LIMIT 1;
  
  -- Default tiers if no custom tiers exist
  IF NOT FOUND THEN
    IF p_quantity >= 20 THEN
      RETURN QUERY SELECT 15::NUMERIC, 'percentage'::TEXT, 'Large Group (20+)'::TEXT;
    ELSIF p_quantity >= 10 THEN
      RETURN QUERY SELECT 10::NUMERIC, 'percentage'::TEXT, 'Medium Group (10-19)'::TEXT;
    ELSIF p_quantity >= 5 THEN
      RETURN QUERY SELECT 5::NUMERIC, 'percentage'::TEXT, 'Small Group (5-9)'::TEXT;
    ELSE
      RETURN QUERY SELECT 0::NUMERIC, 'percentage'::TEXT, 'No Discount'::TEXT;
    END IF;
  END IF;
END;
$$;

-- Function to update group order member counts
CREATE OR REPLACE FUNCTION update_group_order_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE group_orders SET
    confirmed_members = (SELECT COUNT(*) FROM group_order_members WHERE group_order_id = COALESCE(NEW.group_order_id, OLD.group_order_id) AND status IN ('confirmed', 'paid')),
    pending_members = (SELECT COUNT(*) FROM group_order_members WHERE group_order_id = COALESCE(NEW.group_order_id, OLD.group_order_id) AND status IN ('invited', 'pending')),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.group_order_id, OLD.group_order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS group_order_member_counts_trigger ON group_order_members;
CREATE TRIGGER group_order_member_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON group_order_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_order_counts();

-- Function to check group order deadline
CREATE OR REPLACE FUNCTION check_group_order_deadlines()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_expired INT;
BEGIN
  UPDATE group_orders SET
    status = 'expired'
  WHERE status IN ('pending', 'collecting', 'payment_pending')
    AND payment_deadline < NOW();
  
  GET DIAGNOSTICS v_expired = ROW_COUNT;
  
  RETURN v_expired;
END;
$$;

-- RLS policies
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_order_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_discount_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_order_activity ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON group_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_order_members TO authenticated;
GRANT SELECT ON group_discount_tiers TO authenticated;
GRANT SELECT, INSERT ON group_order_payments TO authenticated;
GRANT SELECT, INSERT ON group_order_activity TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_group_discount(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_group_order_deadlines() TO authenticated;
