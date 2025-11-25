import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Final site inspection and sign-off
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('final_inspections').select(`
      *, items:inspection_items(id, area, status, notes, inspector),
      signatures:inspection_signatures(id, role, name, signature_url, signed_at)
    `).eq('project_id', projectId).single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inspection: data });
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

    if (action === 'create') {
      const { areas } = body;

      const { data, error } = await supabase.from('final_inspections').insert({
        project_id, status: 'in_progress', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (areas?.length) {
        await supabase.from('inspection_items').insert(
          areas.map((a: string) => ({ inspection_id: data.id, area: a, status: 'pending' }))
        );
      }

      return NextResponse.json({ inspection: data }, { status: 201 });
    }

    if (action === 'sign') {
      const { inspection_id, role, name, signature_url } = body;

      await supabase.from('inspection_signatures').insert({
        inspection_id, role, name, signature_url, signed_at: new Date().toISOString()
      });

      // Check if all required signatures are present
      const { data: sigs } = await supabase.from('inspection_signatures').select('role')
        .eq('inspection_id', inspection_id);

      const roles = new Set(sigs?.map(s => s.role));
      if (roles.has('venue') && roles.has('production')) {
        await supabase.from('final_inspections').update({
          status: 'completed', completed_at: new Date().toISOString()
        }).eq('id', inspection_id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
