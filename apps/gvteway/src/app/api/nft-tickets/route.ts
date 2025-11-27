import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const nftTicketSchema = z.object({
  event_id: z.string().uuid(),
  ticket_type_id: z.string().uuid(),
  quantity: z.number().int().positive().max(100),
  blockchain: z.enum(['ethereum', 'polygon', 'solana', 'flow']).default('polygon'),
  nft_metadata: z.object({
    name: z.string(),
    description: z.string(),
    image_url: z.string().url(),
    attributes: z.array(z.object({
      trait_type: z.string(),
      value: z.union([z.string(), z.number()])
    })).optional(),
    animation_url: z.string().url().optional(),
    external_url: z.string().url().optional()
  }),
  royalty_percentage: z.number().min(0).max(10).default(2.5),
  transferable: z.boolean().default(true),
  max_resale_price: z.number().optional()
});

// GET - List NFT tickets or get details
export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const nft_id = searchParams.get('nft_id');
    const user_id = context.user?.id;
    const event_id = searchParams.get('event_id');

    if (nft_id) {
      // Get specific NFT ticket
      const { data: nft, error } = await supabase
        .from('nft_tickets')
        .select(`
          *,
          tickets (
            id,
            user_id,
            status,
            ticket_types (
              name,
              price
            )
          ),
          events (
            id,
            name,
            date,
            venue_id
          ),
          nft_transactions (
            id,
            from_address,
            to_address,
            transaction_hash,
            price,
            timestamp
          )
        `)
        .eq('id', nft_id)
        .single();

      if (error || !nft) {
        return NextResponse.json({ error: 'NFT ticket not found' }, { status: 404 });
      }

      return NextResponse.json({ nft });
    }

    // List user's NFT tickets
    let query = supabase
      .from('nft_tickets')
      .select(`
        *,
        tickets!inner (
          id,
          user_id,
          status
        ),
        events (
          id,
          name,
          date
        )
      `)
      .order('created_at', { ascending: false });

    if (user_id) {
      query = query.eq('tickets.user_id', user_id);
    }

    if (event_id) {
      query = query.eq('event_id', event_id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ nft_tickets: data });
  },
  {
    auth: true,
    audit: { action: 'nft_tickets:list', resource: 'nft_tickets' }
  }
);

