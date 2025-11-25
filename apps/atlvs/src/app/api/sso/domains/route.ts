import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const domainSchema = z.object({
  domain: z.string().min(1).max(255).regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/),
  verification_method: z.enum(['dns_txt', 'dns_cname', 'meta_tag', 'file']).default('dns_txt'),
});

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

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = platformUser.platform_roles?.some((role: string) =>
      ['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('sso_domain_verifications')
      .select('*')
      .eq('organization_id', platformUser.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get SSO domains error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SSO domains' },
      { status: 500 }
    );
  }
}

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
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = platformUser.platform_roles?.some((role: string) =>
      ['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = domainSchema.parse(body);

    // Check if domain already exists
    const { data: existing } = await supabase
      .from('sso_domain_verifications')
      .select('id')
      .eq('domain', validated.domain)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Domain already registered' },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = `ghxstship-domain-verify=${crypto.randomBytes(16).toString('hex')}`;

    const { data, error } = await supabase
      .from('sso_domain_verifications')
      .insert({
        organization_id: platformUser.organization_id,
        domain: validated.domain,
        verification_method: validated.verification_method,
        verification_token: verificationToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (error) throw error;

    // Generate verification instructions based on method
    let instructions = '';
    switch (validated.verification_method) {
      case 'dns_txt':
        instructions = `Add a TXT record to your DNS:\nHost: _ghxstship-verification.${validated.domain}\nValue: ${verificationToken}`;
        break;
      case 'dns_cname':
        instructions = `Add a CNAME record to your DNS:\nHost: _ghxstship-verification.${validated.domain}\nValue: verify.ghxstship.com`;
        break;
      case 'meta_tag':
        instructions = `Add this meta tag to your website's homepage:\n<meta name="ghxstship-domain-verification" content="${verificationToken}">`;
        break;
      case 'file':
        instructions = `Create a file at:\nhttps://${validated.domain}/.well-known/ghxstship-verification.txt\nWith content: ${verificationToken}`;
        break;
    }

    return NextResponse.json({
      data: {
        ...data,
        instructions,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create SSO domain error:', error);
    return NextResponse.json(
      { error: 'Failed to create SSO domain' },
      { status: 500 }
    );
  }
}
