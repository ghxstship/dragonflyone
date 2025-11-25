import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createCrewSchema = z.object({
  platform_user_id: z.string().uuid(),
  role: z.string().min(1),
  department: z.string().min(1),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  hourly_rate: z.number().positive().optional(),
  availability_status: z.enum(['available', 'busy', 'unavailable']).default('available'),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      
      const role = searchParams.get('role');
      const department = searchParams.get('department');
      const skill = searchParams.get('skill');
      const status = searchParams.get('availability_status');
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('crew_members')
        .select('*, platform_users(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (role) {
        query = query.eq('role', role);
      }

      if (department) {
        query = query.eq('department', department);
      }

      if (skill) {
        query = query.contains('skills', [skill]);
      }

      if (status) {
        query = query.eq('availability_status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        crew: data, 
        total: count,
        limit,
        offset
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'crew:view', resource: 'crew' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;

      const { data, error } = await supabase
        .from('crew_members')
        .insert({
          ...payload,
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ crew_member: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    validation: createCrewSchema,
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'crew:create', resource: 'crew' },
  }
);
