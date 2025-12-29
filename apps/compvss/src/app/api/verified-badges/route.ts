export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const requestVerificationSchema = z.object({
  action: z.literal('request_verification'),
  entity_type: z.enum(['user', 'vendor']),
  entity_id: z.string().uuid(),
  verification_type: z.string(),
  documents: z.array(z.string()).optional(),
});

const approveSchema = z.object({
  action: z.literal('approve'),
  request_id: z.string().uuid(),
  badge_type: z.string(),
  expiry_date: z.string().optional(),
});

const verifiedBadgeActionSchema = z.union([requestVerificationSchema, approveSchema]);

// Verified badge system with background checks
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
    const userId = searchParams.get('user_id');
    const vendorId = searchParams.get('vendor_id');

    let query = supabase.from('verification_badges').select('*');
    if (userId) query = query.eq('user_id', userId);
    if (vendorId) query = query.eq('vendor_id', vendorId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ badges: data });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = verifiedBadgeActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'request_verification') {
      const { entity_type, entity_id, verification_type, documents } = validatedData as z.infer<typeof requestVerificationSchema>;

      const { data, error } = await supabase.from('verification_requests').insert({
        entity_type, entity_id, verification_type,
        documents: documents || [], status: 'pending',
        requested_by: user.id, requested_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ request: data }, { status: 201 });
    }

    if (action === 'approve') {
      const { request_id, badge_type, expiry_date } = validatedData as z.infer<typeof approveSchema>;

      const { data: req } = await supabase.from('verification_requests').select('*')
        .eq('id', request_id).single();

      if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

      await supabase.from('verification_badges').insert({
        user_id: req.entity_type === 'user' ? req.entity_id : null,
        vendor_id: req.entity_type === 'vendor' ? req.entity_id : null,
        badge_type, verified_at: new Date().toISOString(),
        expiry_date, verified_by: user.id
      });

      await supabase.from('verification_requests').update({ status: 'approved' }).eq('id', request_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
