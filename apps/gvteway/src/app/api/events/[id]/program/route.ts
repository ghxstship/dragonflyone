import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        date,
        venues (
          name
        ),
        event_programs (
          id,
          notes,
          program_sections (
            id,
            title,
            start_time,
            description,
            order_index,
            setlist_items (
              id,
              order_index,
              title,
              artist,
              duration,
              notes,
              is_encore
            )
          )
        ),
        event_performers (
          id,
          name,
          role,
          image,
          bio,
          order_index
        ),
        event_sponsors (
          id,
          name,
          logo,
          tier,
          order_index
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventProgram = (event.event_programs as any[])?.[0];

    if (!eventProgram) {
      // Return default program structure if none exists
      return NextResponse.json({
        program: {
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          venue_name: (event.venues as any)?.name,
          program_notes: null,
          sections: [],
          performers: ((event.event_performers as any[]) || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(p => ({
              id: p.id,
              name: p.name,
              role: p.role,
              image: p.image,
              bio: p.bio,
            })),
          sponsors: ((event.event_sponsors as any[]) || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(s => ({
              name: s.name,
              logo: s.logo,
              tier: s.tier,
            })),
        },
      });
    }

    const program = {
      event_id: event.id,
      event_title: event.title,
      event_date: event.date,
      venue_name: (event.venues as any)?.name,
      program_notes: eventProgram.notes,
      sections: ((eventProgram.program_sections as any[]) || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(section => ({
          id: section.id,
          title: section.title,
          start_time: section.start_time,
          description: section.description,
          items: ((section.setlist_items as any[]) || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(item => ({
              id: item.id,
              order: item.order_index,
              title: item.title,
              artist: item.artist,
              duration: item.duration,
              notes: item.notes,
              is_encore: item.is_encore,
            })),
        })),
      performers: ((event.event_performers as any[]) || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          image: p.image,
          bio: p.bio,
        })),
      sponsors: ((event.event_sponsors as any[]) || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(s => ({
          name: s.name,
          logo: s.logo,
          tier: s.tier,
        })),
    };

    return NextResponse.json({ program });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
