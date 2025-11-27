import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// Member directory with privacy controls
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('community_id');
    const search = searchParams.get('search');
    const interests = searchParams.get('interests');

    // Get members with privacy-respecting profiles
    let query = supabase.from('community_members').select(`
      id, joined_at, role,
      user:users!inner(
        id, display_name, avatar_url, bio, location,
        privacy:user_privacy_settings(show_profile, show_location, show_interests)
      )
    `);

    if (communityId) query = query.eq('community_id', communityId);

    const { data: members, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Apply privacy filters
    const filteredMembers = members?.map((m: any) => {
      const privacy = m.user?.privacy?.[0] || { show_profile: true, show_location: true, show_interests: true };
      
      return {
        id: m.id,
        user_id: m.user?.id,
        display_name: privacy.show_profile ? m.user?.display_name : 'Anonymous',
        avatar_url: privacy.show_profile ? m.user?.avatar_url : null,
        bio: privacy.show_profile ? m.user?.bio : null,
        location: privacy.show_location ? m.user?.location : null,
        joined_at: m.joined_at,
        role: m.role
      };
    }).filter(m => {
      if (search) {
        return m.display_name?.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    }) || [];

    return NextResponse.json({
      members: filteredMembers,
      total: filteredMembers.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { show_profile, show_location, show_interests, show_activity } = body;

    const { error } = await supabase.from('user_privacy_settings').upsert({
      user_id: user.id,
      show_profile: show_profile ?? true,
      show_location: show_location ?? true,
      show_interests: show_interests ?? true,
      show_activity: show_activity ?? true,
      updated_at: new Date().toISOString()
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
  }
}
