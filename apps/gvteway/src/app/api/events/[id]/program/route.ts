export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



// Table does not exist in schema - return empty response
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
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ program: null });
      }
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    interface ProgramInfo { id: string; sections?: unknown[] }
    interface ProgramVenueInfo { name?: string }
    interface PerformerInfo { id: string; name: string; role?: string; image?: string; bio?: string; order_index: number }
    interface SponsorInfo { name: string; logo?: string; tier?: string; order_index: number }
    const programs = (event.event_programs || []) as ProgramInfo[];
    const eventProgram = programs[0];

    if (!eventProgram) {
      // Return default program structure if none exists
      const venue = event.venues as ProgramVenueInfo | null;
      const performers = (event.event_performers || []) as PerformerInfo[];
      const sponsors = (event.event_sponsors || []) as SponsorInfo[];
      return NextResponse.json({
        program: {
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          venue_name: venue?.name,
          program_notes: null,
          sections: [],
          performers: performers
            .sort((a: PerformerInfo, b: PerformerInfo) => a.order_index - b.order_index)
            .map((p: PerformerInfo) => ({
              id: p.id,
              name: p.name,
              role: p.role,
              image: p.image,
              bio: p.bio,
            })),
          sponsors: sponsors
            .sort((a: SponsorInfo, b: SponsorInfo) => a.order_index - b.order_index)
            .map((s: SponsorInfo) => ({
              name: s.name,
              logo: s.logo,
              tier: s.tier,
            })),
        },
      });
    }

    interface SectionItem { id: string; order_index: number; title: string; artist?: string; duration?: number; notes?: string; is_encore?: boolean }
    interface ProgramSection { id: string; title: string; start_time?: string; description?: string; order_index: number; setlist_items?: SectionItem[] }
    const venueInfo = event.venues as ProgramVenueInfo | null;
    const sections = ((eventProgram as { program_sections?: ProgramSection[] }).program_sections || []) as ProgramSection[];
    const eventPerformers = (event.event_performers || []) as PerformerInfo[];
    const eventSponsors = (event.event_sponsors || []) as SponsorInfo[];
    const program = {
      event_id: event.id,
      event_title: event.title,
      event_date: event.date,
      venue_name: venueInfo?.name,
      program_notes: (eventProgram as { notes?: string }).notes,
      sections: sections
        .sort((a: ProgramSection, b: ProgramSection) => a.order_index - b.order_index)
        .map((section: ProgramSection) => {
          const items = (section.setlist_items || []) as SectionItem[];
          return {
            id: section.id,
            title: section.title,
            start_time: section.start_time,
            description: section.description,
            items: items
              .sort((a: SectionItem, b: SectionItem) => a.order_index - b.order_index)
              .map((item: SectionItem) => ({
                id: item.id,
                order: item.order_index,
                title: item.title,
                artist: item.artist,
                duration: item.duration,
                notes: item.notes,
                is_encore: item.is_encore,
              })),
          };
        }),
      performers: eventPerformers
        .sort((a: PerformerInfo, b: PerformerInfo) => a.order_index - b.order_index)
        .map((p: PerformerInfo) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          image: p.image,
          bio: p.bio,
        })),
      sponsors: eventSponsors
        .sort((a: SponsorInfo, b: SponsorInfo) => a.order_index - b.order_index)
        .map((s: SponsorInfo) => ({
          name: s.name,
          logo: s.logo,
          tier: s.tier,
        })),
    };

    return NextResponse.json({ program });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ program: null });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
