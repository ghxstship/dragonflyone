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

// Limited edition and exclusive item releases
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const artistId = searchParams.get('artist_id');
    const status = searchParams.get('status');

    let query = supabase.from('limited_releases').select(`
      *, product:products(id, name, price, images),
      event:events(id, name), artist:artists(id, name)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (artistId) query = query.eq('artist_id', artistId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('release_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const now = new Date();
    return NextResponse.json({
      releases: data,
      upcoming: data?.filter(r => new Date(r.release_date) > now) || [],
      active: data?.filter(r => r.status === 'active' && new Date(r.release_date) <= now) || [],
      sold_out: data?.filter(r => r.status === 'sold_out') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, release_id, quantity } = body;

    if (action === 'purchase') {
      const { data: release } = await supabase.from('limited_releases').select('*').eq('id', release_id).single();

      if (!release) return NextResponse.json({ error: 'Release not found' }, { status: 404 });
      if (release.status !== 'active') return NextResponse.json({ error: 'Release not available' }, { status: 400 });
      if (release.remaining_quantity < quantity) {
        return NextResponse.json({ error: 'Insufficient quantity available' }, { status: 400 });
      }

      // Check purchase limit
      const { data: existingPurchases } = await supabase.from('limited_release_purchases').select('quantity')
        .eq('release_id', release_id).eq('user_id', user.id);
      
      const totalPurchased = existingPurchases?.reduce((s, p) => s + p.quantity, 0) || 0;
      if (totalPurchased + quantity > (release.per_customer_limit || 999)) {
        return NextResponse.json({ error: 'Purchase limit exceeded' }, { status: 400 });
      }

      // Create purchase
      const { data: purchase, error } = await supabase.from('limited_release_purchases').insert({
        release_id, user_id: user.id, quantity, unit_price: release.price,
        total_price: release.price * quantity, status: 'pending'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Update remaining quantity
      const newQuantity = release.remaining_quantity - quantity;
      await supabase.from('limited_releases').update({
        remaining_quantity: newQuantity,
        status: newQuantity === 0 ? 'sold_out' : 'active'
      }).eq('id', release_id);

      return NextResponse.json({ purchase }, { status: 201 });
    }

    if (action === 'notify') {
      await supabase.from('release_notifications').upsert({
        release_id, user_id: user.id, notify_on_release: true
      });
      return NextResponse.json({ success: true, message: 'Notification set' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
