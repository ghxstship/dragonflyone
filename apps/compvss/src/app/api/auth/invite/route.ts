import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string().optional(),
  organizationId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = inviteSchema.parse(body);

    // Get inviter's organization
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to invite
    const roles = platformUser.platform_roles || [];
    const canInvite = roles.some((r: string) => 
      r.includes('ADMIN') || r.startsWith('LEGEND_')
    );

    if (!canInvite) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const organizationId = validated.organizationId || platformUser.organization_id;

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invite, error: inviteError } = await supabase
      .from('user_invitations')
      .insert({
        email: validated.email,
        organization_id: organizationId,
        role: validated.role || 'COMPVSS_VIEWER',
        invite_code: inviteCode,
        expires_at: expiresAt.toISOString(),
        invited_by: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Invite creation error:', inviteError);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      invite: {
        id: invite.id,
        code: inviteCode,
        expiresAt: expiresAt.toISOString(),
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 });
  }
}
