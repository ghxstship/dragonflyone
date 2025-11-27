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

// GET - Fetch available add-ons for an event
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ticket_addons')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by category
    const grouped = data.reduce((acc: Record<string, any[]>, addon) => {
      const category = addon.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(addon);
      return acc;
    }, {});

    return NextResponse.json({ addons: data, grouped });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch add-ons' },
      { status: 500 }
    );
  }
}

// POST - Create new add-on (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      event_id,
      name,
      description,
      category, // parking, merchandise, upgrade, fast_lane, lounge_access, food_beverage
      price,
      quantity_available,
      max_per_order,
      image_url,
    } = body;

    const { data, error } = await supabase
      .from('ticket_addons')
      .insert({
        event_id,
        name,
        description,
        category,
        price,
        quantity_available,
        quantity_sold: 0,
        max_per_order: max_per_order || 10,
        image_url,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ addon: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create add-on' },
      { status: 500 }
    );
  }
}

// PATCH - Purchase add-on
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { addon_id, ticket_id, quantity } = body;

    // Check availability
    const { data: addon, error: addonError } = await supabase
      .from('ticket_addons')
      .select('*')
      .eq('id', addon_id)
      .single();

    if (addonError || !addon) {
      return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
    }

    const available = addon.quantity_available - addon.quantity_sold;
    if (quantity > available) {
      return NextResponse.json({ error: 'Insufficient quantity' }, { status: 400 });
    }

    if (quantity > addon.max_per_order) {
      return NextResponse.json({ error: `Maximum ${addon.max_per_order} per order` }, { status: 400 });
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('addon_purchases')
      .insert({
        addon_id,
        ticket_id,
        user_id: user.id,
        quantity,
        unit_price: addon.price,
        total_price: addon.price * quantity,
        status: 'confirmed',
      })
      .select()
      .single();

    if (purchaseError) {
      return NextResponse.json({ error: purchaseError.message }, { status: 500 });
    }

    // Update sold quantity
    await supabase
      .from('ticket_addons')
      .update({ quantity_sold: addon.quantity_sold + quantity })
      .eq('id', addon_id);

    return NextResponse.json({ purchase });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to purchase add-on' },
      { status: 500 }
    );
  }
}
