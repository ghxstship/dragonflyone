export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_COLLABORATOR, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

// Audio line listings
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('audio_lines').select('*')
      .eq('project_id', projectId).order('channel', { ascending: true });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const user = authResult.user;

    const body = await request.json();
    const { project_id, channel, type, source, destination, signal_type, phantom, notes } = body;

    const { data, error } = await supabase.from('audio_lines').insert({
      project_id, channel, type, source, destination,
      signal_type, phantom: phantom || false, notes, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ line: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
