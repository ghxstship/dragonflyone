export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createGuideSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  equipment_type: z.string().optional(),
  symptom: z.string().optional(),
  description: z.string().optional(),
  steps: z.array(z.object({
    question: z.string(),
    yes_action: z.string().optional(),
    no_action: z.string().optional(),
    solution: z.string().optional(),
  })).optional(),
});

// Troubleshooting guides with decision trees
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
    const category = searchParams.get('category');
    const equipment = searchParams.get('equipment');
    const symptom = searchParams.get('symptom');

    let query = supabase.from('troubleshooting_guides').select(`
      *, steps:troubleshooting_steps(id, step_number, question, yes_action, no_action, solution)
    `);

    if (category) query = query.eq('category', category);
    if (equipment) query = query.ilike('equipment_type', `%${equipment}%`);
    if (symptom) query = query.ilike('symptom', `%${symptom}%`);

    const { data, error } = await query.order('title', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ guides: data });
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

    const body = await request.json();
    const validatedData = createGuideSchema.parse(body);
    const { title, category, equipment_type, symptom, description, steps } = validatedData;

    const { data, error } = await supabase.from('troubleshooting_guides').insert({
      title, category, equipment_type, symptom, description
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    interface TroubleshootingStep { question: string; yes_action?: string; no_action?: string; solution?: string }
    if (steps?.length) {
      await supabase.from('troubleshooting_steps').insert(
        steps.map((s: TroubleshootingStep, i: number) => ({
          guide_id: data.id, step_number: i + 1,
          question: s.question, yes_action: s.yes_action,
          no_action: s.no_action, solution: s.solution
        }))
      );
    }

    return NextResponse.json({ guide: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
