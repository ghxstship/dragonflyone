import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Client walk-through and approval process
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('client_walkthroughs').select(`
      *, items:walkthrough_items(id, area, status, notes, photos),
      approvals:walkthrough_approvals(id, approved_by, approved_at, signature_url)
    `).eq('project_id', projectId).order('scheduled_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ walkthroughs: data });
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
    const { action, project_id } = body;

    if (action === 'schedule') {
      const { scheduled_at, client_contacts, areas } = body;

      const { data, error } = await supabase.from('client_walkthroughs').insert({
        project_id, scheduled_at, client_contacts: client_contacts || [],
        status: 'scheduled', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Add areas to check
      if (areas?.length) {
        await supabase.from('walkthrough_items').insert(
          areas.map((a: string) => ({ walkthrough_id: data.id, area: a, status: 'pending' }))
        );
      }

      return NextResponse.json({ walkthrough: data }, { status: 201 });
    }

    if (action === 'approve') {
      const { walkthrough_id, signature_url, notes } = body;

      await supabase.from('walkthrough_approvals').insert({
        walkthrough_id, approved_by: user.id, signature_url,
        notes, approved_at: new Date().toISOString()
      });

      await supabase.from('client_walkthroughs').update({ status: 'approved' }).eq('id', walkthrough_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
