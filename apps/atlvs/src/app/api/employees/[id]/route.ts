export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { apiRoute, PlatformRole, ApiRouteContext } from '@ghxstship/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const updateEmployeeSchema = z.object({
  department_id: z.string().uuid().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  position: z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contractor', 'freelancer']).optional(),
  status: z.enum(['active', 'on_leave', 'inactive', 'terminated']).optional(),
  hire_date: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, 
  PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export const GET = apiRoute(
  async (_request: NextRequest, context: ApiRouteContext) => {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const params = await context.params;
    const id = params?.id;
    
    const { data, error } = await supabase.from('employees').select('*, departments(*)').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ employee: data });
  },
  {
    auth: true,
    roles: ATLVS_ROLES,
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'employees:read', resource: 'employees' },
  }
);

export const PATCH = apiRoute(
  async (_request: NextRequest, context: ApiRouteContext) => {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const params = await context.params;
    const id = params?.id;
    const payload = context.validated as z.infer<typeof updateEmployeeSchema>;
    
    const { data, error } = await supabase.from('employees').update(payload).eq('id', id).select().single();
    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ employee: data });
  },
  {
    auth: true,
    roles: ATLVS_ADMIN_ROLES,
    validation: updateEmployeeSchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'employees:update', resource: 'employees' },
  }
);

export const DELETE = apiRoute(
  async (_request: NextRequest, context: ApiRouteContext) => {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const params = await context.params;
    const id = params?.id;
    
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 200 });
  },
  {
    auth: true,
    roles: ATLVS_ADMIN_ROLES,
    rateLimit: { maxRequests: 10, windowMs: 60000 },
    audit: { action: 'employees:delete', resource: 'employees' },
  }
);
