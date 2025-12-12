export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';
import { z } from 'zod';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organization_id: z.string().uuid(),
  client_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().optional(),
  project_type: z.string().optional(),
  created_by: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ProjectCreateSchema.parse(body);

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        organization_id: validatedData.organization_id,
        client_id: validatedData.client_id,
        event_id: validatedData.event_id,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        budget: validatedData.budget,
        project_type: validatedData.project_type,
        status: 'planning',
        progress: 0,
        created_by: validatedData.created_by,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
