import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const DataResidencyConfigSchema = z.object({
  organization_id: z.string().uuid(),
  primary_region: z.enum(['us-east', 'us-west', 'eu-west', 'eu-central', 'apac-southeast', 'apac-northeast']),
  backup_region: z.enum(['us-east', 'us-west', 'eu-west', 'eu-central', 'apac-southeast', 'apac-northeast']).optional(),
  data_classification: z.enum(['public', 'internal', 'confidential', 'restricted']).default('internal'),
  encryption_at_rest: z.boolean().default(true),
  encryption_in_transit: z.boolean().default(true),
  cross_border_allowed: z.boolean().default(false),
  allowed_regions: z.array(z.string()).optional(),
  retention_policy: z.object({
    default_days: z.number().default(365),
    pii_days: z.number().default(90),
    financial_days: z.number().default(2555), // 7 years
    audit_days: z.number().default(2555),
  }).optional(),
});

// GET /api/enterprise/data-residency - Get data residency configuration
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const organizationId = searchParams.get('organization_id');

    if (action === 'regions') {
      // Get available data center regions
      const regions = [
        { id: 'us-east', name: 'US East (Virginia)', country: 'US', provider: 'AWS/Vercel', latency: 'low' },
        { id: 'us-west', name: 'US West (Oregon)', country: 'US', provider: 'AWS/Vercel', latency: 'low' },
        { id: 'eu-west', name: 'EU West (Ireland)', country: 'IE', provider: 'AWS/Vercel', latency: 'medium' },
        { id: 'eu-central', name: 'EU Central (Frankfurt)', country: 'DE', provider: 'AWS/Vercel', latency: 'medium' },
        { id: 'apac-southeast', name: 'APAC Southeast (Singapore)', country: 'SG', provider: 'AWS/Vercel', latency: 'medium' },
        { id: 'apac-northeast', name: 'APAC Northeast (Tokyo)', country: 'JP', provider: 'AWS/Vercel', latency: 'medium' },
      ];

      return NextResponse.json({ regions });
    }

    if (action === 'config' && organizationId) {
      const { data: config } = await supabase
        .from('data_residency_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      return NextResponse.json({ config: config || null });
    }

    if (action === 'data_locations') {
      // Get where organization's data is stored
      const { data: locations } = await supabase
        .from('data_location_registry')
        .select('*')
        .eq('organization_id', organizationId)
        .order('data_type');

      return NextResponse.json({ locations: locations || [] });
    }

    if (action === 'compliance_status') {
      // Check compliance with data residency requirements
      const { data: config } = await supabase
        .from('data_residency_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      if (!config) {
        return NextResponse.json({ error: 'No configuration found' }, { status: 404 });
      }

      const { data: locations } = await supabase
        .from('data_location_registry')
        .select('region, data_type')
        .eq('organization_id', organizationId);

      // Check for violations
      const violations: string[] = [];
      const allowedRegions = config.allowed_regions || [config.primary_region, config.backup_region].filter(Boolean);

      locations?.forEach(loc => {
        if (!allowedRegions.includes(loc.region)) {
          violations.push(`Data type "${loc.data_type}" stored in unauthorized region: ${loc.region}`);
        }
      });

      return NextResponse.json({
        compliant: violations.length === 0,
        violations,
        config: {
          primary_region: config.primary_region,
          allowed_regions: allowedRegions,
        },
      });
    }

    if (action === 'transfer_requests') {
      // Get pending data transfer requests
      const { data: requests } = await supabase
        .from('data_transfer_requests')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      return NextResponse.json({ requests: requests || [] });
    }

    if (action === 'audit_trail') {
      // Get data residency audit trail
      const { data: audit } = await supabase
        .from('data_residency_audit')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100);

      return NextResponse.json({ audit: audit || [] });
    }

    // List all configs for admin
    const { data: configs } = await supabase
      .from('data_residency_configs')
      .select(`
        *,
        organization:organizations(name)
      `)
      .order('created_at', { ascending: false });

    return NextResponse.json({ configs: configs || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data residency info' }, { status: 500 });
  }
}

// POST /api/enterprise/data-residency - Configure data residency
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'configure';

    if (action === 'configure') {
      const validated = DataResidencyConfigSchema.parse(body);

      const { data: config, error } = await supabase
        .from('data_residency_configs')
        .upsert({
          ...validated,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log configuration change
      await supabase.from('data_residency_audit').insert({
        organization_id: validated.organization_id,
        action: 'config_updated',
        details: { primary_region: validated.primary_region },
        performed_by: user.id,
      });

      return NextResponse.json({ config });
    } else if (action === 'request_transfer') {
      const { organization_id, data_type, from_region, to_region, reason } = body;

      // Validate transfer is allowed
      const { data: config } = await supabase
        .from('data_residency_configs')
        .select('cross_border_allowed, allowed_regions')
        .eq('organization_id', organization_id)
        .single();

      if (!config?.cross_border_allowed) {
        return NextResponse.json({ error: 'Cross-border transfers not allowed' }, { status: 400 });
      }

      if (config.allowed_regions && !config.allowed_regions.includes(to_region)) {
        return NextResponse.json({ error: 'Target region not in allowed list' }, { status: 400 });
      }

      const { data: request, error } = await supabase
        .from('data_transfer_requests')
        .insert({
          organization_id,
          data_type,
          from_region,
          to_region,
          reason,
          status: 'pending',
          requested_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ request }, { status: 201 });
    } else if (action === 'approve_transfer') {
      const { request_id } = body;

      const { data: request, error } = await supabase
        .from('data_transfer_requests')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', request_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log approval
      await supabase.from('data_residency_audit').insert({
        organization_id: request.organization_id,
        action: 'transfer_approved',
        details: { request_id, from: request.from_region, to: request.to_region },
        performed_by: user.id,
      });

      return NextResponse.json({ request });
    } else if (action === 'reject_transfer') {
      const { request_id, rejection_reason } = body;

      const { data: request, error } = await supabase
        .from('data_transfer_requests')
        .update({
          status: 'rejected',
          rejection_reason,
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
        })
        .eq('id', request_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ request });
    } else if (action === 'register_data_location') {
      const { organization_id, data_type, region, storage_provider, encryption_key_id } = body;

      const { data: location, error } = await supabase
        .from('data_location_registry')
        .upsert({
          organization_id,
          data_type,
          region,
          storage_provider,
          encryption_key_id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id,data_type' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ location });
    } else if (action === 'generate_report') {
      const { organization_id, report_type } = body;

      // Generate data residency report
      const { data: config } = await supabase
        .from('data_residency_configs')
        .select('*')
        .eq('organization_id', organization_id)
        .single();

      const { data: locations } = await supabase
        .from('data_location_registry')
        .select('*')
        .eq('organization_id', organization_id);

      const { data: transfers } = await supabase
        .from('data_transfer_requests')
        .select('*')
        .eq('organization_id', organization_id)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      const report = {
        generated_at: new Date().toISOString(),
        organization_id,
        configuration: config,
        data_locations: locations,
        transfer_history: transfers,
        compliance_summary: {
          primary_region: config?.primary_region,
          data_types_count: locations?.length || 0,
          transfers_count: transfers?.length || 0,
          encryption_enabled: config?.encryption_at_rest && config?.encryption_in_transit,
        },
      };

      // Store report
      await supabase.from('compliance_reports').insert({
        report_type: 'data_residency',
        data: report,
        generated_by: user.id,
      });

      return NextResponse.json({ report });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
