import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Exclusive content for community members
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artist_id');
    const contentType = searchParams.get('type');

    // Get user's memberships and access levels
    const { data: memberships } = await supabase.from('fan_club_members').select(`
      *, tier:fan_club_tiers(access_level)
    `).eq('user_id', user.id).eq('status', 'active');

    const accessLevels = memberships?.map(m => m.tier?.access_level || 0) || [0];
    const maxAccess = Math.max(...accessLevels, 0);

    // Get content user can access
    let query = supabase.from('exclusive_content').select(`
      *, artist:artists(id, name)
    `).lte('access_level', maxAccess).eq('status', 'published');

    if (artistId) query = query.eq('artist_id', artistId);
    if (contentType) query = query.eq('content_type', contentType);

    const { data, error } = await query.order('published_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      content: data,
      access_level: maxAccess,
      content_types: ['video', 'audio', 'photo', 'article', 'livestream']
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, content_id } = body;

    if (action === 'view') {
      // Log content view
      await supabase.from('content_views').insert({
        content_id, user_id: user.id, viewed_at: new Date().toISOString()
      });

      // Update view count
      await supabase.rpc('increment_content_views', { content_id });

      return NextResponse.json({ success: true });
    }

    if (action === 'like') {
      const { data: existing } = await supabase.from('content_likes').select('id')
        .eq('content_id', content_id).eq('user_id', user.id).single();

      if (existing) {
        await supabase.from('content_likes').delete().eq('id', existing.id);
        return NextResponse.json({ liked: false });
      }

      await supabase.from('content_likes').insert({ content_id, user_id: user.id });
      return NextResponse.json({ liked: true });
    }

    if (action === 'comment') {
      const { comment_text } = body;

      const { data, error } = await supabase.from('content_comments').insert({
        content_id, user_id: user.id, comment_text
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ comment: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
