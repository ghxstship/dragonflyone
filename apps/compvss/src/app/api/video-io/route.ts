import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Video I/O documentation
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('video_io').select('*')
      .eq('project_id', projectId).order('port_number', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const inputs = data?.filter(v => v.direction === 'input') || [];
    const outputs = data?.filter(v => v.direction === 'output') || [];

    return NextResponse.json({ video_io: data, inputs, outputs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { project_id, port_number, direction, signal_type, resolution, source, destination, notes } = body;

    const { data, error } = await supabase.from('video_io').insert({
      project_id, port_number, direction, signal_type, resolution, source, destination, notes
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ port: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
