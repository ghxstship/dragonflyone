import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const poolSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  pool_type: z.enum(['high_potential', 'leadership', 'technical', 'emerging', 'executive', 'specialist']),
  criteria: z.record(z.any()).optional(),
  target_positions: z.array(z.string().uuid()).optional(),
});

const memberSchema = z.object({
  user_id: z.string().uuid(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const pool_type = searchParams.get('pool_type');
    const include_members = searchParams.get('include_members') === 'true';

    let selectQuery = `
      *,
      created_by_user:platform_users!created_by(id, email, full_name)
    `;

    if (include_members) {
      selectQuery += `,
        members:talent_pool_members(
          id, added_date, status, notes,
          user:platform_users!user_id(id, email, full_name, avatar_url, hire_date),
          added_by_user:platform_users!added_by(id, email, full_name)
        )
      `;
    }

    let query = supabase
      .from('talent_pools')
      .select(selectQuery)
      .eq('is_active', true);

    if (pool_type) {
      query = query.eq('pool_type', pool_type);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;

    // Type for pool data
    const pools = (data || []) as unknown as Array<Record<string, unknown>>;
    const poolsWithCounts = await Promise.all(
      pools.map(async (pool) => {
        const { count } = await supabase
          .from('talent_pool_members')
          .select('*', { count: 'exact', head: true })
          .eq('pool_id', pool.id as string)
          .eq('status', 'active');
        
        return { ...pool, member_count: count || 0 };
      })
    );

    return NextResponse.json({ data: poolsWithCounts });
  } catch (error) {
    console.error('Error fetching talent pools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talent pools' },
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
    const { members, ...poolData } = body;
    const validated = poolSchema.parse(poolData);

    // Create pool
    const { data: pool, error: poolError } = await supabase
      .from('talent_pools')
      .insert({
        ...validated,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (poolError) throw poolError;

    // Add initial members if provided
    if (members && members.length > 0) {
      const memberInserts = members.map((member: unknown) => {
        const parsed = memberSchema.parse(member);
        return {
          pool_id: pool.id,
          user_id: parsed.user_id,
          notes: parsed.notes,
          added_by: user.id,
          status: 'active',
        };
      });

      await supabase.from('talent_pool_members').insert(memberInserts);
    }

    return NextResponse.json({ data: pool }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating talent pool:', error);
    return NextResponse.json(
      { error: 'Failed to create talent pool' },
      { status: 500 }
    );
  }
}
