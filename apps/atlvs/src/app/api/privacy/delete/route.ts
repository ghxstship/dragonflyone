import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const deleteSchema = z.object({
  confirmation: z.literal('DELETE MY DATA'),
  reason: z.string().optional(),
});

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

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id, email')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = deleteSchema.parse(body);

    // Create a DSR record for audit purposes
    const { data: dsr } = await supabase
      .from('data_subject_requests')
      .insert({
        organization_id: platformUser.organization_id,
        user_id: platformUser.id,
        email: platformUser.email,
        request_type: 'erasure',
        description: validated.reason || 'User-initiated account deletion',
        verification_method: 'account_login',
        verified_at: new Date().toISOString(),
        status: 'in_progress',
        deadline_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    // Anonymize user data instead of hard delete (preserves referential integrity)
    await supabase.rpc('anonymize_user_data', { p_user_id: platformUser.id });

    // Delete consent records
    await supabase
      .from('consent_records')
      .delete()
      .eq('user_id', platformUser.id);

    // Delete notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', platformUser.id);

    // Delete user sessions
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', platformUser.id);

    // Delete login attempts
    await supabase
      .from('login_attempts')
      .delete()
      .eq('user_id', platformUser.id);

    // Update DSR as completed
    if (dsr) {
      await supabase
        .from('data_subject_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: 'User data anonymized and personal records deleted',
        })
        .eq('id', dsr.id);
    }

    // Log the action
    await supabase.rpc('log_privacy_action', {
      p_organization_id: platformUser.organization_id,
      p_user_id: platformUser.id,
      p_action_type: 'data_deleted',
      p_entity_type: 'platform_users',
      p_entity_id: platformUser.id,
      p_details: { reason: validated.reason, dsr_id: dsr?.id },
    });

    // Sign out the user from Supabase Auth
    await supabase.auth.admin.signOut(user.id);

    return NextResponse.json({
      message: 'Your data has been deleted and your account has been anonymized.',
      dsr_id: dsr?.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Delete data error:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}
