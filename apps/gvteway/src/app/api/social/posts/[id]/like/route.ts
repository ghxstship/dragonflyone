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

    const { data: existingLike } = await supabase
      .from('social_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      await supabase
        .from('social_post_likes')
        .delete()
        .eq('id', existingLike.id);

      return NextResponse.json({ liked: false, message: 'Post unliked' });
    }

    const { error } = await supabase
      .from('social_post_likes')
      .insert({ post_id: postId, user_id: userId });

    if (error) {
      logger.error('Error liking post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ liked: true, message: 'Post liked' });
  } catch (error) {
    logger.error('Error in POST /api/social/posts/[id]/like:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
