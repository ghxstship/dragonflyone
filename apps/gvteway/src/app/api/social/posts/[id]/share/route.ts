export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, logger } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { id: postId } = await params;

    const { error } = await supabase
      .from('social_post_shares')
      .insert({ post_id: postId, user_id: userId });

    if (error) {
      logger.error('Error sharing post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shared: true, message: 'Post shared' });
  } catch (error) {
    logger.error('Error in POST /api/social/posts/[id]/share:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to share post' }, { status: 500 });
  }
}
