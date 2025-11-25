import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Site restoration checklist and final inspection
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('site_restorations').select(`
      *, items:restoration_items(id, area, task, status, completed_by, completed_at, photos)
    `).eq('project_id', projectId).single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const completedItems = data?.items?.filter((i: any) => i.status === 'completed').length || 0;
    const totalItems = data?.items?.length || 0;

    return NextResponse.json({
      restoration: data,
      progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, project_id } = body;

    if (action === 'create_checklist') {
      const { items } = body;

      const { data, error } = await supabase.from('site_restorations').insert({
        project_id, status: 'in_progress', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (items?.length) {
        await supabase.from('restoration_items').insert(
          items.map((i: any) => ({ restoration_id: data.id, area: i.area, task: i.task, status: 'pending' }))
        );
      }

      return NextResponse.json({ restoration: data }, { status: 201 });
    }

    if (action === 'complete_item') {
      const { item_id, photos } = body;

      await supabase.from('restoration_items').update({
        status: 'completed', completed_by: user.id,
        completed_at: new Date().toISOString(), photos: photos || []
      }).eq('id', item_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'final_signoff') {
      const { restoration_id, signature_url, notes } = body;

      await supabase.from('site_restorations').update({
        status: 'completed', signed_off_by: user.id,
        signed_off_at: new Date().toISOString(), signature_url, notes
      }).eq('id', restoration_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
