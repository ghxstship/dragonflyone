export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const exportJobSchema = z.object({
  name: z.string().min(1).max(255),
  export_type: z.enum(['full', 'incremental', 'snapshot']),
  tables_included: z.array(z.string()),
  format: z.enum(['parquet', 'csv', 'json', 'avro']).default('parquet'),
  compression: z.enum(['none', 'gzip', 'snappy', 'zstd']).default('gzip'),
  destination_connection_id: z.string().uuid(),
  destination_path: z.string().max(500),
  schedule_cron: z.string().max(100).optional(),
  retention_days: z.number().int().default(30),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');
    const include_history = searchParams.get('include_history') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let selectQuery = `
      id, name, export_type, format, compression, destination_path, schedule_cron, is_active, created_at,
      destination:warehouse_connections!destination_connection_id(id, name, connection_type),
      created_by_user:platform_users!created_by(id, email, full_name)
    `;

    if (include_history) {
      selectQuery += `,
        recent_exports:data_export_history(
          id, started_at, completed_at, status, file_count, total_rows, total_bytes
        )
      `;
    }

    let query = supabase
      .from('data_export_jobs')
      .select(selectQuery, { count: 'exact' });

    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error, count } = await query
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const totalCount = count || (data?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (data?.length ?? 0) < totalCount,
    };

    return NextResponse.json({ data, pagination });
  } catch (error) {
    logger.error('Error fetching export jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch export jobs' },
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
    const validated = exportJobSchema.parse(body);

    const { data, error } = await supabase
      .from('data_export_jobs')
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
    logger.error('Error creating export job:', error);
    return NextResponse.json(
      { error: 'Failed to create export job' },
      { status: 500 }
    );
  }
}
