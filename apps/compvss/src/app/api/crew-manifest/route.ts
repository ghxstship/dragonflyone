export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const exportManifestSchema = z.object({
  action: z.literal('export'),
  project_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  date: z.string().optional(),
});

// Crew manifest generation
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
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const date = searchParams.get('date');

    if (!projectId && !eventId) {
      return NextResponse.json({ error: 'Project or event ID required' }, { status: 400 });
    }

    // Get crew assignments
    let query = supabase.from('crew_assignments').select(`
      *, crew_member:crew_members(
        id, first_name, last_name, phone, email, role, certifications
      )
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (eventId) query = query.eq('event_id', eventId);
    if (date) query = query.eq('date', date);

    const { data, error } = await query.order('department', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Group by department
    interface ManifestMember { name: string; role: string | null; call_time: string | null; phone: string | null; email: string }
    const byDepartment: Record<string, ManifestMember[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?.forEach((assignment: any) => {
      const dept = assignment.department || 'General';
      if (!byDepartment[dept]) byDepartment[dept] = [];
      byDepartment[dept].push({
        name: `${assignment.crew_member?.first_name || ''} ${assignment.crew_member?.last_name || ''}`.trim(),
        role: assignment.role || assignment.crew_member?.role,
        call_time: assignment.call_time,
        phone: assignment.crew_member?.phone,
        email: assignment.crew_member?.email || '',
      });
    });

    return NextResponse.json({
      manifest: {
        generated_at: new Date().toISOString(),
        project_id: projectId,
        event_id: eventId,
        date,
        total_crew: data?.length || 0,
        departments: Object.entries(byDepartment).map(([name, members]) => ({
          name,
          count: members.length,
          members
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate manifest' }, { status: 500 });
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = exportManifestSchema.parse(body);
    const { action, project_id, event_id, date } = validatedData;

    if (action === 'export') {
      // Generate manifest and store for download
      const { data: assignments } = await supabase.from('crew_assignments').select(`
        *, crew_member:crew_members(*)
      `).eq('project_id', project_id);

      const { data: manifest, error } = await supabase.from('generated_manifests').insert({
        event_id, 
        manifest_type: 'crew',
        title: `Crew Manifest - ${date || new Date().toISOString().split('T')[0]}`,
        data: { project_id, date, crew_count: assignments?.length || 0, assignments },
        generated_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ manifest_id: manifest.id }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
