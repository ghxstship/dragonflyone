import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketPrice = parseFloat(searchParams.get('ticket_price') || '0');

    // Calculate insurance options
    const options = [
      {
        id: 'basic',
        name: 'Basic Protection',
        price: Math.round(ticketPrice * 0.08 * 100) / 100,
        coverage: ['Event cancellation', 'Illness/injury'],
        coverage_percent: 100
      },
      {
        id: 'premium',
        name: 'Premium Protection',
        price: Math.round(ticketPrice * 0.12 * 100) / 100,
        coverage: ['Event cancellation', 'Illness/injury', 'Travel delays', 'Weather'],
        coverage_percent: 100
      },
      {
        id: 'flex',
        name: 'Flex Protection',
        price: Math.round(ticketPrice * 0.15 * 100) / 100,
        coverage: ['Any reason cancellation', 'Full refund up to 24h before'],
        coverage_percent: 100
      }
    ];

    return NextResponse.json({ insurance_options: options });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { order_id, ticket_ids, insurance_type, premium_amount } = body;

    const { data, error } = await supabase.from('ticket_insurance').insert({
      order_id, user_id: user.id, ticket_ids, insurance_type,
      premium_amount, status: 'active',
      coverage_start: new Date().toISOString(),
      policy_number: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ insurance: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to purchase insurance' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { insurance_id, action, claim_reason, documentation_urls } = body;

    if (action === 'file_claim') {
      const { data: insurance } = await supabase.from('ticket_insurance')
        .select('*').eq('id', insurance_id).eq('user_id', user.id).single();

      if (!insurance) {
        return NextResponse.json({ error: 'Insurance not found' }, { status: 404 });
      }

      const { data, error } = await supabase.from('insurance_claims').insert({
        insurance_id, user_id: user.id, claim_reason,
        documentation_urls: documentation_urls || [],
        status: 'pending', submitted_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ claim: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
