export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const adminSettingsSchema = z.object({
  maintenance_mode: z.boolean().optional(),
  registration_enabled: z.boolean().optional(),
  require_email_verification: z.boolean().optional(),
  max_team_size: z.number().int().positive().optional(),
  session_timeout_minutes: z.number().int().positive().optional(),
  password_min_length: z.number().int().min(8).optional(),
  require_2fa: z.boolean().optional(),
  allowed_domains: z.array(z.string()).optional(),
  feature_flags: z.record(z.boolean()).optional() });

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json({
          settings: {
            maintenance_mode: false,
            registration_enabled: true,
            require_email_verification: true,
            max_team_size: 50,
            session_timeout_minutes: 60,
            password_min_length: 8,
            require_2fa: false,
            allowed_domains: [],
            feature_flags: {} } });
      }
      return NextResponse.json({
        settings: {
          maintenance_mode: false,
          registration_enabled: true,
          require_email_verification: true,
          max_team_size: 50,
          session_timeout_minutes: 60,
          password_min_length: 8,
          require_2fa: false,
          allowed_domains: [],
          feature_flags: {} } });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    logger.error('Error in GET /api/admin/settings:', error instanceof Error ? error : undefined);
    return NextResponse.json({
      settings: {
        maintenance_mode: false,
        registration_enabled: true,
        require_email_verification: true,
        max_team_size: 50,
        session_timeout_minutes: 60,
        password_min_length: 8,
        require_2fa: false,
        allowed_domains: [],
        feature_flags: {} } });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = adminSettingsSchema.parse(body);

    const { data, error } = await supabase
      .from('admin_settings')
      .upsert({
        id: 1,
        ...validated,
        updated_at: new Date().toISOString(),
        updated_by: authResult.user?.id })
      .select()
      .single();

    if (error) {
      logger.error('Error updating admin settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PUT /api/admin/settings:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
