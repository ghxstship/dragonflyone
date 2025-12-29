export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createProgramSchema = z.object({
  action: z.literal('create_program'),
  company_id: z.string().uuid(),
  name: z.string().min(1),
  program_type: z.string(),
  description: z.string().optional(),
  duration: z.string().optional(),
  compensation: z.record(z.unknown()).optional(),
  requirements: z.array(z.string()).optional(),
  application_deadline: z.string().optional(),
  start_date: z.string().optional(),
});

const addPositionSchema = z.object({
  action: z.literal('add_position'),
  program_id: z.string().uuid(),
  title: z.string().min(1),
  department: z.string().optional(),
  description: z.string().optional(),
  spots_available: z.number().int().optional(),
  skills_required: z.array(z.string()).optional(),
});

const applySchema = z.object({
  action: z.literal('apply'),
  position_id: z.string().uuid(),
  resume_url: z.string().url().optional(),
  cover_letter: z.string().optional(),
  availability: z.string().optional(),
});

const internshipActionSchema = z.union([createProgramSchema, addPositionSchema, applySchema]);

// Internship and apprenticeship program management
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
    const programType = searchParams.get('type');
    const status = searchParams.get('status') || 'active';

    let query = supabase.from('internship_programs').select(`
      *, company:companies(name, logo_url),
      positions:program_positions(id, title, department, spots_available)
    `);

    if (programType) query = query.eq('program_type', programType);
    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query.order('application_deadline', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ programs: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = internshipActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_program') {
      const { company_id, name, program_type, description, duration, compensation, requirements, application_deadline, start_date } = validatedData as z.infer<typeof createProgramSchema>;

      const { data, error } = await supabase.from('internship_programs').insert({
        company_id, name, program_type, description, duration,
        compensation, requirements: requirements || [],
        application_deadline, start_date, status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ program: data }, { status: 201 });
    }

    if (action === 'add_position') {
      const { program_id, title, department, description, spots_available, skills_required } = validatedData as z.infer<typeof addPositionSchema>;

      const { data, error } = await supabase.from('program_positions').insert({
        program_id, title, department, description,
        spots_available, skills_required: skills_required || []
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ position: data }, { status: 201 });
    }

    if (action === 'apply') {
      const { position_id, resume_url, cover_letter, availability } = validatedData as z.infer<typeof applySchema>;

      const { data, error } = await supabase.from('program_applications').insert({
        position_id, applicant_id: user.id, resume_url, cover_letter,
        availability, status: 'submitted'
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ application: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
