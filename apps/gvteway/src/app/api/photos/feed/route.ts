export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



// Table does not exist in schema - return empty response
export async function GET() {
  return NextResponse.json({ photos: [] });
}

// Original implementation preserved for when table is created
async function _originalGET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const galleryId = searchParams.get('gallery_id');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('event_photos')
      .select(`
        *,
        event:events(id, title),
        uploader:platform_users(id, first_name, last_name)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (galleryId) {
      query = query.eq('gallery_id', galleryId);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    interface PhotoEventInfo { title?: string }
    interface PhotoUploaderInfo { first_name?: string; last_name?: string }
    const photos = data?.map(p => {
      const event = p.event as PhotoEventInfo | null;
      const uploader = p.uploader as PhotoUploaderInfo | null;
      return {
        id: p.id,
        url: p.url,
        thumbnail_url: p.thumbnail_url || p.url,
        event_id: p.event_id,
        event_name: event?.title || 'Unknown Event',
        uploaded_by: p.uploaded_by,
        uploaded_by_name: uploader 
          ? `${uploader.first_name} ${uploader.last_name}` 
          : 'Anonymous',
        caption: p.caption,
        tags: p.tags || [],
        likes: p.likes || 0,
        is_featured: p.is_featured || false,
        created_at: p.created_at,
      };
    }) || [];

    return NextResponse.json({ photos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
