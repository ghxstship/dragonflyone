import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.string().min(1),
  additionalRoles: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const validated = roleSchema.parse(body);

    // Update profile with role selection
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        metadata: {
          selected_role: validated.role,
          additional_roles: validated.additionalRoles || [],
        },
        onboarding_step: 3,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true, step: 'role' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Role update error:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
