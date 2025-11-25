-- Migration: NLP Search and Demand Forecasting
-- Description: Tables for natural language search and demand forecasting features

-- User searches
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  query TEXT NOT NULL,
  clicked_result_id UUID,
  clicked_result_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_searches_user ON user_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_created ON user_searches(created_at);

-- Order items for inventory forecasting
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Add product_category to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_category TEXT;

-- Add reorder_point to merchandise_products
ALTER TABLE merchandise_products ADD COLUMN IF NOT EXISTS reorder_point INT DEFAULT 10;

-- Function to upsert search analytics
CREATE OR REPLACE FUNCTION upsert_search_analytics(p_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO search_analytics (query, count, last_searched_at)
  VALUES (p_query, 1, NOW())
  ON CONFLICT (query) DO UPDATE
  SET count = search_analytics.count + 1,
      last_searched_at = NOW();
END;
$$;

-- RLS policies
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT ON user_searches TO authenticated;
GRANT SELECT ON order_items TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_search_analytics(TEXT) TO authenticated;
