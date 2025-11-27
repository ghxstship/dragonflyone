import { NextRequest, NextResponse } from 'next/server';
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

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
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

    // Create platform user with GVTEWAY_MEMBER role
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .insert({
        auth_user_id: authData.user.id,
        email: validated.email,
        full_name: fullName,
        platform_roles: ['GVTEWAY_MEMBER'],
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
      metadata: { email: validated.email, platform: 'gvteway' },
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
