import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const WhiteLabelConfigSchema = z.object({
  organization_id: z.string().uuid(),
  brand_name: z.string(),
  domain: z.string().optional(),
  logo_url: z.string().optional(),
  favicon_url: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  font_family: z.string().optional(),
  custom_css: z.string().optional(),
  email_from_name: z.string().optional(),
  email_from_address: z.string().email().optional(),
  support_email: z.string().email().optional(),
  support_phone: z.string().optional(),
  terms_url: z.string().optional(),
  privacy_url: z.string().optional(),
  features: z.object({
    hide_powered_by: z.boolean().default(false),
    custom_login_page: z.boolean().default(false),
    custom_email_templates: z.boolean().default(false),
    custom_domain: z.boolean().default(false),
    api_white_label: z.boolean().default(false),
  }).optional(),
});

// GET /api/enterprise/white-label - Get white-label configuration
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
    const domain = searchParams.get('domain');

    if (action === 'by_domain' && domain) {
      // Get white-label config by custom domain
      const { data: config } = await supabase
        .from('white_label_configs')
        .select('*')
        .eq('domain', domain)
        .eq('is_active', true)
        .single();

      if (!config) {
        return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
      }

      // Return public config only
      return NextResponse.json({
        brand_name: config.brand_name,
        logo_url: config.logo_url,
        favicon_url: config.favicon_url,
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
        accent_color: config.accent_color,
        font_family: config.font_family,
        custom_css: config.custom_css,
        terms_url: config.terms_url,
        privacy_url: config.privacy_url,
        features: config.features,
      });
    }

    if (action === 'config' && organizationId) {
      // Get full config for organization admin
      const { data: config } = await supabase
        .from('white_label_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      return NextResponse.json({ config: config || null });
    }

    if (action === 'themes') {
      // Get available theme presets
      const themes = [
        {
          id: 'default',
          name: 'Default',
          primary_color: '#6366f1',
          secondary_color: '#8b5cf6',
          accent_color: '#f59e0b',
        },
        {
          id: 'dark',
          name: 'Dark Mode',
          primary_color: '#1e293b',
          secondary_color: '#334155',
          accent_color: '#38bdf8',
        },
        {
          id: 'corporate',
          name: 'Corporate',
          primary_color: '#1e40af',
          secondary_color: '#3b82f6',
          accent_color: '#10b981',
        },
        {
          id: 'entertainment',
          name: 'Entertainment',
          primary_color: '#7c3aed',
          secondary_color: '#a855f7',
          accent_color: '#ec4899',
        },
        {
          id: 'minimal',
          name: 'Minimal',
          primary_color: '#18181b',
          secondary_color: '#27272a',
          accent_color: '#fafafa',
        },
      ];

      return NextResponse.json({ themes });
    }

    if (action === 'email_templates') {
      // Get custom email templates
      const { data: templates } = await supabase
        .from('white_label_email_templates')
        .select('*')
        .eq('organization_id', organizationId)
        .order('template_type');

      return NextResponse.json({ templates: templates || [] });
    }

    if (action === 'analytics') {
      // Get white-label usage analytics
      const { data: configs } = await supabase
        .from('white_label_configs')
        .select('id, brand_name, domain, created_at, is_active');

      const { data: usage } = await supabase
        .from('white_label_usage')
        .select('config_id, page_views, unique_visitors, period')
        .gte('period', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

      return NextResponse.json({
        configs: configs || [],
        usage: usage || [],
      });
    }

    // List all white-label configs for admin
    const { data: configs } = await supabase
      .from('white_label_configs')
      .select(`
        *,
        organization:organizations(name)
      `)
      .order('created_at', { ascending: false });

    return NextResponse.json({ configs: configs || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}

// POST /api/enterprise/white-label - Create or update white-label config
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
    const action = body.action || 'create';

    if (action === 'create' || action === 'update') {
      const validated = WhiteLabelConfigSchema.parse(body);

      // Check if domain is already in use
      if (validated.domain) {
        const { data: existing } = await supabase
          .from('white_label_configs')
          .select('id')
          .eq('domain', validated.domain)
          .neq('organization_id', validated.organization_id)
          .single();

        if (existing) {
          return NextResponse.json({ error: 'Domain already in use' }, { status: 400 });
        }
      }

      const { data: config, error } = await supabase
        .from('white_label_configs')
        .upsert({
          ...validated,
          is_active: true,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ config }, { status: action === 'create' ? 201 : 200 });
    } else if (action === 'upload_logo') {
      const { organization_id, logo_data, logo_type } = body;

      // In production, this would upload to storage
      // For now, we'll just store the URL
      const logoUrl = `https://storage.ghxstship.com/white-label/${organization_id}/${logo_type}.png`;

      await supabase
        .from('white_label_configs')
        .update({
          [logo_type === 'favicon' ? 'favicon_url' : 'logo_url']: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', organization_id);

      return NextResponse.json({ url: logoUrl });
    } else if (action === 'save_email_template') {
      const { organization_id, template_type, subject, html_content, text_content } = body;

      const { data: template, error } = await supabase
        .from('white_label_email_templates')
        .upsert({
          organization_id,
          template_type,
          subject,
          html_content,
          text_content,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'organization_id,template_type' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ template });
    } else if (action === 'verify_domain') {
      const { organization_id, domain } = body;

      // Generate verification record
      const verificationToken = `ghxstship-verify-${Date.now()}-${Math.random().toString(36).substring(2)}`;

      await supabase
        .from('white_label_configs')
        .update({
          domain_verification_token: verificationToken,
          domain_verified: false,
        })
        .eq('organization_id', organization_id);

      return NextResponse.json({
        verification_token: verificationToken,
        instructions: {
          type: 'TXT',
          name: '_ghxstship-verification',
          value: verificationToken,
        },
      });
    } else if (action === 'check_domain_verification') {
      const { organization_id } = body;

      const { data: config } = await supabase
        .from('white_label_configs')
        .select('domain, domain_verification_token')
        .eq('organization_id', organization_id)
        .single();

      if (!config?.domain) {
        return NextResponse.json({ error: 'No domain configured' }, { status: 400 });
      }

      // In production, this would actually check DNS
      // For now, we'll simulate verification
      const verified = true; // Would be DNS lookup result

      if (verified) {
        await supabase
          .from('white_label_configs')
          .update({
            domain_verified: true,
            domain_verified_at: new Date().toISOString(),
          })
          .eq('organization_id', organization_id);
      }

      return NextResponse.json({ verified });
    } else if (action === 'generate_css') {
      const { primary_color, secondary_color, accent_color, font_family } = body;

      const css = `
:root {
  --primary-color: ${primary_color || '#6366f1'};
  --secondary-color: ${secondary_color || '#8b5cf6'};
  --accent-color: ${accent_color || '#f59e0b'};
  --font-family: ${font_family || 'Inter, system-ui, sans-serif'};
}

.btn-primary {
  background-color: var(--primary-color);
}

.btn-secondary {
  background-color: var(--secondary-color);
}

.accent {
  color: var(--accent-color);
}

body {
  font-family: var(--font-family);
}
`.trim();

      return NextResponse.json({ css });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE /api/enterprise/white-label - Deactivate white-label config
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('white_label_configs')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to deactivate' }, { status: 500 });
  }
}
