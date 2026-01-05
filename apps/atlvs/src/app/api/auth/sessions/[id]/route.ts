export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';
import { logger } from '@ghxstship/config';

// Schema for revoking a session
const revokeSessionSchema = z.object({
  reason: z.string().optional() });

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/auth/sessions/[id]
 * Get details of a specific session
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const supabase = createAdminClient();
  
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get platform user
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (platformError || !platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the session
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', platformUser.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    logger.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions/[id]
 * Revoke a specific session
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const supabase = createAdminClient();
  
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get platform user
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (platformError || !platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse optional reason from body
    let reason: string | undefined;
    try {
      const body = await request.json();
      const validatedData = revokeSessionSchema.parse(body);
      reason = validatedData.reason;
    } catch {
      // Body is optional, continue without reason
    }

    // Check if session exists and belongs to user
    const { data: existingSession, error: checkError } = await supabase
      .from('user_sessions')
      .select('id, status, is_current')
      .eq('id', params.id)
      .eq('user_id', platformUser.id)
      .single();

    if (checkError || !existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (existingSession.status !== 'active') {
      return NextResponse.json(
        { error: 'Session is already revoked or expired' },
        { status: 400 }
      );
    }

    // Warn if revoking current session
    if (existingSession.is_current) {
      logger.warn('User revoking their current session', {
        user_id: platformUser.id,
        session_id: params.id });
    }

    // Revoke the session
    const { data: revokedSession, error: revokeError } = await supabase
      .from('user_sessions')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: platformUser.id,
        revoke_reason: reason || 'User revoked session' })
      .eq('id', params.id)
      .eq('user_id', platformUser.id)
      .select()
      .single();

    if (revokeError) {
      throw revokeError;
    }

    logger.info('Session revoked', {
      user_id: platformUser.id,
      session_id: params.id,
      was_current: existingSession.is_current });

    return NextResponse.json({
      message: 'Session revoked successfully',
      session: revokedSession });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Revoke session error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/sessions/[id]
 * Update session activity (touch)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const supabase = createAdminClient();
  
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get platform user
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (platformError || !platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update last_active_at
    const { data: session, error: updateError } = await supabase
      .from('user_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', platformUser.id)
      .eq('status', 'active')
      .select()
      .single();

    if (updateError || !session) {
      return NextResponse.json({ error: 'Session not found or inactive' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    logger.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
