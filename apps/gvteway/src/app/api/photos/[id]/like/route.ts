import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    // Get current photo
    const { data: photo, error: fetchError } = await supabase
      .from('event_photos')
      .select('likes')
      .eq('id', photoId)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Check if user already liked (if authenticated)
    if (userId) {
      const { data: existingLike } = await supabase
        .from('photo_likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', userId);

        await supabase
          .from('event_photos')
          .update({ likes: Math.max(0, (photo.likes || 0) - 1) })
          .eq('id', photoId);

        return NextResponse.json({ liked: false, likes: Math.max(0, (photo.likes || 0) - 1) });
      }

      // Like
      await supabase
        .from('photo_likes')
        .insert({ photo_id: photoId, user_id: userId });
    }

    // Increment like count
    const { error: updateError } = await supabase
      .from('event_photos')
      .update({ likes: (photo.likes || 0) + 1 })
      .eq('id', photoId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ liked: true, likes: (photo.likes || 0) + 1 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
