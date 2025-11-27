import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Crew manifest generation
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
        id, first_name, last_name, phone, email, role,
        emergency_contact, emergency_phone, certifications
      )
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (eventId) query = query.eq('event_id', eventId);
    if (date) query = query.eq('date', date);

    const { data, error } = await query.order('department', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by department
    const byDepartment: Record<string, any[]> = {};
    data?.forEach(assignment => {
      const dept = assignment.department || 'General';
      if (!byDepartment[dept]) byDepartment[dept] = [];
      byDepartment[dept].push({
        name: `${assignment.crew_member?.first_name} ${assignment.crew_member?.last_name}`,
        role: assignment.role || assignment.crew_member?.role,
        call_time: assignment.call_time,
        phone: assignment.crew_member?.phone,
        email: assignment.crew_member?.email,
        emergency_contact: assignment.crew_member?.emergency_contact,
        emergency_phone: assignment.crew_member?.emergency_phone
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, project_id, event_id, date } = body;

    if (action === 'export') {
      // Generate manifest and store for download
      const { data: assignments } = await supabase.from('crew_assignments').select(`
        *, crew_member:crew_members(*)
      `).eq('project_id', project_id);

      const { data: manifest, error } = await supabase.from('generated_manifests').insert({
        project_id, event_id, date, crew_count: assignments?.length || 0,
        data: assignments, generated_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ manifest_id: manifest.id }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
