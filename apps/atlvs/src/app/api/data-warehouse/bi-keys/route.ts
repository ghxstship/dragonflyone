import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const apiKeySchema = z.object({
  name: z.string().min(1).max(255),
  tool_type: z.enum(['tableau', 'powerbi', 'looker', 'metabase', 'custom']).optional(),
  permissions: z.array(z.enum(['read', 'write', 'admin'])).default(['read']),
  rate_limit_per_minute: z.number().int().default(60),
  allowed_tables: z.array(z.string()).optional(),
  allowed_ip_ranges: z.array(z.string()).optional(),
  expires_at: z.string().optional(),
});

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `ghx_bi_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 12);
  return { key, hash, prefix };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tool_type = searchParams.get('tool_type');
    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('bi_api_keys')
      .select(`
        id, name, key_prefix, tool_type, permissions, rate_limit_per_minute,
        allowed_tables, allowed_ip_ranges, expires_at, last_used_at, usage_count,
        is_active, created_at,
        created_by_user:platform_users!created_by(id, email, full_name)
      `);

    if (tool_type) {
      query = query.eq('tool_type', tool_type);
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching BI API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BI API keys' },
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
    const validated = apiKeySchema.parse(body);

    // Generate API key
    const { key, hash, prefix } = generateApiKey();

    const { data, error } = await supabase
      .from('bi_api_keys')
      .insert({
        ...validated,
        key_hash: hash,
        key_prefix: prefix,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Return the key only once - it won't be retrievable again
    return NextResponse.json({
      data: {
        ...data,
        api_key: key, // Only returned on creation
      },
      message: 'Store this API key securely. It will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating BI API key:', error);
    return NextResponse.json(
      { error: 'Failed to create BI API key' },
      { status: 500 }
    );
  }
}
