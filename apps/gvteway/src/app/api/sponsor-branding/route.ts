import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

// Sponsor and partner branding
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = supabase.from('event_sponsors').select(`
      *, sponsor:sponsors(id, name, logo_url, website)
    `);

    if (eventId) query = query.eq('event_id', eventId);

    const { data, error } = await query.order('tier', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by tier
    const byTier: Record<string, any[]> = {};
    data?.forEach(s => {
      if (!byTier[s.tier]) byTier[s.tier] = [];
      byTier[s.tier].push(s);
    });

    return NextResponse.json({ sponsors: data, by_tier: byTier });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'add_sponsor') {
      const { event_id, sponsor_id, tier, placement, branding_assets } = body;

      const { data, error } = await supabase.from('event_sponsors').insert({
        event_id, sponsor_id, tier, placement: placement || [],
        branding_assets: branding_assets || {}
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ sponsor: data }, { status: 201 });
    }

    if (action === 'create_sponsor') {
      const { name, logo_url, website, contact_name, contact_email } = body;

      const { data, error } = await supabase.from('sponsors').insert({
        name, logo_url, website, contact_name, contact_email
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ sponsor: data }, { status: 201 });
    }

    if (action === 'update_branding') {
      const { event_sponsor_id, branding_assets, placement } = body;

      await supabase.from('event_sponsors').update({
        branding_assets, placement
      }).eq('id', event_sponsor_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
