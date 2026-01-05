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

const billingSettingsSchema = z.object({
  billing_email: z.string().email().optional(),
  billing_address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional() }).optional(),
  tax_id: z.string().optional(),
  payment_method_id: z.string().optional(),
  auto_pay: z.boolean().optional(),
  invoice_prefix: z.string().optional() });

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json({
        settings: {
          billing_email: null,
          billing_address: null,
          tax_id: null,
          payment_method_id: null,
          auto_pay: true,
          invoice_prefix: 'INV',
          current_plan: 'free',
          usage: { events: 0, team_members: 0, storage_gb: 0 } } });
    }

    const { data, error } = await supabase
      .from('organization_billing_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json({
          settings: {
            billing_email: null,
            billing_address: null,
            tax_id: null,
            payment_method_id: null,
            auto_pay: true,
            invoice_prefix: 'INV',
            current_plan: 'free',
            usage: { events: 0, team_members: 0, storage_gb: 0 } } });
      }
      return NextResponse.json({
        settings: {
          billing_email: null,
          billing_address: null,
          tax_id: null,
          payment_method_id: null,
          auto_pay: true,
          invoice_prefix: 'INV',
          current_plan: 'free',
          usage: { events: 0, team_members: 0, storage_gb: 0 } } });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    logger.error('Error in GET /api/settings/billing:', error instanceof Error ? error : undefined);
    return NextResponse.json({
      settings: {
        billing_email: null,
        billing_address: null,
        tax_id: null,
        payment_method_id: null,
        auto_pay: true,
        invoice_prefix: 'INV',
        current_plan: 'free',
        usage: { events: 0, team_members: 0, storage_gb: 0 } } });
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
    const { organization_id, ...settings } = body;
    const validated = billingSettingsSchema.parse(settings);

    if (!organization_id) {
      return NextResponse.json({ error: 'organization_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('organization_billing_settings')
      .upsert({
        organization_id,
        ...validated,
        updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      logger.error('Error updating billing settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PUT /api/settings/billing:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
