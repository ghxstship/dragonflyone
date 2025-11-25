-- Migration: Tours and Ticket Deliveries
-- Adds support for multi-city tours and ticket delivery tracking

-- Tours Table
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  tour_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tour Dates Table
CREATE TABLE IF NOT EXISTS tour_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'USA',
  venue VARCHAR(255) NOT NULL,
  price_min DECIMAL(10, 2),
  tickets_available INTEGER,
  status VARCHAR(20) DEFAULT 'announced' CHECK (status IN ('announced', 'presale', 'on_sale', 'sold_out', 'cancelled')),
  on_sale_date TIMESTAMPTZ,
  presale_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Deliveries Table
CREATE TABLE IF NOT EXISTS ticket_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'mobile', 'physical', 'will_call')),
  delivery_status VARCHAR(20) DEFAULT 'processing' CHECK (delivery_status IN ('processing', 'sent', 'delivered', 'ready', 'failed')),
  tracking_number VARCHAR(100),
  carrier VARCHAR(50),
  estimated_delivery DATE,
  delivered_at TIMESTAMPTZ,
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(255),
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tours_artist ON tours(artist_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tour_dates_tour ON tour_dates(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_dates_event ON tour_dates(event_id);
CREATE INDEX IF NOT EXISTS idx_tour_dates_date ON tour_dates(date);
CREATE INDEX IF NOT EXISTS idx_tour_dates_city ON tour_dates(city, state);

CREATE INDEX IF NOT EXISTS idx_ticket_deliveries_order ON ticket_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_ticket_deliveries_user ON ticket_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_deliveries_status ON ticket_deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_ticket_deliveries_tracking ON ticket_deliveries(tracking_number);

-- RLS Policies
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_deliveries ENABLE ROW LEVEL SECURITY;

-- Anyone can view active tours
CREATE POLICY "Anyone can view active tours" ON tours
  FOR SELECT USING (status = 'active');

-- Anyone can view tour dates
CREATE POLICY "Anyone can view tour dates" ON tour_dates
  FOR SELECT USING (TRUE);

-- Users can view their own deliveries
CREATE POLICY "Users can view their deliveries" ON ticket_deliveries
  FOR SELECT USING (user_id = auth.uid());

-- Admins can manage tours
CREATE POLICY "Admins can manage tours" ON tours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can manage tour dates
CREATE POLICY "Admins can manage tour dates" ON tour_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can manage deliveries
CREATE POLICY "Admins can manage deliveries" ON ticket_deliveries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to create delivery record when order is placed
CREATE OR REPLACE FUNCTION create_ticket_delivery()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ticket_deliveries (
    order_id,
    user_id,
    delivery_method,
    delivery_status,
    recipient_email,
    recipient_name
  )
  VALUES (
    NEW.id,
    NEW.user_id,
    COALESCE(NEW.delivery_method, 'email'),
    'processing',
    NEW.email,
    NEW.customer_name
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_delivery_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION create_ticket_delivery();

-- Updated at triggers
CREATE TRIGGER tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tour_dates_updated_at
  BEFORE UPDATE ON tour_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ticket_deliveries_updated_at
  BEFORE UPDATE ON ticket_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
