export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/ugc/hashtags - List hashtags from ugc_hashtags (3NF table from 0051 migration)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const trending = searchParams.get('trending');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Query ugc_hashtags - 3NF table
    let query = supabase
      .from('ugc_hashtags')
      .select('*')
      .eq('is_blocked', false)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (trending === 'true') {
      query = query.eq('is_trending', true);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching hashtags from ugc_hashtags:', error);
      return NextResponse.json({ hashtags: [] });
    }

    const hashtags = data?.map(h => ({
      id: h.id,
      tag: h.tag,
      slug: h.slug,
      description: h.description,
      usage_count: h.usage_count || 0,
      is_trending: h.is_trending || false,
      is_featured: h.is_featured || false,
    })) || [];

    return NextResponse.json({ hashtags });
  } catch (error) {
    logger.error('Error in GET /api/ugc/hashtags:', error instanceof Error ? error : undefined);
    return NextResponse.json({ hashtags: [] });
  }
}
