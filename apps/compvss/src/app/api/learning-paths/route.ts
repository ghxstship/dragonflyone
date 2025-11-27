import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Learning paths and progressive training
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline');
    const level = searchParams.get('level');

    let query = supabase.from('learning_paths').select(`
      *, modules:learning_modules(id, title, order, duration_minutes, content_type),
      enrollments:path_enrollments(user_id, progress_percent, completed_at)
    `);

    if (discipline) query = query.eq('discipline', discipline);
    if (level) query = query.eq('level', level);

    const { data, error } = await query.order('title', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ learning_paths: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'enroll') {
      const { path_id } = body;

      const { data, error } = await supabase.from('path_enrollments').insert({
        path_id, user_id: user.id, progress_percent: 0, started_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ enrollment: data }, { status: 201 });
    }

    if (action === 'complete_module') {
      const { path_id, module_id } = body;

      await supabase.from('module_completions').insert({
        path_id, module_id, user_id: user.id, completed_at: new Date().toISOString()
      });

      // Update progress
      const { data: modules } = await supabase.from('learning_modules').select('id').eq('path_id', path_id);
      const { data: completions } = await supabase.from('module_completions').select('id')
        .eq('path_id', path_id).eq('user_id', user.id);

      const progress = modules?.length ? Math.round((completions?.length || 0) / modules.length * 100) : 0;

      await supabase.from('path_enrollments').update({
        progress_percent: progress,
        completed_at: progress === 100 ? new Date().toISOString() : null
      }).eq('path_id', path_id).eq('user_id', user.id);

      return NextResponse.json({ progress });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
