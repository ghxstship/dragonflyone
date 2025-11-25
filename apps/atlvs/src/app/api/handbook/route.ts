import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const handbookSchema = z.object({
  version_number: z.string().min(1).max(20),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  effective_date: z.string(),
  expiration_date: z.string().optional(),
  document_url: z.string().url().optional(),
  requires_acknowledgment: z.boolean().default(true),
  acknowledgment_deadline_days: z.number().int().default(30),
  change_summary: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const include_sections = searchParams.get('include_sections') === 'true';

    let selectQuery = `
      *,
      created_by_user:platform_users!created_by(id, email, full_name),
      approved_by_user:platform_users!approved_by(id, email, full_name)
    `;

    if (include_sections) {
      selectQuery += `,
        sections:handbook_sections(
          id, section_number, title, content_type, sort_order, is_required_reading, estimated_read_time_minutes
        )
      `;
    }

    let query = supabase
      .from('handbook_versions')
      .select(selectQuery);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('effective_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching handbooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handbooks' },
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
    const validated = handbookSchema.parse(body);

    const { data, error } = await supabase
      .from('handbook_versions')
      .insert({
        ...validated,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating handbook:', error);
    return NextResponse.json(
      { error: 'Failed to create handbook' },
      { status: 500 }
    );
  }
}
