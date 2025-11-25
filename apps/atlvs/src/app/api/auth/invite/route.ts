import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  expires_in_days: z.number().int().min(1).max(30).default(7),
  message: z.string().optional(),
});

function generateInviteCode(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get inviting user's platform user record
    const { data: invitingUser } = await supabase
      .from('platform_users')
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!invitingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to invite
    const canInvite = invitingUser.platform_roles?.some((role: string) =>
      ['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN'].includes(role)
    );

    if (!canInvite) {
      return NextResponse.json(
        { error: 'You do not have permission to invite users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = inviteSchema.parse(body);

    // Check if email already has pending invite
    const { data: existingInvite } = await supabase
      .from('user_invitations')
      .select('id')
      .eq('email', validated.email)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An active invitation already exists for this email' },
        { status: 409 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', validated.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validated.expires_in_days);

    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .insert({
        email: validated.email,
        invite_code: inviteCode,
        role: validated.role || 'ATLVS_VIEWER',
        organization_id: validated.organization_id || invitingUser.organization_id,
        invited_by: invitingUser.id,
        expires_at: expiresAt.toISOString(),
        message: validated.message,
      })
      .select()
      .single();

    if (error) throw error;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://atlvs.ghxstship.com';
    const inviteUrl = `${baseUrl}/auth/signup?invite=${inviteCode}`;

    // TODO: Send invitation email via notification service

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        invite_url: inviteUrl,
        expires_at: invitation.expires_at,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Invite error:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: invitingUser } = await supabase
      .from('platform_users')
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!invitingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, used, expired

    let query = supabase
      .from('user_invitations')
      .select(`
        id, email, role, expires_at, used_at, created_at,
        invited_by_user:platform_users!invited_by(id, email, full_name)
      `)
      .eq('organization_id', invitingUser.organization_id)
      .order('created_at', { ascending: false });

    if (status === 'pending') {
      query = query.is('used_at', null).gt('expires_at', new Date().toISOString());
    } else if (status === 'used') {
      query = query.not('used_at', 'is', null);
    } else if (status === 'expired') {
      query = query.is('used_at', null).lt('expires_at', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to get invitations' },
      { status: 500 }
    );
  }
}
