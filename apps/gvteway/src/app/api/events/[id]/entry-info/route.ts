import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        date,
        time,
        doors_open,
        age_restriction,
        dress_code,
        entry_info,
        venues (
          id,
          name,
          address,
          city,
          state,
          parking_info,
          transit_info,
          entry_gates,
          bag_policy,
          prohibited_items,
          allowed_items
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const venue = event.venues as any;
    const entryInfo = event.entry_info || {};

    const info = {
      event_id: event.id,
      event_title: event.title,
      event_date: event.date,
      event_time: event.time || '19:00',
      venue_name: venue?.name,
      venue_address: venue?.address,
      venue_city: `${venue?.city}, ${venue?.state}`,
      doors_open: event.doors_open || '18:00',
      show_starts: event.time || '19:00',
      entry_gates: venue?.entry_gates || [
        { name: 'Main Entrance', location: 'Front of venue', recommended_for: 'General Admission' },
        { name: 'VIP Entrance', location: 'Side entrance', recommended_for: 'VIP Ticket Holders' },
      ],
      prohibited_items: venue?.prohibited_items || [
        'Professional cameras',
        'Outside food and beverages',
        'Weapons of any kind',
        'Illegal substances',
        'Large bags or backpacks',
        'Umbrellas',
        'Laser pointers',
      ],
      allowed_items: venue?.allowed_items || [
        'Small purses (under 12"x6"x12")',
        'Cell phones',
        'Sealed water bottles (venue dependent)',
        'Prescription medication',
        'Earplugs',
      ],
      bag_policy: venue?.bag_policy || 'Clear bags only. Maximum size 12"x6"x12". Small clutch bags (4.5"x6.5") do not need to be clear.',
      age_restriction: event.age_restriction,
      dress_code: event.dress_code,
      parking_info: venue?.parking_info || {
        available: true,
        lots: [
          { name: 'Venue Parking Garage', address: 'Adjacent to venue', price: '$25' },
          { name: 'Street Parking', address: 'Surrounding streets', price: 'Metered' },
        ],
        tips: 'Arrive early for best parking. Consider rideshare for easier exit after the show.',
      },
      transit_info: venue?.transit_info || {
        subway: 'Take the Blue Line to Central Station, 5 minute walk',
        bus: 'Routes 10, 15, 22 stop within 2 blocks',
        rideshare_dropoff: 'Designated drop-off zone on Main Street',
      },
      tips: entryInfo.tips || [
        'Mobile tickets load faster - have them ready before you reach the gate',
        'Arrive early to avoid long lines at peak entry times',
        'Check the weather and dress accordingly - some areas may be outdoors',
        'Save your parking spot location in your phone',
        'Designate a meeting spot in case you get separated from your group',
      ],
      faq: entryInfo.faq || [
        {
          question: 'Can I re-enter after leaving?',
          answer: 'Re-entry policies vary by event. Check your ticket or ask staff at the venue.',
        },
        {
          question: 'What if I lose my ticket?',
          answer: 'Contact guest services with your order confirmation. They can look up your purchase.',
        },
        {
          question: 'Is there accessible seating?',
          answer: 'Yes, accessible seating is available. Contact accessibility services for arrangements.',
        },
      ],
    };

    return NextResponse.json({ info });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
