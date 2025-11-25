import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RegionConfigSchema = z.object({
  region_code: z.string(),
  name: z.string(),
  data_retention_days: z.number().optional(),
  consent_required: z.boolean().default(true),
  cookie_consent_required: z.boolean().default(true),
  right_to_deletion: z.boolean().default(true),
  data_portability: z.boolean().default(true),
  breach_notification_hours: z.number().optional(),
  dpo_required: z.boolean().default(false),
  cross_border_transfer_allowed: z.boolean().default(true),
  allowed_transfer_regions: z.array(z.string()).optional(),
  tax_requirements: z.object({
    vat_required: z.boolean().default(false),
    vat_rate: z.number().optional(),
    invoice_requirements: z.array(z.string()).optional(),
  }).optional(),
});

// GET /api/compliance/regional - Get regional compliance settings
export async function GET(request: NextRequest) {
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
    const regionCode = searchParams.get('region');

    if (action === 'regions') {
      // Get all configured regions
      const { data: regions } = await supabase
        .from('compliance_regions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return NextResponse.json({ regions: regions || [] });
    }

    if (action === 'config' && regionCode) {
      // Get specific region configuration
      const { data: region } = await supabase
        .from('compliance_regions')
        .select('*')
        .eq('region_code', regionCode)
        .single();

      if (!region) {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 });
      }

      return NextResponse.json({ region });
    }

    if (action === 'user_region') {
      // Detect user's region based on IP or profile
      const { data: profile } = await supabase
        .from('platform_users')
        .select('country, state')
        .eq('id', user.id)
        .single();

      // Map country to compliance region
      const regionMapping: Record<string, string> = {
        // EU countries
        'AT': 'EU', 'BE': 'EU', 'BG': 'EU', 'HR': 'EU', 'CY': 'EU',
        'CZ': 'EU', 'DK': 'EU', 'EE': 'EU', 'FI': 'EU', 'FR': 'EU',
        'DE': 'EU', 'GR': 'EU', 'HU': 'EU', 'IE': 'EU', 'IT': 'EU',
        'LV': 'EU', 'LT': 'EU', 'LU': 'EU', 'MT': 'EU', 'NL': 'EU',
        'PL': 'EU', 'PT': 'EU', 'RO': 'EU', 'SK': 'EU', 'SI': 'EU',
        'ES': 'EU', 'SE': 'EU',
        // UK
        'GB': 'UK',
        // US states with specific laws
        'US': 'US',
        // APAC
        'AU': 'APAC', 'NZ': 'APAC', 'SG': 'APAC', 'JP': 'APAC', 'KR': 'APAC',
        // LATAM
        'BR': 'LATAM', 'MX': 'LATAM', 'AR': 'LATAM', 'CL': 'LATAM', 'CO': 'LATAM',
        // Canada
        'CA': 'CA',
      };

      const detectedRegion = regionMapping[profile?.country || ''] || 'DEFAULT';

      // Get region config
      const { data: regionConfig } = await supabase
        .from('compliance_regions')
        .select('*')
        .eq('region_code', detectedRegion)
        .single();

      // Check for US state-specific requirements (CCPA for California)
      let stateOverrides = null;
      if (profile?.country === 'US' && profile?.state === 'CA') {
        const { data: ccpaConfig } = await supabase
          .from('compliance_regions')
          .select('*')
          .eq('region_code', 'US_CA')
          .single();
        stateOverrides = ccpaConfig;
      }

      return NextResponse.json({
        detected_region: detectedRegion,
        config: stateOverrides || regionConfig,
        user_country: profile?.country,
        user_state: profile?.state,
      });
    }

    if (action === 'requirements') {
      // Get compliance requirements for a specific operation
      const operation = searchParams.get('operation');

      const requirements: Record<string, any> = {
        data_collection: {
          EU: { consent_required: true, purpose_limitation: true, data_minimization: true },
          UK: { consent_required: true, purpose_limitation: true, data_minimization: true },
          US_CA: { opt_out_required: true, disclosure_required: true },
          US: { privacy_policy_required: true },
          APAC: { consent_required: true, cross_border_notice: true },
          LATAM: { consent_required: true, lgpd_compliance: true },
          CA: { consent_required: true, pipeda_compliance: true },
        },
        data_transfer: {
          EU: { adequacy_decision_required: true, sccs_required: true },
          UK: { adequacy_decision_required: true },
          APAC: { cross_border_consent: true },
        },
        data_retention: {
          EU: { max_retention_days: 1095, purpose_based: true },
          UK: { max_retention_days: 1095, purpose_based: true },
          US_CA: { disclosure_required: true },
        },
        breach_notification: {
          EU: { notification_hours: 72, dpa_notification: true },
          UK: { notification_hours: 72, ico_notification: true },
          US_CA: { notification_required: true },
          APAC: { notification_required: true },
        },
      };

      return NextResponse.json({
        operation,
        requirements: requirements[operation || ''] || {},
      });
    }

    if (action === 'audit_log') {
      // Get compliance audit log
      const { data: logs } = await supabase
        .from('compliance_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      return NextResponse.json({ logs: logs || [] });
    }

    if (action === 'data_inventory') {
      // Get data inventory for compliance reporting
      const { data: inventory } = await supabase
        .from('data_inventory')
        .select('*')
        .order('category');

      return NextResponse.json({ inventory: inventory || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch compliance data' }, { status: 500 });
  }
}

// POST /api/compliance/regional - Configure regional compliance
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

    const body = await request.json();
    const action = body.action || 'configure_region';

    if (action === 'configure_region') {
      const validated = RegionConfigSchema.parse(body);

      const { data: region, error } = await supabase
        .from('compliance_regions')
        .upsert({
          ...validated,
          is_active: true,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'region_code' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log configuration change
      await supabase.from('compliance_audit_log').insert({
        action: 'region_configured',
        entity_type: 'compliance_region',
        entity_id: region.id,
        details: { region_code: validated.region_code },
        performed_by: user.id,
      });

      return NextResponse.json({ region });
    } else if (action === 'log_consent') {
      const { user_id, consent_type, granted, region, purpose } = body;

      const { data: consent, error } = await supabase
        .from('user_consents')
        .insert({
          user_id: user_id || user.id,
          consent_type,
          granted,
          region,
          purpose,
          ip_address: request.headers.get('x-forwarded-for'),
          user_agent: request.headers.get('user-agent'),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ consent }, { status: 201 });
    } else if (action === 'log_data_access') {
      const { data_type, purpose, accessed_by, user_id } = body;

      await supabase.from('compliance_audit_log').insert({
        action: 'data_accessed',
        entity_type: data_type,
        entity_id: user_id,
        details: { purpose, accessed_by },
        performed_by: user.id,
      });

      return NextResponse.json({ success: true });
    } else if (action === 'report_breach') {
      const { description, affected_users, data_types, severity, discovered_at } = body;

      const { data: breach, error } = await supabase
        .from('data_breaches')
        .insert({
          description,
          affected_users,
          data_types,
          severity,
          discovered_at: discovered_at || new Date().toISOString(),
          status: 'investigating',
          reported_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Notify DPO if configured
      await supabase.from('unified_notifications').insert({
        user_id: user.id, // Should be DPO
        title: 'Data Breach Reported',
        message: `A data breach has been reported: ${description}`,
        type: 'error',
        priority: 'critical',
        source_platform: 'atlvs',
        source_entity_type: 'data_breach',
        source_entity_id: breach.id,
      });

      return NextResponse.json({ breach }, { status: 201 });
    } else if (action === 'add_data_inventory') {
      const { category, data_type, description, retention_period, legal_basis, processing_purposes } = body;

      const { data: item, error } = await supabase
        .from('data_inventory')
        .insert({
          category,
          data_type,
          description,
          retention_period,
          legal_basis,
          processing_purposes,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ item }, { status: 201 });
    } else if (action === 'generate_ropa') {
      // Generate Record of Processing Activities (GDPR requirement)
      const { data: inventory } = await supabase
        .from('data_inventory')
        .select('*')
        .order('category');

      const { data: regions } = await supabase
        .from('compliance_regions')
        .select('*')
        .eq('is_active', true);

      const ropa = {
        generated_at: new Date().toISOString(),
        controller: {
          name: 'GHXSTSHIP Industries',
          contact: 'dpo@ghxstship.com',
        },
        processing_activities: inventory?.map(item => ({
          category: item.category,
          data_type: item.data_type,
          purposes: item.processing_purposes,
          legal_basis: item.legal_basis,
          retention: item.retention_period,
          recipients: item.recipients || [],
          transfers: item.international_transfers || [],
          security_measures: item.security_measures || [],
        })),
        regions_covered: regions?.map(r => r.region_code),
      };

      // Store ROPA
      await supabase.from('compliance_reports').insert({
        report_type: 'ropa',
        data: ropa,
        generated_by: user.id,
      });

      return NextResponse.json({ ropa });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
