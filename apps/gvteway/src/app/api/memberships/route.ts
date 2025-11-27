import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const createMembershipSchema = z.object({
  user_id: z.string().uuid(),
  tier: z.enum(['member', 'member_plus', 'member_extra']),
  start_date: z.string(),
  end_date: z.string(),
  auto_renew: z.boolean().default(true),
  payment_method_id: z.string().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = getSupabaseClient();
      const { searchParams } = new URL(request.url);
      
      const userId = searchParams.get('user_id') || context.user?.id;
      const status = searchParams.get('status');
      const tier = searchParams.get('tier');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('memberships')
        .select('*, platform_users(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (tier) {
        query = query.eq('tier', tier);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        memberships: data, 
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
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'memberships:view', resource: 'memberships' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = getSupabaseClient();
      const payload = context.validated;

      const { data, error } = await supabase
        .from('memberships')
        .insert({
          ...payload,
          status: 'active',
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ membership: data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    validation: createMembershipSchema,
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    audit: { action: 'membership:create', resource: 'memberships' },
  }
);
