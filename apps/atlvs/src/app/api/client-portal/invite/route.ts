export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const inviteSchema = z.object({
  organization_id: z.string().uuid(),
  contact_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
  permissions: z.array(z.string()).optional(),
  expires_in_days: z.number().min(1).max(365).default(30),
  send_email: z.boolean().default(true),
  custom_message: z.string().optional(),
});

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'portal_';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = inviteSchema.parse(body);

    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email')
      .eq('id', payload.contact_id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (!contact.email) {
      return NextResponse.json({ error: 'Contact has no email address' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('client_portal_access')
      .select('id, access_token')
      .eq('contact_id', payload.contact_id)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        access: existing,
        portal_url: `/client-portal?token=${existing.access_token}`,
        message: 'Existing active access found',
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + payload.expires_in_days);

    const { data, error } = await supabase
      .from('client_portal_access')
      .insert({
        organization_id: payload.organization_id,
        contact_id: payload.contact_id,
        booking_id: payload.booking_id,
        access_token: generateToken(),
        permissions: payload.permissions || ['view_events', 'view_documents', 'view_invoices'],
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const portalUrl = `/client-portal?token=${data.access_token}`;

    return NextResponse.json({
      access: data,
      portal_url: portalUrl,
      contact: {
        name: `${contact.first_name} ${contact.last_name}`,
        email: contact.email,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
