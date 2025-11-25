import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EntitySchema = z.object({
  name: z.string(),
  type: z.enum(['company', 'division', 'department', 'branch', 'subsidiary']),
  parent_id: z.string().uuid().optional(),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  settings: z.object({
    currency: z.string().default('USD'),
    timezone: z.string().optional(),
    fiscal_year_start: z.number().min(1).max(12).optional(),
  }).optional(),
  is_active: z.boolean().default(true),
});

// GET /api/multi-entity - Get entities and hierarchy
export async function GET(request: NextRequest) {
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
    const entityId = searchParams.get('entity_id');
    const action = searchParams.get('action');

    if (action === 'hierarchy') {
      // Get full entity hierarchy
      const { data: entities } = await supabase
        .from('entities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Build tree structure
      const buildTree = (parentId: string | null): any[] => {
        return (entities || [])
          .filter(e => e.parent_id === parentId)
          .map(e => ({
            ...e,
            children: buildTree(e.id),
          }));
      };

      const hierarchy = buildTree(null);

      return NextResponse.json({ hierarchy });
    }

    if (action === 'user_access') {
      // Get entities user has access to
      const { data: access } = await supabase
        .from('entity_user_access')
        .select(`
          *,
          entity:entities(id, name, type)
        `)
        .eq('user_id', user.id);

      return NextResponse.json({ access: access || [] });
    }

    if (action === 'consolidated_financials') {
      // Get consolidated financials across entities
      const entityIds = searchParams.get('entity_ids')?.split(',');
      const period = searchParams.get('period') || 'month';

      let query = supabase
        .from('entity_financials')
        .select('*');

      if (entityIds && entityIds.length > 0) {
        query = query.in('entity_id', entityIds);
      }

      const { data: financials } = await query;

      // Aggregate by category
      const consolidated: Record<string, number> = {};
      financials?.forEach(f => {
        consolidated[f.category] = (consolidated[f.category] || 0) + (f.amount || 0);
      });

      return NextResponse.json({
        consolidated,
        by_entity: financials,
      });
    }

    if (action === 'intercompany') {
      // Get intercompany transactions
      const { data: transactions } = await supabase
        .from('intercompany_transactions')
        .select(`
          *,
          from_entity:entities!from_entity_id(name),
          to_entity:entities!to_entity_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Calculate balances
      const balances: Record<string, Record<string, number>> = {};
      transactions?.forEach(t => {
        const fromId = t.from_entity_id;
        const toId = t.to_entity_id;

        if (!balances[fromId]) balances[fromId] = {};
        if (!balances[toId]) balances[toId] = {};

        balances[fromId][toId] = (balances[fromId][toId] || 0) + t.amount;
        balances[toId][fromId] = (balances[toId][fromId] || 0) - t.amount;
      });

      return NextResponse.json({
        transactions: transactions || [],
        balances,
      });
    }

    if (entityId) {
      const { data: entity } = await supabase
        .from('entities')
        .select(`
          *,
          parent:entities!parent_id(id, name),
          children:entities!parent_id(id, name, type)
        `)
        .eq('id', entityId)
        .single();

      if (!entity) {
        return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
      }

      // Get entity stats
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('entity_id', entityId);

      const { data: users } = await supabase
        .from('entity_user_access')
        .select('user_id')
        .eq('entity_id', entityId);

      return NextResponse.json({
        entity,
        stats: {
          projects: projects?.length || 0,
          users: users?.length || 0,
        },
      });
    }

    // List all entities
    const { data: entities } = await supabase
      .from('entities')
      .select('*')
      .order('name');

    return NextResponse.json({ entities: entities || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
  }
}

// POST /api/multi-entity - Create entity or manage access
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
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = EntitySchema.parse(body);

      const { data: entity, error } = await supabase
        .from('entities')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Grant creator admin access
      await supabase.from('entity_user_access').insert({
        entity_id: entity.id,
        user_id: user.id,
        role: 'admin',
        granted_by: user.id,
      });

      return NextResponse.json({ entity }, { status: 201 });
    } else if (action === 'grant_access') {
      const { entity_id, user_id, role } = body;

      const { data: access, error } = await supabase
        .from('entity_user_access')
        .upsert({
          entity_id,
          user_id,
          role,
          granted_by: user.id,
        }, { onConflict: 'entity_id,user_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ access });
    } else if (action === 'revoke_access') {
      const { entity_id, user_id } = body;

      const { error } = await supabase
        .from('entity_user_access')
        .delete()
        .eq('entity_id', entity_id)
        .eq('user_id', user_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'create_intercompany') {
      const { from_entity_id, to_entity_id, amount, description, transaction_type, reference } = body;

      const { data: transaction, error } = await supabase
        .from('intercompany_transactions')
        .insert({
          from_entity_id,
          to_entity_id,
          amount,
          description,
          transaction_type,
          reference,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ transaction }, { status: 201 });
    } else if (action === 'approve_intercompany') {
      const { transaction_id } = body;

      const { data: transaction, error } = await supabase
        .from('intercompany_transactions')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', transaction_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ transaction });
    } else if (action === 'switch_entity') {
      const { entity_id } = body;

      // Verify user has access
      const { data: access } = await supabase
        .from('entity_user_access')
        .select('role')
        .eq('entity_id', entity_id)
        .eq('user_id', user.id)
        .single();

      if (!access) {
        return NextResponse.json({ error: 'No access to this entity' }, { status: 403 });
      }

      // Update user's current entity
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          current_entity_id: entity_id,
        }, { onConflict: 'user_id' });

      return NextResponse.json({
        success: true,
        entity_id,
        role: access.role,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/multi-entity - Update entity
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entity_id');

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: entity, error } = await supabase
      .from('entities')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entityId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entity });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update entity' }, { status: 500 });
  }
}

// DELETE /api/multi-entity - Deactivate entity
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entity_id');

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
    }

    // Check for child entities
    const { data: children } = await supabase
      .from('entities')
      .select('id')
      .eq('parent_id', entityId)
      .eq('is_active', true);

    if (children && children.length > 0) {
      return NextResponse.json({
        error: 'Cannot deactivate entity with active children',
        children_count: children.length,
      }, { status: 400 });
    }

    // Soft delete
    const { error } = await supabase
      .from('entities')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq('id', entityId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to deactivate entity' }, { status: 500 });
  }
}
