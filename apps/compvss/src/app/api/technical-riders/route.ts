import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch technical riders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const artistId = searchParams.get('artist_id');
    const type = searchParams.get('type'); // 'audio', 'lighting', 'video', 'backline', 'hospitality'

    let query = supabase
      .from('technical_riders')
      .select(`
        *,
        project:projects(id, name),
        artist:artists(id, name),
        created_by:platform_users!created_by(id, email, first_name, last_name),
        items:rider_items(*),
        notes:rider_notes(*)
      `);

    if (projectId) query = query.eq('project_id', projectId);
    if (artistId) query = query.eq('artist_id', artistId);
    if (type) query = query.eq('rider_type', type);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ riders: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch riders' },
      { status: 500 }
    );
  }
}

// POST - Create technical rider
export async function POST(request: NextRequest) {
  try {
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
      project_id,
      artist_id,
      rider_type, // 'audio', 'lighting', 'video', 'backline', 'hospitality', 'stage'
      title,
      version,
      effective_date,
      items,
      stage_plot_url,
      input_list_url,
      patch_list_url,
      notes,
    } = body;

    // Create rider
    const { data: rider, error: riderError } = await supabase
      .from('technical_riders')
      .insert({
        project_id,
        artist_id,
        rider_type,
        title: title || `${rider_type} Rider`,
        version: version || '1.0',
        effective_date: effective_date || new Date().toISOString(),
        stage_plot_url,
        input_list_url,
        patch_list_url,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (riderError) {
      return NextResponse.json({ error: riderError.message }, { status: 500 });
    }

    // Add items
    if (items && items.length > 0) {
      const itemRecords = items.map((item: any, index: number) => ({
        rider_id: rider.id,
        category: item.category,
        item_name: item.item_name,
        quantity: item.quantity || 1,
        specifications: item.specifications,
        is_required: item.is_required !== false,
        is_provided: item.is_provided || false,
        substitute_allowed: item.substitute_allowed || false,
        substitute_notes: item.substitute_notes,
        order_index: index,
      }));

      await supabase.from('rider_items').insert(itemRecords);
    }

    // Add notes
    if (notes && notes.length > 0) {
      const noteRecords = notes.map((note: any) => ({
        rider_id: rider.id,
        section: note.section,
        content: note.content,
        priority: note.priority || 'normal',
      }));

      await supabase.from('rider_notes').insert(noteRecords);
    }

    return NextResponse.json({ rider }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create rider' },
      { status: 500 }
    );
  }
}

// PATCH - Update rider or mark items as provided
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rider_id, item_id, action, ...updateData } = body;

    if (item_id) {
      // Update item
      const { error } = await supabase
        .from('rider_items')
        .update(updateData)
        .eq('id', item_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'approve') {
      await supabase
        .from('technical_riders')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', rider_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'distribute') {
      await supabase
        .from('technical_riders')
        .update({
          status: 'distributed',
          distributed_at: new Date().toISOString(),
        })
        .eq('id', rider_id);

      // TODO: Send to relevant departments

      return NextResponse.json({ success: true });
    }

    // Default: update rider
    const { error } = await supabase
      .from('technical_riders')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rider_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update rider' },
      { status: 500 }
    );
  }
}
