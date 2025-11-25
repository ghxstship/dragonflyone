import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rosterSchema = z.object({
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  roster_date: z.string().optional(),
  visibility: z.enum(['public', 'crew', 'management']).default('crew'),
  settings: z.record(z.any()).optional(),
}).refine(data => data.project_id || data.event_id, {
  message: 'Either project_id or event_id must be provided',
});

const rosterEntrySchema = z.object({
  user_id: z.string().uuid(),
  role: z.string().min(1).max(100),
  department: z.string().max(100).optional(),
  call_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().max(255).optional(),
  notes: z.string().optional(),
  contact_info: z.record(z.any()).optional(),
  status: z.enum(['pending', 'confirmed', 'declined', 'no_show']).default('confirmed'),
  sort_order: z.number().int().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const event_id = searchParams.get('event_id');
    const status = searchParams.get('status');
    const include_entries = searchParams.get('include_entries') === 'true';

    let selectQuery = `
      *,
      project:projects(id, name),
      event:events(id, name),
      created_by_user:platform_users!created_by(id, email, full_name)
    `;

    if (include_entries) {
      selectQuery += `,
        entries:crew_roster_entries(
          *,
          user:platform_users(id, email, full_name, avatar_url, phone)
        )
      `;
    }

    let query = supabase
      .from('crew_rosters')
      .select(selectQuery);

    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (event_id) {
      query = query.eq('event_id', event_id);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('roster_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching rosters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rosters' },
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

    const body = await request.json();
    const { entries, ...rosterData } = body;
    const validated = rosterSchema.parse(rosterData);

    // Create roster
    const { data: roster, error: rosterError } = await supabase
      .from('crew_rosters')
      .insert({
        ...validated,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (rosterError) throw rosterError;

    // Add entries if provided
    if (entries && entries.length > 0) {
      const validatedEntries = entries.map((entry: unknown, index: number) => {
        const parsed = rosterEntrySchema.parse(entry);
        return {
          roster_id: roster.id,
          ...parsed,
          sort_order: parsed.sort_order || index,
        };
      });

      const { error: entriesError } = await supabase
        .from('crew_roster_entries')
        .insert(validatedEntries);

      if (entriesError) throw entriesError;
    }

    // Fetch complete roster with entries
    const { data: completeRoster, error: fetchError } = await supabase
      .from('crew_rosters')
      .select(`
        *,
        entries:crew_roster_entries(
          *,
          user:platform_users(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', roster.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({ data: completeRoster }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating roster:', error);
    return NextResponse.json(
      { error: 'Failed to create roster' },
      { status: 500 }
    );
  }
}
