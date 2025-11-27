import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const TerritorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['geographic', 'industry', 'account_size', 'product', 'custom']),
  criteria: z.object({
    regions: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
    zip_codes: z.array(z.string()).optional(),
    industries: z.array(z.string()).optional(),
    company_sizes: z.array(z.string()).optional(),
    revenue_range: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
  }),
  assigned_to: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
  quota: z.number().optional(),
  is_active: z.boolean().default(true),
});

const AccountAssignmentSchema = z.object({
  contact_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  territory_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
  assignment_type: z.enum(['primary', 'secondary', 'overlay']).default('primary'),
  effective_date: z.string().optional(),
  expiration_date: z.string().optional(),
});

// GET /api/territory-management - Get territories and assignments
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const territoryId = searchParams.get('territory_id');
    const userId = searchParams.get('user_id');
    const includeAccounts = searchParams.get('include_accounts') === 'true';
    const includeMetrics = searchParams.get('include_metrics') === 'true';

    if (territoryId) {
      // Get specific territory with details
      const { data: territory, error } = await supabase
        .from('territories')
        .select(`
          *,
          assigned_user:platform_users!territories_assigned_to_fkey(id, first_name, last_name, email),
          team:teams(id, name)
        `)
        .eq('id', territoryId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      let accounts = null;
      if (includeAccounts) {
        const { data } = await supabase
          .from('account_assignments')
          .select(`
            *,
            contact:contacts(id, first_name, last_name, email, company),
            organization:organizations(id, name, industry, annual_revenue)
          `)
          .eq('territory_id', territoryId);
        accounts = data;
      }

      let metrics = null;
      if (includeMetrics) {
        // Get territory performance metrics
        const { data: deals } = await supabase
          .from('deals')
          .select('value, stage, closed_at')
          .eq('territory_id', territoryId);

        const totalPipeline = deals?.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
          .reduce((sum, d) => sum + (d.value || 0), 0) || 0;
        const closedWon = deals?.filter(d => d.stage === 'closed_won')
          .reduce((sum, d) => sum + (d.value || 0), 0) || 0;
        const closedLost = deals?.filter(d => d.stage === 'closed_lost')
          .reduce((sum, d) => sum + (d.value || 0), 0) || 0;

        metrics = {
          total_pipeline: totalPipeline,
          closed_won: closedWon,
          closed_lost: closedLost,
          win_rate: (closedWon + closedLost) > 0 ? (closedWon / (closedWon + closedLost) * 100).toFixed(2) : 0,
          quota_attainment: territory.quota ? (closedWon / territory.quota * 100).toFixed(2) : null,
        };
      }

      return NextResponse.json({
        territory,
        accounts,
        metrics,
      });
    } else {
      // Get all territories
      let query = supabase
        .from('territories')
        .select(`
          *,
          assigned_user:platform_users!territories_assigned_to_fkey(id, first_name, last_name, email),
          team:teams(id, name)
        `)
        .eq('is_active', true)
        .order('name');

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data: territories, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get account counts per territory
      const { data: accountCounts } = await supabase
        .from('account_assignments')
        .select('territory_id');

      const countsByTerritory: Record<string, number> = {};
      accountCounts?.forEach(a => {
        countsByTerritory[a.territory_id] = (countsByTerritory[a.territory_id] || 0) + 1;
      });

      const territoriesWithCounts = territories?.map(t => ({
        ...t,
        account_count: countsByTerritory[t.id] || 0,
      }));

      return NextResponse.json({
        territories: territoriesWithCounts || [],
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch territories' }, { status: 500 });
  }
}

// POST /api/territory-management - Create territory or assignment
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
    const action = body.action || 'create_territory';

    if (action === 'create_territory') {
      const validated = TerritorySchema.parse(body);

      const { data: territory, error } = await supabase
        .from('territories')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ territory }, { status: 201 });
    } else if (action === 'assign_account') {
      const validated = AccountAssignmentSchema.parse(body);

      // Check for existing assignment
      const { data: existing } = await supabase
        .from('account_assignments')
        .select('id')
        .eq('contact_id', validated.contact_id)
        .eq('organization_id', validated.organization_id)
        .eq('assignment_type', validated.assignment_type)
        .single();

      if (existing) {
        // Update existing assignment
        const { data: assignment, error } = await supabase
          .from('account_assignments')
          .update({
            territory_id: validated.territory_id,
            assigned_to: validated.assigned_to,
            effective_date: validated.effective_date,
            expiration_date: validated.expiration_date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ assignment, updated: true });
      } else {
        // Create new assignment
        const { data: assignment, error } = await supabase
          .from('account_assignments')
          .insert({
            ...validated,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ assignment }, { status: 201 });
      }
    } else if (action === 'auto_assign') {
      // Auto-assign accounts based on territory criteria
      const { territory_id } = body;

      const { data: territory } = await supabase
        .from('territories')
        .select('*')
        .eq('id', territory_id)
        .single();

      if (!territory) {
        return NextResponse.json({ error: 'Territory not found' }, { status: 404 });
      }

      // Find matching contacts/organizations based on criteria
      let contactQuery = supabase.from('contacts').select('id');
      let orgQuery = supabase.from('organizations').select('id');

      const criteria = territory.criteria as any;

      if (criteria.states?.length > 0) {
        contactQuery = contactQuery.in('state', criteria.states);
        orgQuery = orgQuery.in('state', criteria.states);
      }

      if (criteria.countries?.length > 0) {
        contactQuery = contactQuery.in('country', criteria.countries);
        orgQuery = orgQuery.in('country', criteria.countries);
      }

      if (criteria.industries?.length > 0) {
        orgQuery = orgQuery.in('industry', criteria.industries);
      }

      const [{ data: contacts }, { data: orgs }] = await Promise.all([
        contactQuery,
        orgQuery,
      ]);

      // Create assignments
      const assignments = [];
      
      for (const contact of contacts || []) {
        assignments.push({
          contact_id: contact.id,
          territory_id,
          assigned_to: territory.assigned_to,
          assignment_type: 'primary',
          created_by: user.id,
        });
      }

      for (const org of orgs || []) {
        assignments.push({
          organization_id: org.id,
          territory_id,
          assigned_to: territory.assigned_to,
          assignment_type: 'primary',
          created_by: user.id,
        });
      }

      if (assignments.length > 0) {
        await supabase.from('account_assignments').upsert(assignments, {
          onConflict: 'contact_id,organization_id,assignment_type',
        });
      }

      return NextResponse.json({
        assigned_count: assignments.length,
        contacts_assigned: contacts?.length || 0,
        organizations_assigned: orgs?.length || 0,
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

// PATCH /api/territory-management - Update territory
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const territoryId = searchParams.get('territory_id');

    if (!territoryId) {
      return NextResponse.json({ error: 'Territory ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: territory, error } = await supabase
      .from('territories')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', territoryId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ territory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update territory' }, { status: 500 });
  }
}

// DELETE /api/territory-management - Delete territory or assignment
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const territoryId = searchParams.get('territory_id');
    const assignmentId = searchParams.get('assignment_id');

    if (assignmentId) {
      const { error } = await supabase
        .from('account_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Assignment removed' });
    } else if (territoryId) {
      // Soft delete territory
      const { error } = await supabase
        .from('territories')
        .update({ is_active: false })
        .eq('id', territoryId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Territory deactivated' });
    }

    return NextResponse.json({ error: 'Territory ID or Assignment ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
