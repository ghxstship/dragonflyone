export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const department = searchParams.get('department');
    const projectId = searchParams.get('project_id');

    // Use communications table which exists in the schema
    let query = supabase
      .from('communications')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (department) {
      query = query.eq('department', department);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    const channels = data?.map(c => ({
      id: c.id,
      subject: c.subject,
      type: c.type,
      status: c.status,
      created_at: c.created_at,
    })) || [];

    return NextResponse.json({ channels });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, department, description, project_id, member_ids } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const { data: channel, error: channelError } = await supabase
      .from('communication_channels')
      .insert({
        name,
        type,
        department,
        description,
        project_id,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (channelError) {
      return NextResponse.json({ error: channelError.message }, { status: 500 });
    }

    // Add creator as member
    await supabase
      .from('channel_members')
      .insert({
        channel_id: channel.id,
        user_id: user.id,
        role: 'admin',
      });

    // Add additional members
    if (member_ids && member_ids.length > 0) {
      const memberInserts = member_ids.map((id: string) => ({
        channel_id: channel.id,
        user_id: id,
        role: 'member',
      }));

      await supabase
        .from('channel_members')
        .insert(memberInserts);
    }

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
