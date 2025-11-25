import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const department = searchParams.get('department');
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('communication_channels')
      .select(`
        *,
        members:channel_members(
          id,
          user:platform_users(id, first_name, last_name, role)
        )
      `)
      .eq('is_active', true)
      .order('name');

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const channels = data?.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      department: c.department,
      description: c.description,
      members: c.members?.map((m: any) => ({
        id: m.user?.id,
        name: `${m.user?.first_name} ${m.user?.last_name}`,
        role: m.user?.role,
      })) || [],
      is_active: c.is_active,
      created_at: c.created_at,
      unread_count: 0,
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
