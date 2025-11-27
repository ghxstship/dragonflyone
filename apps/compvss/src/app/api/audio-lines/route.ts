import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Audio line listings
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('audio_lines').select('*')
      .eq('project_id', projectId).order('channel', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by type
    const inputs = data?.filter(l => l.type === 'input') || [];
    const outputs = data?.filter(l => l.type === 'output') || [];

    return NextResponse.json({ lines: data, inputs, outputs });
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
    const { project_id, channel, type, source, destination, signal_type, phantom, notes } = body;

    const { data, error } = await supabase.from('audio_lines').insert({
      project_id, channel, type, source, destination,
      signal_type, phantom: phantom || false, notes, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ line: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