// POST - Mint NFT tickets or transfer
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { action } = body;

    if (action === 'mint') {
      const validated = nftTicketSchema.parse(body.data);

      // Verify event exists and user has permission
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', validated.event_id)
        .single();

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Generate NFT metadata
      const metadata = {
        ...validated.nft_metadata,
        properties: {
          event_id: validated.event_id,
          event_name: event.name,
          event_date: event.date,
          blockchain: validated.blockchain,
          royalty_percentage: validated.royalty_percentage
        }
      };

      // Create NFT tickets (this would integrate with actual blockchain)
      const nftTickets = [];
      for (let i = 0; i < validated.quantity; i++) {
        const tokenId = generateTokenId();
        
        const { data: nft, error } = await supabase
          .from('nft_tickets')
          .insert({
            event_id: validated.event_id,
            ticket_type_id: validated.ticket_type_id,
            token_id: tokenId,
            blockchain: validated.blockchain,
            metadata: metadata,
            contract_address: getContractAddress(validated.blockchain),
            royalty_percentage: validated.royalty_percentage,
            transferable: validated.transferable,
            max_resale_price: validated.max_resale_price,
            minted_by: context.user.id,
            status: 'pending_mint'
          })
          .select()
          .single();

        if (!error && nft) {
          nftTickets.push(nft);
        }
      }

      // In production, this would trigger blockchain minting
      // await mintOnBlockchain(nftTickets, validated.blockchain);

      return NextResponse.json({
        nft_tickets: nftTickets,
        message: `${validated.quantity} NFT tickets queued for minting`,
        estimated_gas_fee: estimateGasFee(validated.blockchain, validated.quantity)
      }, { status: 201 });
    }

    if (action === 'transfer') {
      const { nft_id, to_address, to_user_id, price } = body;

      // Get NFT ticket
      const { data: nft } = await supabase
        .from('nft_tickets')
        .select('*, tickets(*)')
        .eq('id', nft_id)
        .single();

      if (!nft) {
        return NextResponse.json({ error: 'NFT not found' }, { status: 404 });
      }

      // Verify ownership
      if (nft.tickets.user_id !== context.user.id) {
        return NextResponse.json({ error: 'Not the owner' }, { status: 403 });
      }

      // Check if transferable
      if (!nft.transferable) {
        return NextResponse.json({ error: 'This NFT is non-transferable' }, { status: 400 });
      }

      // Check max resale price
      if (nft.max_resale_price && price && price > nft.max_resale_price) {
        return NextResponse.json({
          error: `Price exceeds maximum resale price of ${nft.max_resale_price}`
        }, { status: 400 });
      }

      // Create transaction record
      const { data: transaction, error } = await supabase
        .from('nft_transactions')
        .insert({
          nft_id,
          from_address: nft.owner_address,
          to_address,
          from_user_id: context.user.id,
          to_user_id,
          price,
          transaction_type: price ? 'sale' : 'transfer',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // In production, execute blockchain transfer
      // const txHash = await transferOnBlockchain(nft, to_address);

      return NextResponse.json({
        transaction,
        message: 'Transfer initiated',
        royalty_fee: price ? (price * nft.royalty_percentage) / 100 : 0
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    audit: { action: 'nft_tickets:create', resource: 'nft_tickets' }
  }
);

// Helper functions
function generateTokenId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getContractAddress(blockchain: string): string {
  const contracts: Record<string, string> = {
    ethereum: '0x0000000000000000000000000000000000000000',
    polygon: '0x0000000000000000000000000000000000000000',
    solana: 'So1ana11111111111111111111111111111111111',
    flow: 'A.0x01.NFTContract'
  };
  return contracts[blockchain] || '';
}

function estimateGasFee(blockchain: string, quantity: number): number {
  const baseFees: Record<string, number> = {
    ethereum: 50,
    polygon: 0.01,
    solana: 0.00025,
    flow: 0.001
  };
  return (baseFees[blockchain] || 0) * quantity;
}

// PUT - Update NFT metadata or status
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { nft_id, updates, action } = body;

    if (!nft_id) {
      return NextResponse.json({ error: 'nft_id is required' }, { status: 400 });
    }

    if (action === 'confirm_mint') {
      const { transaction_hash, token_id, owner_address } = updates;

      const { error } = await supabase
        .from('nft_tickets')
        .update({
          status: 'minted',
          transaction_hash,
          token_id,
          owner_address,
          minted_at: new Date().toISOString()
        })
        .eq('id', nft_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'NFT minting confirmed' });
    }

    // Update metadata
    const { data, error } = await supabase
      .from('nft_tickets')
      .update(updates)
      .eq('id', nft_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ nft: data });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'nft_tickets:update', resource: 'nft_tickets' }
  }
);

// DELETE - Burn NFT ticket
export const DELETE = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const nft_id = searchParams.get('nft_id');

    if (!nft_id) {
      return NextResponse.json({ error: 'nft_id is required' }, { status: 400 });
    }

    // Get NFT
    const { data: nft } = await supabase
      .from('nft_tickets')
      .select('*, tickets(*)')
      .eq('id', nft_id)
      .single();

    if (!nft || nft.tickets.user_id !== context.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Burn NFT (mark as burned, actual blockchain burn would happen here)
    const { error } = await supabase
      .from('nft_tickets')
      .update({
        status: 'burned',
        burned_at: new Date().toISOString(),
        burned_by: context.user.id
      })
      .eq('id', nft_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'NFT ticket burned successfully' });
  },
  {
    auth: true,
    audit: { action: 'nft_tickets:burn', resource: 'nft_tickets' }
  }
);
