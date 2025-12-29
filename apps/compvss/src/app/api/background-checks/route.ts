export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const initiateSchema = z.object({
  action: z.literal('initiate'),
  application_id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  check_types: z.array(z.string()).optional(),
  consent_obtained: z.boolean(),
});

const updateResultSchema = z.object({
  action: z.literal('update_result'),
  check_id: z.string().uuid(),
  status: z.string(),
  result: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

const consentSchema = z.object({
  action: z.literal('consent'),
  check_id: z.string().uuid(),
});

const backgroundCheckActionSchema = z.union([initiateSchema, updateResultSchema, consentSchema]);

const COMPVSS_ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

// Background check integration
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const userId = searchParams.get('user_id');

    let query = supabase.from('background_checks').select('*');

    if (applicationId) query = query.eq('application_id', applicationId);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ checks: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    const user = authResult.user;

    const body = await request.json();
    const validatedData = backgroundCheckActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'initiate') {
      const { application_id, user_id, check_types, consent_obtained } = validatedData as z.infer<typeof initiateSchema>;

      if (!consent_obtained) {
        return NextResponse.json({ error: 'Consent required' }, { status: 400 });
      }

      const { data, error } = await supabase.from('background_checks').insert({
        application_id,
        user_id, check_types: check_types || ['criminal', 'employment'],
        check_type: (check_types || ['criminal'])[0],
        status: 'pending',
        initiated_by: user.id
      } as never).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // In production, this would call external background check API
      // Simulate processing
      setTimeout(async () => {
        await supabase.from('background_checks').update({
          status: 'completed', completed_at: new Date().toISOString(),
          result: 'clear'
        }).eq('id', data.id);
      }, 5000);

      return NextResponse.json({ check: data }, { status: 201 });
    }

    if (action === 'update_result') {
      const { check_id, status, result, details } = validatedData as z.infer<typeof updateResultSchema>;

      await supabase.from('background_checks').update({
        status, result, details, completed_at: new Date().toISOString()
      }).eq('id', check_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'consent') {
      const { check_id } = validatedData as z.infer<typeof consentSchema>;

      await supabase.from('background_checks').update({
        status: 'consented',
        updated_at: new Date().toISOString()
      } as never).eq('id', check_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
