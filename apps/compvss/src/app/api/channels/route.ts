export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createChannelSchema = z.object({
  name: z.string(),
  type: z.string(),
  department: z.string().optional(),
  description: z.string().optional(),
  project_id: z.string().uuid().optional(),
  member_ids: z.array(z.string().uuid()).optional(),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createChannelSchema.parse(body);
    const { name, type, department, description, project_id, member_ids } = validatedData;

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
