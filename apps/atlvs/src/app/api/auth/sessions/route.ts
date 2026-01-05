export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';
import { logger } from '@ghxstship/config';
import { headers } from 'next/headers';
import UAParser from 'ua-parser-js';

// Schema for creating a new session
const createSessionSchema = z.object({
  session_token: z.string().min(1),
  refresh_token: z.string().optional(),
  expires_in_days: z.number().min(1).max(30).default(7) });

// Schema for revoking all other sessions
const revokeAllSchema = z.object({
  current_session_id: z.string().uuid() });

/**
 * GET /api/auth/sessions
 * List all active sessions for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get platform user ID
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (platformError || !platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', platformUser.id)
      .order('last_active_at', { ascending: false });

    if (sessionsError) {
      throw sessionsError;
    }

    // Format sessions for response
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      device_type: session.device_type,
      device_name: session.device_name,
      browser: session.browser,
      os: session.os,
      ip_address: session.ip_address,
      city: session.city,
      region: session.region,
      country: session.country,
      is_current: session.is_current,
      status: session.status,
      created_at: session.created_at,
      last_active_at: session.last_active_at,
      expires_at: session.expires_at }));

    // Get session counts
    const activeCount = sessions.filter(s => s.status === 'active').length;
    const totalCount = sessions.length;

    return NextResponse.json({
      sessions: formattedSessions,
      meta: {
        active_count: activeCount,
        total_count: totalCount } });
  } catch (error) {
    logger.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/sessions
 * Create a new session (called during login)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    // Get platform user
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (platformError || !platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse user agent for device info
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    // Get IP address
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || '0.0.0.0';

    // Determine device type
    const deviceType = uaResult.device.type || 'desktop';
    const deviceName = `${uaResult.browser.name || 'Unknown'} on ${uaResult.os.name || 'Unknown'}`;
    const browser = uaResult.browser.name 
      ? `${uaResult.browser.name} ${uaResult.browser.version || ''}`.trim()
      : null;
    const os = uaResult.os.name
      ? `${uaResult.os.name} ${uaResult.os.version || ''}`.trim()
      : null;

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expires_in_days);

    // Clear is_current flag from other sessions
    await supabase
      .from('user_sessions')
      .update({ is_current: false })
      .eq('user_id', platformUser.id)
      .eq('is_current', true);

    // Create new session
    const { data: session, error: createError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: platformUser.id,
        organization_id: platformUser.organization_id,
        session_token: validatedData.session_token,
        refresh_token: validatedData.refresh_token,
        device_type: deviceType,
        device_name: deviceName,
        browser: browser,
        os: os,
        ip_address: ipAddress,
        user_agent: userAgent,
        is_current: true,
        status: 'active',
        expires_at: expiresAt.toISOString() })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    logger.info('Session created', { 
      user_id: platformUser.id, 
      session_id: session.id,
      device_type: deviceType });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions
 * Revoke all sessions except current (sign out all other devices)
 */
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = revokeAllSchema.parse(body);

    // Get platform user
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (platformError || !platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Revoke all sessions except the current one
    const { data: revokedSessions, error: revokeError } = await supabase
      .from('user_sessions')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: platformUser.id,
        revoke_reason: 'Signed out from all other devices' })
      .eq('user_id', platformUser.id)
      .neq('id', validatedData.current_session_id)
      .eq('status', 'active')
      .select();

    if (revokeError) {
      throw revokeError;
    }

    const revokedCount = revokedSessions?.length || 0;

    logger.info('Sessions revoked', { 
      user_id: platformUser.id, 
      revoked_count: revokedCount });

    return NextResponse.json({
      message: `Successfully signed out from ${revokedCount} other device(s)`,
      revoked_count: revokedCount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Revoke all sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
