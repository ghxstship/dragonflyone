export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const UpdateTimesheetSchema = z.object({
  clock_in: z.string().optional(),
  clock_out: z.string().optional(),
  break_minutes: z.number().optional(),
  regular_hours: z.number().optional(),
  overtime_hours: z.number().optional(),
  total_hours: z.number().optional(),
  task_description: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context) => {
    const supabase = createAdminClient();
    const { id } = await context.params!;

    const { data, error } = await supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(id, first_name, last_name, employee_number),
        project:projects(id, name),
        department:departments(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timesheet: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_SUPER_ADMIN],
    audit: { action: 'timesheet:view', resource: 'timesheets' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context) => {
    const supabase = createAdminClient();
    const { id } = await context.params!;
    const body = await request.json();

    const validationResult = UpdateTimesheetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    if (validationResult.data.status === 'submitted') {
      updateData.submitted_at = new Date().toISOString();
    }
    if (validationResult.data.status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = context.user?.id;
    }
    if (validationResult.data.status === 'rejected') {
      updateData.rejected_at = new Date().toISOString();
      updateData.rejected_by = context.user?.id;
    }

    const { data, error } = await supabase
      .from('timesheets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timesheet: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_SUPER_ADMIN],
    validation: UpdateTimesheetSchema,
    audit: { action: 'timesheet:update', resource: 'timesheets' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context) => {
    const supabase = createAdminClient();
    const { id } = await context.params!;

    const { error } = await supabase
      .from('timesheets')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    audit: { action: 'timesheet:delete', resource: 'timesheets' },
  }
);
