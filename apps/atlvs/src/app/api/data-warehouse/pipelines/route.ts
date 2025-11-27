import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const pipelineSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  source_type: z.enum(['table', 'view', 'query', 'api']),
  source_config: z.object({
    table_name: z.string().optional(),
    view_name: z.string().optional(),
    query: z.string().optional(),
    api_endpoint: z.string().optional(),
    incremental_column: z.string().optional(),
    batch_size: z.number().optional(),
  }),
  destination_connection_id: z.string().uuid(),
  destination_table: z.string().max(255),
  transformation_config: z.object({
    column_mappings: z.record(z.string()).optional(),
    filters: z.array(z.any()).optional(),
    aggregations: z.array(z.any()).optional(),
  }).optional(),
  schedule_cron: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const destination_connection_id = searchParams.get('destination_connection_id');
    const is_active = searchParams.get('is_active');
    const include_history = searchParams.get('include_history') === 'true';

    let selectQuery = `
      *,
      destination:warehouse_connections!destination_connection_id(id, name, connection_type),
      created_by_user:platform_users!created_by(id, email, full_name)
    `;

    if (include_history) {
      selectQuery += `,
        recent_runs:etl_run_history(
          id, started_at, completed_at, status, records_processed, duration_ms
        )
      `;
    }

    let query = supabase
      .from('etl_pipelines')
      .select(selectQuery);

    if (destination_connection_id) {
      query = query.eq('destination_connection_id', destination_connection_id);
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('name');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching ETL pipelines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ETL pipelines' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const validated = pipelineSchema.parse(body);

    // Verify destination connection exists
    const { data: connection } = await supabase
      .from('warehouse_connections')
      .select('id')
      .eq('id', validated.destination_connection_id)
      .single();

    if (!connection) {
      return NextResponse.json(
        { error: 'Destination connection not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('etl_pipelines')
      .insert({
        ...validated,
        is_active: true,
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
    console.error('Error creating ETL pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to create ETL pipeline' },
      { status: 500 }
    );
  }
}
