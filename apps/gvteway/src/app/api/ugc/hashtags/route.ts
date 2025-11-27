import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const trending = searchParams.get('trending');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('ugc_hashtags')
      .select('*')
      .order('post_count', { ascending: false })
      .limit(limit);

    if (trending === 'true') {
      query = query.eq('trending', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const hashtags = data?.map(h => ({
      tag: h.tag,
      post_count: h.post_count || 0,
      engagement: h.total_engagement || 0,
      trending: h.trending || false,
    })) || [];

    return NextResponse.json({ hashtags });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
