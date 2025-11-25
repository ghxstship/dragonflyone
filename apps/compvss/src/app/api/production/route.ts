import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createProductionSchema = z.object({
  name: z.string().min(1),
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid(),
  production_type: z.enum(['concert', 'festival', 'corporate', 'theater', 'sports', 'other']),
  venue_id: z.string().uuid().optional(),
  load_in_date: z.string(),
  load_out_date: z.string(),
  event_date: z.string(),
  status: z.enum(['planning', 'advancing', 'in_progress', 'completed', 'cancelled']).default('planning'),
  crew_count: z.number().optional(),
  budget: z.number().optional(),
  notes: z.string().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      
      const projectId = searchParams.get('project_id');
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('productions')
        .select('*, projects(*), venues(*)', { count: 'exact' })
        .order('event_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        productions: data, 
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
    audit: { action: 'production:view', resource: 'productions' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;

      const { data, error } = await supabase
        .from('productions')
        .insert({
          ...payload,
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ production: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    validation: createProductionSchema,
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'production:create', resource: 'productions' },
  }
);
