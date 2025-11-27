import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  organizationId: z.string().uuid().optional(),
  inviteCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = signUpSchema.parse(body);
    const fullName = `${validated.firstName} ${validated.lastName}`;

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', validated.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Validate invite code if provided
    let organizationId = validated.organizationId;
    let assignedRoles: string[] = ['COMPVSS_VIEWER'];

    if (validated.inviteCode) {
      const { data: invite } = await supabase
        .from('user_invitations')
        .select('id, organization_id, role, expires_at, used_at')
        .eq('invite_code', validated.inviteCode)
        .single();

      if (!invite) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 400 }
        );
      }

      if (invite.used_at) {
        return NextResponse.json(
          { error: 'Invite code already used' },
          { status: 400 }
        );
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Invite code expired' },
          { status: 400 }
        );
      }

      organizationId = invite.organization_id;
      if (invite.role) {
        assignedRoles = [invite.role];
      }

      // Mark invite as used
      await supabase
        .from('user_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        first_name: validated.firstName,
        last_name: validated.lastName,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create platform user
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .insert({
        auth_user_id: authData.user.id,
        email: validated.email,
        full_name: fullName,
        organization_id: organizationId,
        platform_roles: assignedRoles,
        status: 'active',
      })
      .select()
      .single();

    if (platformError) {
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw platformError;
    }

    // Log sign-up activity
    await supabase.from('audit_logs').insert({
      user_id: platformUser.id,
      action: 'sign_up',
      resource_type: 'auth',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      metadata: { email: validated.email, platform: 'compvss' },
    });

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        ...platformUser,
      },
      message: 'Account created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
