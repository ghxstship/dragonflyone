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

// Automated memory book creation with photos
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = supabase.from('memory_books').select(`
      *, event:events(id, name, date, venue)
    `).eq('user_id', user.id);

    if (eventId) query = query.eq('event_id', eventId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ memory_books: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memory books' }, { status: 500 });
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
    const { event_id, action } = body;

    if (action === 'generate') {
      // Gather content for memory book
      const { data: event } = await supabase.from('events').select('*').eq('id', event_id).single();
      const { data: photos } = await supabase.from('user_photos').select('*')
        .eq('user_id', user.id).eq('event_id', event_id);
      const { data: ticket } = await supabase.from('tickets').select('*')
        .eq('user_id', user.id).eq('event_id', event_id).single();
      const { data: checkins } = await supabase.from('checkins').select('*')
        .eq('user_id', user.id).eq('event_id', event_id);

      const content = {
        event_details: event,
        photos: photos || [],
        ticket_info: ticket,
        checkins: checkins || [],
        setlist: event?.setlist || [],
        memories: body.personal_notes || ''
      };

      const { data: memoryBook, error } = await supabase.from('memory_books').insert({
        user_id: user.id, event_id, content, status: 'generating',
        template: body.template || 'default'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // In production, trigger async PDF/book generation
      return NextResponse.json({ memory_book: memoryBook, message: 'Generation started' }, { status: 201 });
    }

    if (action === 'add_photo') {
      const { memory_book_id, photo_url, caption } = body;
      
      const { data: book } = await supabase.from('memory_books').select('content').eq('id', memory_book_id).single();
      const updatedPhotos = [...(book?.content?.photos || []), { url: photo_url, caption }];

      await supabase.from('memory_books').update({
        content: { ...book?.content, photos: updatedPhotos }
      }).eq('id', memory_book_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
