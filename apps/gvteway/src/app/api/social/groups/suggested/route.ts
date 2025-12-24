export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, logger } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userId = authResult.user?.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    let query = supabase
      .from('social_groups')
      .select('*, member_count')
      .order('member_count', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.not('id', 'in', `(SELECT group_id FROM social_group_members WHERE user_id = '${userId}')`);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching suggested groups:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Error in GET /api/social/groups/suggested:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch suggested groups' }, { status: 500 });
  }
}
