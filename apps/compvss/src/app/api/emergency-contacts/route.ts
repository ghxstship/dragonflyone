import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Emergency contact information with ICE protocols
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const crewId = searchParams.get('crew_id');
    const projectId = searchParams.get('project_id');

    if (crewId) {
      const { data, error } = await supabase.from('emergency_contacts').select('*').eq('crew_id', crewId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ contacts: data });
    }

    if (projectId) {
      // Get all emergency contacts for project crew
      const { data: assignments } = await supabase.from('crew_assignments').select('crew_id').eq('project_id', projectId);
      const crewIds = assignments?.map(a => a.crew_id) || [];

      const { data, error } = await supabase.from('emergency_contacts').select(`
        *, crew:platform_users(id, first_name, last_name)
      `).in('crew_id', crewIds);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ contacts: data });
    }

    return NextResponse.json({ error: 'Crew ID or Project ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { crew_id, contact_name, relationship, phone, alt_phone, email, is_primary, medical_notes, allergies, blood_type } = body;

    const { data, error } = await supabase.from('emergency_contacts').insert({
      crew_id: crew_id || user.id, contact_name, relationship, phone, alt_phone, email,
      is_primary: is_primary || false, medical_notes, allergies: allergies || [],
      blood_type, updated_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ contact: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, ...updateData } = body;

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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
