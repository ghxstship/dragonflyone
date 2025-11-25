import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@ghxstship/config';
import { z } from 'zod';

const BatchCrewAssignmentSchema = z.object({
  projectId: z.string(),
  crewMembers: z.array(
    z.object({
      userId: z.string(),
      role: z.string(),
      callTime: z.string().optional(),
      rate: z.number().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = BatchCrewAssignmentSchema.parse(body);

    const assignments = validated.crewMembers.map((member) => ({
      project_id: validated.projectId,
      user_id: member.userId,
      role: member.role,
      call_time: member.callTime,
      rate: member.rate,
      status: 'pending',
      created_by: user.id,
    }));

    const { data, error } = await supabase
      .from('project_assignments' as any)
      .insert(assignments)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      assignments: data,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
