export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createContactSchema = z.object({
  crew_id: z.string().uuid().optional(),
  contact_name: z.string().min(1),
  relationship: z.string(),
  phone: z.string(),
  alt_phone: z.string().optional(),
  email: z.string().email().optional(),
  is_primary: z.boolean().optional(),
  medical_notes: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  blood_type: z.string().optional(),
});

const updateContactSchema = z.object({
  id: z.string().uuid(),
  action: z.string().optional(),
  reason: z.string().optional(),
  location: z.string().optional(),
}).passthrough();

// Emergency contact information with ICE protocols
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const crewId = searchParams.get('crew_id');
    const projectId = searchParams.get('project_id');

    if (crewId) {
      const { data, error } = await supabase.from('emergency_contacts').select('*').eq('crew_id', crewId);
      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ contacts: data });
    }

    if (projectId) {
      // Get all emergency contacts for project crew
      const { data: assignments } = await supabase.from('crew_assignments').select('crew_id').eq('project_id', projectId);
      const crewIds = assignments?.map(a => a.crew_id) || [];

      const { data, error } = await supabase.from('emergency_contacts').select(`
        *, crew:platform_users(id, first_name, last_name)
      `).in('crew_id', crewIds);

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ contacts: data });
    }

    return NextResponse.json({ error: 'Crew ID or Project ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createContactSchema.parse(body);
    const { crew_id, contact_name, relationship, phone, alt_phone, email, is_primary, medical_notes, allergies, blood_type } = validatedData;

    const { data, error } = await supabase.from('emergency_contacts').insert({
      crew_id: crew_id || user.id, contact_name, relationship, phone, alt_phone, email,
      is_primary: is_primary || false, medical_notes, allergies: allergies || [],
      blood_type, updated_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ contact: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateContactSchema.parse(body);
    const { id, action, ...updateData } = validatedData;

    if (action === 'trigger_ice') {
      // ICE Protocol - notify emergency contacts
      const { data: contact } = await supabase.from('emergency_contacts').select('*').eq('id', id).single();
      if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

      // Log ICE activation
      await supabase.from('ice_activations').insert({
        contact_id: id, activated_at: new Date().toISOString(),
        reason: updateData.reason, location: updateData.location
      });

      // In production, send SMS/call to emergency contact
      return NextResponse.json({ success: true, message: 'ICE protocol activated' });
    }

    const { error } = await supabase.from('emergency_contacts').update({
      ...updateData, updated_at: new Date().toISOString()
    }).eq('id', id);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
