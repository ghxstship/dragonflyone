import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const DatasetSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  source_tables: z.array(z.string()),
  query: z.string().optional(),
  refresh_schedule: z.enum(['realtime', 'hourly', 'daily', 'weekly', 'manual']).default('daily'),
  is_public: z.boolean().default(false),
  allowed_tools: z.array(z.enum(['tableau', 'powerbi', 'looker', 'metabase', 'custom'])).optional(),
});

const ApiKeySchema = z.object({
  name: z.string(),
  tool: z.enum(['tableau', 'powerbi', 'looker', 'metabase', 'custom']),
  permissions: z.array(z.enum(['read', 'write', 'admin'])).default(['read']),
  allowed_datasets: z.array(z.string().uuid()).optional(),
  expires_at: z.string().optional(),
  ip_whitelist: z.array(z.string()).optional(),
});

// GET /api/bi-integration - Get datasets and connection info
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get('dataset_id');
    const tool = searchParams.get('tool');
    const action = searchParams.get('action');

    if (action === 'connection_info') {
      // Get connection information for BI tools
      const connectionInfo = {
        tableau: {
          server: process.env.NEXT_PUBLIC_SUPABASE_URL,
          database: 'postgres',
          schema: 'public',
          authentication: 'api_key',
          documentation_url: 'https://help.tableau.com/current/pro/desktop/en-us/examples_postgresql.htm',
        },
        powerbi: {
          server: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '.supabase.co:5432'),
          database: 'postgres',
          authentication: 'basic',
          documentation_url: 'https://docs.microsoft.com/en-us/power-bi/connect-data/desktop-connect-postgresql',
        },
        looker: {
          host: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '.supabase.co'),
          port: 5432,
          database: 'postgres',
          schema: 'public',
          documentation_url: 'https://docs.looker.com/setup-and-management/database-config/postgresql',
        },
        metabase: {
          host: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '.supabase.co'),
          port: 5432,
          database: 'postgres',
          documentation_url: 'https://www.metabase.com/docs/latest/databases/connections/postgresql',
        },
      };

      return NextResponse.json({ connection_info: connectionInfo });
    }

    if (datasetId) {
      // Get specific dataset with schema
      const { data: dataset, error } = await supabase
        .from('bi_datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get schema information for source tables
      const schemaInfo = [];
      for (const table of dataset.source_tables || []) {
        const { data: columns } = await supabase.rpc('get_table_columns', { table_name: table });
        schemaInfo.push({
          table,
          columns: columns || [],
        });
      }

      // Get sample data
      let sampleData = null;
      if (dataset.query) {
        // In production, this would execute the custom query
        sampleData = { message: 'Custom query execution not available in preview' };
      } else if (dataset.source_tables?.length === 1) {
        const { data } = await supabase
          .from(dataset.source_tables[0])
          .select('*')
          .limit(10);
        sampleData = data;
      }

      return NextResponse.json({
        dataset,
        schema: schemaInfo,
        sample_data: sampleData,
      });
    } else {
      // Get all datasets
      let query = supabase
        .from('bi_datasets')
        .select('*')
        .order('name');

      if (tool) {
        query = query.contains('allowed_tools', [tool]);
      }

      const { data: datasets, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get API keys for user
      const { data: apiKeys } = await supabase
        .from('bi_api_keys')
        .select('id, name, tool, created_at, expires_at, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      return NextResponse.json({
        datasets: datasets || [],
        api_keys: apiKeys || [],
        available_tools: ['tableau', 'powerbi', 'looker', 'metabase', 'custom'],
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch BI data' }, { status: 500 });
  }
}

// POST /api/bi-integration - Create dataset or API key
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
    const action = body.action || 'create_dataset';

    if (action === 'create_dataset') {
      const validated = DatasetSchema.parse(body);

      const { data: dataset, error } = await supabase
        .from('bi_datasets')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ dataset }, { status: 201 });
    } else if (action === 'create_api_key') {
      const validated = ApiKeySchema.parse(body);

      // Generate API key
      const apiKey = `bi_${crypto.randomUUID().replace(/-/g, '')}`;
      const keyHash = await hashApiKey(apiKey);

      const { data: keyRecord, error } = await supabase
        .from('bi_api_keys')
        .insert({
          user_id: user.id,
          name: validated.name,
          tool: validated.tool,
          key_hash: keyHash,
          key_prefix: apiKey.substring(0, 12),
          permissions: validated.permissions,
          allowed_datasets: validated.allowed_datasets,
          expires_at: validated.expires_at,
          ip_whitelist: validated.ip_whitelist,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Return the full key only once
      return NextResponse.json({
        api_key: apiKey,
        key_record: {
          id: keyRecord.id,
          name: keyRecord.name,
          tool: keyRecord.tool,
          key_prefix: keyRecord.key_prefix,
          expires_at: keyRecord.expires_at,
        },
        message: 'Save this API key securely. It will not be shown again.',
      }, { status: 201 });
    } else if (action === 'query_data') {
      const { dataset_id, filters, limit: queryLimit, offset: queryOffset } = body;

      // Get dataset
      const { data: dataset } = await supabase
        .from('bi_datasets')
        .select('*')
        .eq('id', dataset_id)
        .single();

      if (!dataset) {
        return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
      }

      // Execute query based on dataset configuration
      if (dataset.source_tables?.length === 1) {
        let query = supabase
          .from(dataset.source_tables[0])
          .select('*', { count: 'exact' })
          .limit(queryLimit || 1000)
          .range(queryOffset || 0, (queryOffset || 0) + (queryLimit || 1000) - 1);

        // Apply filters
        if (filters) {
          for (const [key, value] of Object.entries(filters)) {
            if (typeof value === 'object' && value !== null) {
              const filterObj = value as Record<string, any>;
              if (filterObj.eq) query = query.eq(key, filterObj.eq);
              if (filterObj.neq) query = query.neq(key, filterObj.neq);
              if (filterObj.gt) query = query.gt(key, filterObj.gt);
              if (filterObj.gte) query = query.gte(key, filterObj.gte);
              if (filterObj.lt) query = query.lt(key, filterObj.lt);
              if (filterObj.lte) query = query.lte(key, filterObj.lte);
              if (filterObj.like) query = query.like(key, filterObj.like);
              if (filterObj.in) query = query.in(key, filterObj.in);
            } else {
              query = query.eq(key, value);
            }
          }
        }

        const { data, error, count } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          data,
          total: count,
          limit: queryLimit || 1000,
          offset: queryOffset || 0,
        });
      }

      return NextResponse.json({ error: 'Complex queries not supported in this endpoint' }, { status: 400 });
    } else if (action === 'export_schema') {
      const { dataset_id, format } = body;

      const { data: dataset } = await supabase
        .from('bi_datasets')
        .select('*')
        .eq('id', dataset_id)
        .single();

      if (!dataset) {
        return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
      }

      // Get schema for all source tables
      const schema = [];
      for (const table of dataset.source_tables || []) {
        const { data: columns } = await supabase.rpc('get_table_columns', { table_name: table });
        schema.push({
          table_name: table,
          columns: columns || [],
        });
      }

      if (format === 'json') {
        return NextResponse.json({ schema });
      } else if (format === 'yaml') {
        // Convert to YAML-like format
        let yaml = '';
        for (const table of schema) {
          yaml += `${table.table_name}:\n`;
          for (const col of table.columns) {
            yaml += `  - name: ${col.column_name}\n`;
            yaml += `    type: ${col.data_type}\n`;
            yaml += `    nullable: ${col.is_nullable}\n`;
          }
        }
        return new NextResponse(yaml, {
          headers: { 'Content-Type': 'text/yaml' },
        });
      }

      return NextResponse.json({ schema });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE /api/bi-integration - Revoke API key
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('key_id');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('bi_api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', keyId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}

// Helper function to hash API key
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
