-- Migration: NFT Tickets System
-- Description: Tables for NFT tickets, transactions, and blockchain integration

-- NFT tickets table
CREATE TABLE IF NOT EXISTS nft_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_id UUID REFERENCES tickets(id),
  ticket_type_id UUID REFERENCES event_ticket_types(id),
  token_id TEXT,
  blockchain TEXT NOT NULL CHECK (blockchain IN ('ethereum', 'polygon', 'solana', 'flow', 'base', 'arbitrum')),
  contract_address TEXT,
  owner_address TEXT,
  metadata JSONB NOT NULL,
  metadata_uri TEXT,
  image_url TEXT,
  animation_url TEXT,
  royalty_percentage NUMERIC(5,2) DEFAULT 2.5,
  transferable BOOLEAN DEFAULT true,
  max_resale_price NUMERIC(15,2),
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending_mint' CHECK (status IN ('pending_mint', 'minting', 'minted', 'transferred', 'burned', 'error')),
  minted_at TIMESTAMPTZ,
  minted_by UUID REFERENCES platform_users(id),
  burned_at TIMESTAMPTZ,
  burned_by UUID REFERENCES platform_users(id),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nft_tickets_event ON nft_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_nft_tickets_ticket ON nft_tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_nft_tickets_token ON nft_tickets(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_tickets_owner ON nft_tickets(owner_address);
CREATE INDEX IF NOT EXISTS idx_nft_tickets_status ON nft_tickets(status);
CREATE INDEX IF NOT EXISTS idx_nft_tickets_blockchain ON nft_tickets(blockchain);

-- NFT transactions table
CREATE TABLE IF NOT EXISTS nft_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID NOT NULL REFERENCES nft_tickets(id),
  from_address TEXT,
  to_address TEXT NOT NULL,
  from_user_id UUID REFERENCES platform_users(id),
  to_user_id UUID REFERENCES platform_users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'transfer', 'sale', 'burn', 'list', 'delist')),
  price NUMERIC(15,2),
  currency TEXT DEFAULT 'USD',
  crypto_amount NUMERIC(20,8),
  crypto_currency TEXT,
  royalty_amount NUMERIC(15,2),
  platform_fee NUMERIC(15,2),
  gas_fee NUMERIC(15,8),
  transaction_hash TEXT,
  block_number BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'confirmed', 'failed', 'cancelled')),
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nft_transactions_nft ON nft_transactions(nft_id);
CREATE INDEX IF NOT EXISTS idx_nft_transactions_from ON nft_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_nft_transactions_to ON nft_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_nft_transactions_hash ON nft_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_nft_transactions_status ON nft_transactions(status);

-- NFT collections table
CREATE TABLE IF NOT EXISTS nft_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  symbol TEXT,
  description TEXT,
  blockchain TEXT NOT NULL,
  contract_address TEXT,
  contract_type TEXT CHECK (contract_type IN ('ERC721', 'ERC1155', 'SPL', 'Flow')),
  total_supply INT,
  minted_count INT DEFAULT 0,
  royalty_percentage NUMERIC(5,2) DEFAULT 2.5,
  royalty_recipient TEXT,
  base_uri TEXT,
  cover_image TEXT,
  banner_image TEXT,
  external_link TEXT,
  is_revealed BOOLEAN DEFAULT true,
  reveal_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nft_collections_org ON nft_collections(organization_id);
CREATE INDEX IF NOT EXISTS idx_nft_collections_event ON nft_collections(event_id);
CREATE INDEX IF NOT EXISTS idx_nft_collections_contract ON nft_collections(contract_address);

-- NFT marketplace listings table
CREATE TABLE IF NOT EXISTS nft_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID NOT NULL REFERENCES nft_tickets(id),
  seller_id UUID NOT NULL REFERENCES platform_users(id),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('fixed_price', 'auction', 'dutch_auction')),
  price NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  crypto_price NUMERIC(20,8),
  crypto_currency TEXT,
  start_price NUMERIC(15,2),
  end_price NUMERIC(15,2),
  auction_end_time TIMESTAMPTZ,
  min_bid_increment NUMERIC(15,2),
  highest_bid NUMERIC(15,2),
  highest_bidder_id UUID REFERENCES platform_users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'expired')),
  listed_at TIMESTAMPTZ DEFAULT NOW(),
  sold_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nft_listings_nft ON nft_listings(nft_id);
CREATE INDEX IF NOT EXISTS idx_nft_listings_seller ON nft_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_nft_listings_status ON nft_listings(status);

-- NFT bids table
CREATE TABLE IF NOT EXISTS nft_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES nft_listings(id),
  bidder_id UUID NOT NULL REFERENCES platform_users(id),
  amount NUMERIC(15,2) NOT NULL,
  crypto_amount NUMERIC(20,8),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'accepted', 'rejected', 'cancelled')),
  bid_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nft_bids_listing ON nft_bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_nft_bids_bidder ON nft_bids(bidder_id);

-- NFT royalty payments table
CREATE TABLE IF NOT EXISTS nft_royalty_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES nft_transactions(id),
  recipient_address TEXT NOT NULL,
  recipient_user_id UUID REFERENCES platform_users(id),
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  crypto_amount NUMERIC(20,8),
  crypto_currency TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nft_royalty_payments_transaction ON nft_royalty_payments(transaction_id);

-- Function to update NFT owner after transfer
CREATE OR REPLACE FUNCTION update_nft_owner_after_transfer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND NEW.transaction_type IN ('transfer', 'sale') THEN
    UPDATE nft_tickets SET
      owner_address = NEW.to_address,
      status = 'transferred',
      updated_at = NOW()
    WHERE id = NEW.nft_id;
    
    -- Update ticket ownership if to_user_id is provided
    IF NEW.to_user_id IS NOT NULL THEN
      UPDATE tickets SET
        user_id = NEW.to_user_id,
        updated_at = NOW()
      WHERE id = (SELECT ticket_id FROM nft_tickets WHERE id = NEW.nft_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nft_transfer_owner_trigger ON nft_transactions;
CREATE TRIGGER nft_transfer_owner_trigger
  AFTER UPDATE ON nft_transactions
  FOR EACH ROW
  WHEN (OLD.status != 'confirmed' AND NEW.status = 'confirmed')
  EXECUTE FUNCTION update_nft_owner_after_transfer();

-- Function to update collection minted count
CREATE OR REPLACE FUNCTION update_collection_minted_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'minted' AND (OLD.status IS NULL OR OLD.status != 'minted') THEN
    UPDATE nft_collections SET
      minted_count = minted_count + 1,
      updated_at = NOW()
    WHERE event_id = NEW.event_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nft_minted_count_trigger ON nft_tickets;
CREATE TRIGGER nft_minted_count_trigger
  AFTER INSERT OR UPDATE ON nft_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_minted_count();

-- RLS policies
ALTER TABLE nft_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_royalty_payments ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON nft_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON nft_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON nft_collections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON nft_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON nft_bids TO authenticated;
GRANT SELECT ON nft_royalty_payments TO authenticated;
