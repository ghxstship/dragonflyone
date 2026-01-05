export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger, withAuth } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const userId = authResult.user?.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: personData } = await supabase
      .from('legend_people')
      .select('id')
      .eq('platform_user_id', userId)
      .single();

    if (!personData) {
      return NextResponse.json({ events: [], total: 0, limit, offset });
    }

    let query = supabase
      .from('legend_events')
      .select(`
        id,
        name,
        slug,
        start_datetime,
        end_datetime,
        status,
        cover_image_url,
        place:legend_places!place_id(id, name, city),
        tickets:tickets(count)
      `, { count: 'exact' })
      .or(`created_by.eq.${personData.id},organizer_id.eq.${personData.id}`)
      .order('start_datetime', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (type === 'upcoming') {
      query = query.gte('start_datetime', new Date().toISOString());
    } else if (type === 'past') {
      query = query.lt('start_datetime', new Date().toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ events: [], total: 0, limit, offset });
      }
      logger.error('Error fetching user events:', error);
      return NextResponse.json({ events: [], total: 0, limit, offset });
    }

    return NextResponse.json({ events: data || [], total: count, limit, offset });
  } catch (error) {
    logger.error('Error in GET /api/events/mine:', error instanceof Error ? error : undefined);
    return NextResponse.json({ events: [], total: 0, limit: 50, offset: 0 });
  }
}
