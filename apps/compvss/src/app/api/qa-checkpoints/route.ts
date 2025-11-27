import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// QA checkpoints with digital sign-offs
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase.from('qa_checkpoints').select(`
      *, signed_by:platform_users(id, first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query.order('sequence', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const completed = data?.filter(c => c.status === 'passed').length || 0;
    const total = data?.length || 0;

    return NextResponse.json({
      checkpoints: data,
      progress: { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch checkpoints' }, { status: 500 });
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
    const { project_id, name, description, department, sequence, criteria } = body;

    const { data, error } = await supabase.from('qa_checkpoints').insert({
      project_id, name, description, department, sequence, criteria: criteria || [],
      status: 'pending', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ checkpoint: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkpoint' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, notes, photo_urls, issues } = body;

    if (action === 'sign_off') {
      await supabase.from('qa_checkpoints').update({
        status: 'passed', signed_by: user.id, signed_at: new Date().toISOString(),
        notes, photo_urls: photo_urls || []
      }).eq('id', id);

      return NextResponse.json({ success: true, message: 'Checkpoint signed off' });
    }

    if (action === 'fail') {
      await supabase.from('qa_checkpoints').update({
        status: 'failed', notes, issues: issues || [], reviewed_by: user.id
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
