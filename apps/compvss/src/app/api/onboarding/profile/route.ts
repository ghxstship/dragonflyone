import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const profileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  displayName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
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
    const validated = profileSchema.parse(body);

    // Update platform_users
    const { error: platformError } = await supabase
      .from('platform_users')
      .update({
        full_name: `${validated.firstName} ${validated.lastName}`,
        avatar_url: validated.avatarUrl || null,
      })
      .eq('auth_user_id', user.id);

    if (platformError) {
      console.error('Platform user update error:', platformError);
    }

    // Update profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: validated.firstName,
        last_name: validated.lastName,
        display_name: validated.displayName || `${validated.firstName} ${validated.lastName}`,
        phone: validated.phone || null,
        bio: validated.bio || null,
        avatar_url: validated.avatarUrl || null,
        onboarding_step: 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, step: 'profile' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
