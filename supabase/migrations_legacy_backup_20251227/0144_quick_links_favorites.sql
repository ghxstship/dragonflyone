-- =============================================================================
-- QUICK LINKS / FORMS FAVORITES
-- User-favorited quick links for dashboard shortcuts (max 10 per user)
-- =============================================================================

-- Quick Links Master Table (forms library)
CREATE TABLE IF NOT EXISTS quick_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  href TEXT NOT NULL,
  icon TEXT DEFAULT 'Link',
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'projects', 'finance', 'assets', 'crm', 'reports', 'settings', 'general'
  )),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Quick Link Favorites (max 10 per user enforced via trigger)
CREATE TABLE IF NOT EXISTS user_quick_link_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quick_link_id UUID NOT NULL REFERENCES quick_links(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, quick_link_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quick_links_category ON quick_links(category);
CREATE INDEX IF NOT EXISTS idx_quick_links_active ON quick_links(is_active);
CREATE INDEX IF NOT EXISTS idx_quick_links_sort ON quick_links(sort_order);
CREATE INDEX IF NOT EXISTS idx_user_quick_link_favorites_user ON user_quick_link_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quick_link_favorites_link ON user_quick_link_favorites(quick_link_id);

-- Enable RLS
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quick_link_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quick_links (read-only for all authenticated users)
CREATE POLICY "quick_links_select_policy" ON quick_links
  FOR SELECT USING (true);

CREATE POLICY "quick_links_insert_policy" ON quick_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "quick_links_update_policy" ON quick_links
  FOR UPDATE USING (true);

-- RLS Policies for user_quick_link_favorites
CREATE POLICY "user_quick_link_favorites_select_policy" ON user_quick_link_favorites
  FOR SELECT USING (true);

CREATE POLICY "user_quick_link_favorites_insert_policy" ON user_quick_link_favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_quick_link_favorites_update_policy" ON user_quick_link_favorites
  FOR UPDATE USING (true);

CREATE POLICY "user_quick_link_favorites_delete_policy" ON user_quick_link_favorites
  FOR DELETE USING (true);

-- Function to enforce max 10 favorites per user
CREATE OR REPLACE FUNCTION check_max_quick_link_favorites()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM user_quick_link_favorites WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 quick link favorites allowed per user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_quick_link_favorites
  BEFORE INSERT ON user_quick_link_favorites
  FOR EACH ROW
  EXECUTE FUNCTION check_max_quick_link_favorites();

-- Updated_at trigger for quick_links
CREATE TRIGGER set_quick_links_updated_at
  BEFORE UPDATE ON quick_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data: Master forms library
INSERT INTO quick_links (name, description, href, icon, category, sort_order) VALUES
  -- Projects
  ('Create New Project', 'Start a new project from scratch', '/projects/new', 'FolderPlus', 'projects', 1),
  ('Project Templates', 'Browse and use project templates', '/projects/templates', 'FileTemplate', 'projects', 2),
  ('Project Import', 'Import project from external source', '/projects/import', 'Upload', 'projects', 3),
  
  -- Finance
  ('Submit Expense Report', 'Submit a new expense for reimbursement', '/expenses/new', 'Receipt', 'finance', 10),
  ('Create Invoice', 'Generate a new invoice', '/invoices/new', 'FileText', 'finance', 11),
  ('Budget Request', 'Request budget allocation', '/budgets/request', 'DollarSign', 'finance', 12),
  ('Payment Request', 'Submit a payment request', '/finance/payments/new', 'CreditCard', 'finance', 13),
  ('Purchase Order', 'Create a new purchase order', '/procurement/orders/new', 'ShoppingCart', 'finance', 14),
  
  -- Assets
  ('Check Asset Availability', 'View asset availability calendar', '/assets/availability', 'Calendar', 'assets', 20),
  ('Reserve Asset', 'Reserve equipment or resources', '/assets/reserve', 'Package', 'assets', 21),
  ('Report Asset Issue', 'Report damage or maintenance need', '/assets/issues/new', 'AlertTriangle', 'assets', 22),
  ('Asset Checkout', 'Check out an asset', '/assets/checkout', 'LogOut', 'assets', 23),
  
  -- CRM
  ('Add New Contact', 'Create a new contact record', '/contacts/new', 'UserPlus', 'crm', 30),
  ('Create Deal', 'Start a new deal in pipeline', '/deals/new', 'Handshake', 'crm', 31),
  ('Log Activity', 'Log a call, meeting, or note', '/crm/activities/new', 'MessageSquare', 'crm', 32),
  ('Send Proposal', 'Create and send a proposal', '/quotes/new', 'Send', 'crm', 33),
  ('Schedule Meeting', 'Schedule a meeting with contacts', '/crm/calendar/new', 'CalendarPlus', 'crm', 34),
  
  -- Reports
  ('Generate Financial Report', 'Create financial summary report', '/reports/financial/new', 'FileBarChart', 'reports', 40),
  ('Export Data', 'Export data to CSV or Excel', '/reports/export', 'Download', 'reports', 41),
  ('Dashboard Builder', 'Create custom dashboard', '/analytics/dashboard-builder', 'LayoutGrid', 'reports', 42),
  ('KPI Report', 'Generate KPI performance report', '/analytics/kpi/report', 'Target', 'reports', 43),
  
  -- Settings
  ('User Settings', 'Manage your account settings', '/settings/profile', 'User', 'settings', 50),
  ('Notification Preferences', 'Configure notification settings', '/settings/notifications', 'Bell', 'settings', 51),
  ('Integration Settings', 'Manage connected apps', '/integrations', 'Plug', 'settings', 52),
  ('Team Management', 'Manage team members and roles', '/settings/team', 'Users', 'settings', 53),
  
  -- General
  ('Help Center', 'Browse help documentation', '/help', 'HelpCircle', 'general', 60),
  ('Submit Feedback', 'Send feedback to the team', '/help/feedback', 'MessageCircle', 'general', 61),
  ('Keyboard Shortcuts', 'View all keyboard shortcuts', '/help/shortcuts', 'Keyboard', 'general', 62),
  ('What''s New', 'See latest updates and features', '/help/changelog', 'Sparkles', 'general', 63)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT ON quick_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_quick_link_favorites TO authenticated;
