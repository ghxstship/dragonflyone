import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Event listing on third-party aggregators
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (eventId) {
      const { data } = await supabase.from('event_listings').select('*').eq('event_id', eventId);
      return NextResponse.json({ listings: data });
    }

    // Get available aggregators
    const { data, error } = await supabase.from('listing_aggregators').select('*')
      .eq('active', true);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ aggregators: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'publish') {
      const { event_id, aggregator_ids } = body;

      const listings = await Promise.all(aggregator_ids.map(async (aggId: string) => {
        const { data } = await supabase.from('event_listings').insert({
          event_id, aggregator_id: aggId, status: 'pending',
          submitted_at: new Date().toISOString(), submitted_by: user.id
        }).select().single();
        return data;
      }));

      return NextResponse.json({ listings }, { status: 201 });
    }

    if (action === 'update_status') {
      const { listing_id, status, external_url, external_id } = body;

      await supabase.from('event_listings').update({
        status, external_url, external_id, updated_at: new Date().toISOString()
      }).eq('id', listing_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      const { listing_id } = body;

      await supabase.from('event_listings').update({
        status: 'removed', removed_at: new Date().toISOString()
      }).eq('id', listing_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
