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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('collections')
      .select(`
        *,
        collection_events (
          events (
            id,
            title,
            date,
            venue,
            category,
            status
          )
        )
      `)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const collections = data?.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      image: collection.image,
      featured: collection.featured,
      events: collection.collection_events?.map((ce: any) => ce.events).filter(Boolean) || [],
    })) || [];

    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { name, description, image, event_ids, featured } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    // Create collection
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .insert({
        name,
        description,
        image,
        featured: featured || false,
        status: 'active',
      })
      .select()
      .single();

    if (collectionError) {
      return NextResponse.json({ error: collectionError.message }, { status: 500 });
    }

    // Add events to collection
    if (event_ids && event_ids.length > 0) {
      const collectionEvents = event_ids.map((eventId: string, index: number) => ({
        collection_id: collection.id,
        event_id: eventId,
        sort_order: index,
      }));

      await supabase
        .from('collection_events')
        .insert(collectionEvents);
    }

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
