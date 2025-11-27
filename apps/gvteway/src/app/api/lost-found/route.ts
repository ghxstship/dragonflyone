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

// GET - Fetch lost and found items
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type'); // 'lost' or 'found'
    const status = searchParams.get('status'); // 'open', 'claimed', 'returned'

    let query = supabase
      .from('lost_found_items')
      .select(`
        *,
        event:events(id, name, date, venue),
        reporter:platform_users(id, email, first_name, last_name)
      `);

    if (eventId) query = query.eq('event_id', eventId);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST - Report lost or found item
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
      type, // 'lost' or 'found'
      category, // 'phone', 'wallet', 'keys', 'clothing', 'jewelry', 'bag', 'other'
      description,
      location_found,
      location_lost,
      date_time,
      photos,
      contact_preference,
    } = body;

    const { data: item, error } = await supabase
      .from('lost_found_items')
      .insert({
        event_id,
        type,
        category,
        description,
        location: type === 'found' ? location_found : location_lost,
        date_time: date_time || new Date().toISOString(),
        photos: photos || [],
        reporter_id: user.id,
        contact_preference: contact_preference || 'email',
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check for potential matches
    const oppositeType = type === 'lost' ? 'found' : 'lost';
    const { data: potentialMatches } = await supabase
      .from('lost_found_items')
      .select('*')
      .eq('event_id', event_id)
      .eq('type', oppositeType)
      .eq('category', category)
      .eq('status', 'open');

    if (potentialMatches && potentialMatches.length > 0) {
      // Create match notifications
      for (const match of potentialMatches) {
        await supabase.from('lost_found_matches').insert({
          item1_id: item.id,
          item2_id: match.id,
          status: 'pending_review',
        });
      }
    }

    return NextResponse.json({
      item,
      potential_matches: potentialMatches?.length || 0,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to report item' },
      { status: 500 }
    );
  }
}

// PATCH - Update item status
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
    const { item_id, status, claim_details } = body;

    // Verify ownership or admin
    const { data: item, error: fetchError } = await supabase
      .from('lost_found_items')
      .select('*')
      .eq('id', item_id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = { status };

    if (status === 'claimed') {
      updateData.claimed_by = user.id;
      updateData.claimed_at = new Date().toISOString();
      updateData.claim_details = claim_details;
    } else if (status === 'returned') {
      updateData.returned_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('lost_found_items')
      .update(updateData)
      .eq('id', item_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}
