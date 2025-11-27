import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

const PostSchema = z.object({
  content: z.string().min(1).max(5000),
  event_id: z.string().uuid().optional(),
  artist_id: z.string().uuid().optional(),
  group_id: z.string().uuid().optional(),
  media_urls: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'followers', 'group']).default('public'),
});

// GET /api/community - Get community content
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const authHeader = request.headers.get('authorization');

    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    if (action === 'feed') {
      // Get personalized feed
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          author:platform_users!user_id(id, first_name, last_name, avatar_url),
          event:events(id, name),
          likes:community_likes(count),
          comments:community_comments(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (userId) {
        // Get followed users
        const { data: following } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId);

        const followingIds = following?.map(f => f.following_id) || [];

        if (followingIds.length > 0) {
          query = query.or(`user_id.in.(${followingIds.join(',')}),visibility.eq.public`);
        } else {
          query = query.eq('visibility', 'public');
        }
      } else {
        query = query.eq('visibility', 'public');
      }

      const { data: posts } = await query.limit(20);

      // Check if user liked each post
      if (userId && posts) {
        const postIds = posts.map(p => p.id);
        const { data: userLikes } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds);

        const likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);
        posts.forEach(post => {
          (post as any).user_liked = likedPostIds.has(post.id);
        });
      }

      return NextResponse.json({ posts: posts || [] });
    }

    if (action === 'event_feed') {
      const eventId = searchParams.get('event_id');
      if (!eventId) {
        return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
      }

      const { data: posts } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:platform_users!user_id(id, first_name, last_name, avatar_url),
          likes:community_likes(count),
          comments:community_comments(count)
        `)
        .eq('event_id', eventId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      return NextResponse.json({ posts: posts || [] });
    }

    if (action === 'groups') {
      const { data: groups } = await supabase
        .from('community_groups')
        .select(`
          *,
          members:community_group_members(count)
        `)
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(20);

      return NextResponse.json({ groups: groups || [] });
    }

    if (action === 'group_feed') {
      const groupId = searchParams.get('group_id');
      if (!groupId) {
        return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
      }

      const { data: posts } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:platform_users!user_id(id, first_name, last_name, avatar_url),
          likes:community_likes(count),
          comments:community_comments(count)
        `)
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      return NextResponse.json({ posts: posts || [] });
    }

    if (action === 'comments') {
      const postId = searchParams.get('post_id');
      if (!postId) {
        return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
      }

      const { data: comments } = await supabase
        .from('community_comments')
        .select(`
          *,
          author:platform_users!user_id(id, first_name, last_name, avatar_url)
        `)
        .eq('post_id', postId)
        .eq('status', 'active')
        .order('created_at');

      return NextResponse.json({ comments: comments || [] });
    }

    if (action === 'user_profile') {
      const profileUserId = searchParams.get('user_id');
      if (!profileUserId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      const { data: profile } = await supabase
        .from('platform_users')
        .select('id, first_name, last_name, avatar_url, bio')
        .eq('id', profileUserId)
        .single();

      const { data: posts } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', profileUserId)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      const { count: followerCount } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact' })
        .eq('following_id', profileUserId);

      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', profileUserId);

      let isFollowing = false;
      if (userId && userId !== profileUserId) {
        const { data: follow } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('following_id', profileUserId)
          .single();
        isFollowing = !!follow;
      }

      return NextResponse.json({
        profile,
        posts: posts || [],
        stats: {
          followers: followerCount || 0,
          following: followingCount || 0,
          posts: posts?.length || 0,
        },
        is_following: isFollowing,
      });
    }

    if (action === 'search') {
      const query = searchParams.get('q');
      if (!query) {
        return NextResponse.json({ error: 'Search query required' }, { status: 400 });
      }

      const { data: posts } = await supabase
        .from('community_posts')
        .select(`
          id, content, created_at,
          author:platform_users!user_id(first_name, last_name)
        `)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .ilike('content', `%${query}%`)
        .limit(20);

      const { data: users } = await supabase
        .from('platform_users')
        .select('id, first_name, last_name, avatar_url')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(10);

      return NextResponse.json({
        posts: posts || [],
        users: users || [],
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch community data' }, { status: 500 });
  }
}

// POST /api/community - Create posts, comments, likes
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_post';

    if (action === 'create_post') {
      const validated = PostSchema.parse(body);

      const { data: post, error } = await supabase
        .from('community_posts')
        .insert({
          ...validated,
          user_id: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ post }, { status: 201 });
    } else if (action === 'comment') {
      const { post_id, content, parent_id } = body;

      const { data: comment, error } = await supabase
        .from('community_comments')
        .insert({
          post_id,
          user_id: user.id,
          content,
          parent_id,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Notify post author
      const { data: post } = await supabase
        .from('community_posts')
        .select('user_id')
        .eq('id', post_id)
        .single();

      if (post && post.user_id !== user.id) {
        await supabase.from('unified_notifications').insert({
          user_id: post.user_id,
          title: 'New Comment',
          message: 'Someone commented on your post',
          type: 'info',
          priority: 'normal',
          source_platform: 'gvteway',
          source_entity_type: 'community_comment',
          source_entity_id: comment.id,
        });
      }

      return NextResponse.json({ comment }, { status: 201 });
    } else if (action === 'like') {
      const { post_id } = body;

      // Check if already liked
      const { data: existing } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', post_id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Unlike
        await supabase
          .from('community_likes')
          .delete()
          .eq('id', existing.id);

        return NextResponse.json({ liked: false });
      }

      // Like
      await supabase.from('community_likes').insert({
        post_id,
        user_id: user.id,
      });

      return NextResponse.json({ liked: true });
    } else if (action === 'follow') {
      const { following_id } = body;

      if (following_id === user.id) {
        return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', following_id)
        .single();

      if (existing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('id', existing.id);

        return NextResponse.json({ following: false });
      }

      // Follow
      await supabase.from('user_follows').insert({
        follower_id: user.id,
        following_id,
      });

      // Notify
      await supabase.from('unified_notifications').insert({
        user_id: following_id,
        title: 'New Follower',
        message: 'Someone started following you',
        type: 'info',
        priority: 'low',
        source_platform: 'gvteway',
        source_entity_type: 'user_follow',
        source_entity_id: user.id,
      });

      return NextResponse.json({ following: true });
    } else if (action === 'join_group') {
      const { group_id } = body;

      const { data: membership, error } = await supabase
        .from('community_group_members')
        .insert({
          group_id,
          user_id: user.id,
          role: 'member',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update member count
      await supabase.rpc('increment_group_member_count', { p_group_id: group_id });

      return NextResponse.json({ membership }, { status: 201 });
    } else if (action === 'leave_group') {
      const { group_id } = body;

      await supabase
        .from('community_group_members')
        .delete()
        .eq('group_id', group_id)
        .eq('user_id', user.id);

      await supabase.rpc('decrement_group_member_count', { p_group_id: group_id });

      return NextResponse.json({ success: true });
    } else if (action === 'create_group') {
      const { name, description, is_private } = body;

      const { data: group, error } = await supabase
        .from('community_groups')
        .insert({
          name,
          description,
          is_private: is_private || false,
          created_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add creator as admin
      await supabase.from('community_group_members').insert({
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
      });

      return NextResponse.json({ group }, { status: 201 });
    } else if (action === 'report') {
      const { entity_type, entity_id, reason } = body;

      await supabase.from('community_reports').insert({
        entity_type,
        entity_id,
        reason,
        reported_by: user.id,
        status: 'pending',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE /api/community - Delete posts/comments
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const commentId = searchParams.get('comment_id');

    if (postId) {
      await supabase
        .from('community_posts')
        .update({ status: 'deleted' })
        .eq('id', postId)
        .eq('user_id', user.id);

      return NextResponse.json({ success: true });
    }

    if (commentId) {
      await supabase
        .from('community_comments')
        .update({ status: 'deleted' })
        .eq('id', commentId)
        .eq('user_id', user.id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Post or comment ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
