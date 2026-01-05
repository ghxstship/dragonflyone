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

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const integrationSettingsSchema = z.object({
  slack_enabled: z.boolean().optional(),
  slack_webhook_url: z.string().url().optional().nullable(),
  google_calendar_enabled: z.boolean().optional(),
  stripe_enabled: z.boolean().optional(),
  quickbooks_enabled: z.boolean().optional(),
  hubspot_enabled: z.boolean().optional(),
  salesforce_enabled: z.boolean().optional() });

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const userId = authResult.user?.id;

    const { data, error } = await supabase
      .from('user_integration_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json({
          settings: {
            slack_enabled: false,
            slack_webhook_url: null,
            google_calendar_enabled: false,
            stripe_enabled: false,
            quickbooks_enabled: false,
            hubspot_enabled: false,
            salesforce_enabled: false } });
      }
      return NextResponse.json({
        settings: {
          slack_enabled: false,
          slack_webhook_url: null,
          google_calendar_enabled: false,
          stripe_enabled: false,
          quickbooks_enabled: false,
          hubspot_enabled: false,
          salesforce_enabled: false } });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    logger.error('Error in GET /api/settings/integrations:', error instanceof Error ? error : undefined);
    return NextResponse.json({
      settings: {
        slack_enabled: false,
        slack_webhook_url: null,
        google_calendar_enabled: false,
        stripe_enabled: false,
        quickbooks_enabled: false,
        hubspot_enabled: false,
        salesforce_enabled: false } });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const userId = authResult.user?.id;
    const body = await request.json();
    const validated = integrationSettingsSchema.parse(body);

    const { data, error } = await supabase
      .from('user_integration_settings')
      .upsert({
        user_id: userId,
        ...validated,
        updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      logger.error('Error updating integration settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PUT /api/settings/integrations:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
