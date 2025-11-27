import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        collection_events (
          sort_order,
          events (
            id,
            title,
            date,
            venue,
            category,
            status,
            image
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const collection = {
      id: data.id,
      name: data.name,
      description: data.description,
      image: data.image,
      featured: data.featured,
      events: data.collection_events
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((ce: any) => ce.events)
        .filter(Boolean) || [],
    };

    return NextResponse.json({ collection });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { name, description, image, featured, status } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (featured !== undefined) updates.featured = featured;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ collection: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    // Delete collection events first
    await supabase
      .from('collection_events')
      .delete()
      .eq('collection_id', params.id);

    // Delete collection
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
