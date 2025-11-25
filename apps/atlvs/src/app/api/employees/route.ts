import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createEmployeeSchema = z.object({
  organization_id: z.string().uuid(),
  department_id: z.string().uuid().optional(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  position: z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contractor', 'freelancer']).default('full_time'),
  status: z.enum(['active', 'on_leave', 'inactive', 'terminated']).default('active'),
  hire_date: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get('organization_id');
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');

      if (!orgId) return NextResponse.json({ error: 'organization_id required' }, { status: 400 });

      let query = supabase.from('employees').select('*, departments(*)', { count: 'exact' })
        .eq('organization_id', orgId).order('last_name', { ascending: true }).range(offset, offset + limit - 1);

      if (status) query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ employees: data, total: count, limit, offset });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'employees:view', resource: 'employees' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;
      const { data, error } = await supabase.from('employees').insert({
        ...payload,
        created_by: context.user?.id,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ employee: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    validation: createEmployeeSchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'employee:create', resource: 'employees' },
  }
);
