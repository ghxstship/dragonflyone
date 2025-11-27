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

// Mentorship and onboarding for new fans
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('community_id');

    // Get mentors
    const { data: mentors } = await supabase.from('community_mentors').select(`
      *, mentor:users(id, display_name, avatar_url)
    `).eq('community_id', communityId).eq('active', true);

    // Get onboarding tasks
    const { data: tasks } = await supabase.from('onboarding_tasks').select('*')
      .eq('community_id', communityId).order('sequence', { ascending: true });

    // Get user progress
    const { data: progress } = await supabase.from('user_onboarding_progress').select('*')
      .eq('user_id', user.id).eq('community_id', communityId);

    const completedTasks = new Set(progress?.map(p => p.task_id));

    return NextResponse.json({
      mentors,
      onboarding: {
        tasks: tasks?.map(t => ({ ...t, completed: completedTasks.has(t.id) })),
        progress_percent: tasks?.length ? Math.round((completedTasks.size / tasks.length) * 100) : 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, community_id } = body;

    if (action === 'complete_task') {
      const { task_id } = body;
      await supabase.from('user_onboarding_progress').insert({
        user_id: user.id, community_id, task_id, completed_at: new Date().toISOString()
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'request_mentor') {
      const { mentor_id, message } = body;
      await supabase.from('mentor_requests').insert({
        mentee_id: user.id, mentor_id, community_id, message, status: 'pending'
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'become_mentor') {
      const { bio, specialties } = body;
      await supabase.from('community_mentors').insert({
        user_id: user.id, community_id, bio, specialties: specialties || [], active: true
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
