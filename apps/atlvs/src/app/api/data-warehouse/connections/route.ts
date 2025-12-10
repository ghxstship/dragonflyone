export const dynamic = 'force-dynamic';

import { Logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const connectionSchema = z.object({
  name: z.string().min(1).max(255),
  connection_type: z.enum(['snowflake', 'bigquery', 'redshift', 'databricks', 's3', 'azure_blob', 'gcs']),
  connection_config: z.object({
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    schema: z.string().optional(),
    warehouse: z.string().optional(),
    bucket: z.string().optional(),
    region: z.string().optional(),
    project_id: z.string().optional(),
    dataset: z.string().optional(),
  }),
  credentials_encrypted: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const connection_type = searchParams.get('connection_type');
    const is_active = searchParams.get('is_active');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('warehouse_connections')
      .select(`
        id, name, connection_type, is_active,
        last_sync_at, sync_status, created_at,
        created_by_user:platform_users!created_by(id, email, full_name)
      `, { count: 'exact' });

    if (connection_type) {
      query = query.eq('connection_type', connection_type);
    }
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
    Logger.error('Error fetching warehouse connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouse connections' },
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
    const validated = connectionSchema.parse(body);

    const { data, error } = await supabase
      .from('warehouse_connections')
      .insert({
        ...validated,
        is_active: true,
        sync_status: 'pending',
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
    Logger.error('Error creating warehouse connection:', error);
    return NextResponse.json(
      { error: 'Failed to create warehouse connection' },
      { status: 500 }
    );
  }
}
