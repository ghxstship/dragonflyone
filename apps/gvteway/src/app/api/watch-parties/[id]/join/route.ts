import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const partyId = params.id;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get party details
    const { data: party, error: partyError } = await supabase
      .from('watch_parties')
      .select('*')
      .eq('id', partyId)
      .single();

    if (partyError || !party) {
      return NextResponse.json({ error: 'Watch party not found' }, { status: 404 });
    }

    // Check if party is full
    if (party.max_attendees && party.attendees_count >= party.max_attendees) {
      return NextResponse.json({ error: 'Watch party is full' }, { status: 400 });
    }

    // Check if already joined
    const { data: existingAttendee } = await supabase
      .from('watch_party_attendees')
      .select('id')
      .eq('party_id', partyId)
      .eq('user_id', user.id)
      .single();

    if (existingAttendee) {
      return NextResponse.json({ message: 'Already joined' });
    }

    // Add attendee
    const { error: joinError } = await supabase
      .from('watch_party_attendees')
      .insert({
        party_id: partyId,
        user_id: user.id,
        role: 'attendee',
      });

    if (joinError) {
      return NextResponse.json({ error: joinError.message }, { status: 500 });
    }

    // Increment attendee count
    await supabase
      .from('watch_parties')
      .update({ attendees_count: (party.attendees_count || 0) + 1 })
      .eq('id', partyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const partyId = params.id;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove attendee
    const { error: leaveError } = await supabase
      .from('watch_party_attendees')
      .delete()
      .eq('party_id', partyId)
      .eq('user_id', user.id)
      .neq('role', 'host'); // Host cannot leave

    if (leaveError) {
      return NextResponse.json({ error: leaveError.message }, { status: 500 });
    }

    // Decrement attendee count
    const { data: party } = await supabase
      .from('watch_parties')
      .select('attendees_count')
      .eq('id', partyId)
      .single();

    if (party) {
      await supabase
        .from('watch_parties')
        .update({ attendees_count: Math.max(0, (party.attendees_count || 0) - 1) })
        .eq('id', partyId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
