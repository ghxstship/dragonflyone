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

// Event type templates for different event categories
const EVENT_TEMPLATES = {
  concert: {
    name: 'Concert',
    description: 'Live music performance template',
    default_duration: 180,
    default_capacity: 500,
    ticket_types: ['General Admission', 'VIP', 'Meet & Greet', 'Backstage'],
    required_fields: ['artist', 'venue', 'doors_time', 'show_time'],
    optional_fields: ['opener', 'age_restriction', 'parking_info'],
  },
  festival: {
    name: 'Festival',
    description: 'Multi-day music or arts festival',
    default_duration: 720,
    default_capacity: 10000,
    ticket_types: ['Single Day', 'Weekend Pass', 'VIP Weekend', 'Camping'],
    required_fields: ['venue', 'start_date', 'end_date', 'lineup'],
    optional_fields: ['camping_options', 'shuttle_service', 'food_vendors'],
  },
  conference: {
    name: 'Conference',
    description: 'Professional conference or summit',
    default_duration: 480,
    default_capacity: 1000,
    ticket_types: ['General', 'Premium', 'Speaker Pass', 'Virtual'],
    required_fields: ['venue', 'agenda', 'speakers'],
    optional_fields: ['workshops', 'networking_events', 'virtual_option'],
  },
  theater: {
    name: 'Theater',
    description: 'Theater production or show',
    default_duration: 150,
    default_capacity: 300,
    ticket_types: ['Orchestra', 'Mezzanine', 'Balcony', 'Premium'],
    required_fields: ['venue', 'show_title', 'cast'],
    optional_fields: ['intermission', 'age_rating', 'accessibility'],
  },
  sports: {
    name: 'Sports',
    description: 'Sporting event or game',
    default_duration: 180,
    default_capacity: 20000,
    ticket_types: ['General', 'Club Level', 'Suite', 'Field Level'],
    required_fields: ['venue', 'teams', 'sport_type'],
    optional_fields: ['tailgate_info', 'parking', 'concessions'],
  },
  nightlife: {
    name: 'Nightlife',
    description: 'Club night or DJ event',
    default_duration: 300,
    default_capacity: 500,
    ticket_types: ['General', 'VIP Table', 'Bottle Service'],
    required_fields: ['venue', 'dj_lineup', 'doors_time'],
    optional_fields: ['dress_code', 'age_restriction', 'bottle_menu'],
  },
  experiential: {
    name: 'Experiential',
    description: 'Immersive or interactive experience',
    default_duration: 90,
    default_capacity: 100,
    ticket_types: ['Standard', 'Premium', 'Private Group'],
    required_fields: ['venue', 'experience_type', 'duration'],
    optional_fields: ['group_size', 'accessibility', 'photo_policy'],
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type && EVENT_TEMPLATES[type as keyof typeof EVENT_TEMPLATES]) {
      return NextResponse.json({
        template: EVENT_TEMPLATES[type as keyof typeof EVENT_TEMPLATES],
      });
    }

    // Return all templates
    return NextResponse.json({
      templates: Object.entries(EVENT_TEMPLATES).map(([key, value]) => ({
        id: key,
        ...value,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, template_type, configuration } = body;

    // Save custom template
    const { data, error } = await supabase
      .from('event_templates')
      .insert({
        name,
        description,
        template_type,
        configuration,
        created_by: user.id,
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
