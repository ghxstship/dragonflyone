import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const opportunitySchema = z.object({
  name: z.string().min(1),
  contact_id: z.string().uuid(),
  deal_id: z.string().uuid().optional(),
  type: z.enum(['new_business', 'upsell', 'cross_sell', 'renewal', 'expansion']),
  stage: z.enum(['identified', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  value: z.number().positive(),
  probability: z.number().min(0).max(100),
  expected_close_date: z.string().datetime(),
  source: z.string().optional(),
  description: z.string().optional(),
  products: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
  owner_id: z.string().uuid(),
  next_step: z.string().optional(),
  next_step_date: z.string().datetime().optional(),
});

// GET - Get opportunities
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all' | 'pipeline' | 'forecast' | 'contact' | 'analysis'
    const contactId = searchParams.get('contact_id');
    const ownerId = searchParams.get('owner_id');
    const stage = searchParams.get('stage');
    const oppType = searchParams.get('opp_type');

    if (type === 'pipeline' || !type) {
      // Get opportunity pipeline
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, organization_id),
          owner:platform_users(id, first_name, last_name)
        `)
        .not('stage', 'in', '("closed_won","closed_lost")')
        .order('expected_close_date', { ascending: true });

      if (contactId) query = query.eq('contact_id', contactId);
      if (ownerId) query = query.eq('owner_id', ownerId);
      if (stage) query = query.eq('stage', stage);
      if (oppType) query = query.eq('type', oppType);

      const { data: opportunities, error } = await query;

      if (error) throw error;

      // Group by stage
      const byStage = opportunities?.reduce((acc: Record<string, { count: number; value: number; weighted: number }>, o) => {
        if (!acc[o.stage]) acc[o.stage] = { count: 0, value: 0, weighted: 0 };
        acc[o.stage].count++;
        acc[o.stage].value += o.value;
        acc[o.stage].weighted += o.value * (o.probability / 100);
        return acc;
      }, {});

      const totalValue = opportunities?.reduce((sum, o) => sum + o.value, 0) || 0;
      const weightedValue = opportunities?.reduce((sum, o) => sum + (o.value * o.probability / 100), 0) || 0;

      return NextResponse.json({
        opportunities,
        by_stage: byStage,
        summary: {
          total_opportunities: opportunities?.length || 0,
          total_value: totalValue,
          weighted_value: Math.round(weightedValue * 100) / 100,
          average_probability: opportunities?.length 
            ? Math.round(opportunities.reduce((sum, o) => sum + o.probability, 0) / opportunities.length) 
            : 0,
        },
      });
    }

    if (type === 'forecast') {
      // Get opportunity forecast
      const months = parseInt(searchParams.get('months') || '6');
      
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('value, probability, expected_close_date, stage')
        .not('stage', 'in', '("closed_won","closed_lost")')
        .lte('expected_close_date', new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by month
      const forecast: Record<string, { total: number; weighted: number; count: number }> = {};
      
      for (let i = 0; i < months; i++) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() + i);
        const monthKey = monthDate.toISOString().substring(0, 7);
        forecast[monthKey] = { total: 0, weighted: 0, count: 0 };
      }

      opportunities?.forEach(o => {
        const monthKey = o.expected_close_date.substring(0, 7);
        if (forecast[monthKey]) {
          forecast[monthKey].total += o.value;
          forecast[monthKey].weighted += o.value * (o.probability / 100);
          forecast[monthKey].count++;
        }
      });

      return NextResponse.json({
        forecast,
        total_pipeline: opportunities?.reduce((sum, o) => sum + o.value, 0) || 0,
        total_weighted: opportunities?.reduce((sum, o) => sum + (o.value * o.probability / 100), 0) || 0,
      });
    }

    if (type === 'contact' && contactId) {
      // Get opportunities for a contact
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          owner:platform_users(id, first_name, last_name)
        `)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const open = opportunities?.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)) || [];
      const won = opportunities?.filter(o => o.stage === 'closed_won') || [];
      const lost = opportunities?.filter(o => o.stage === 'closed_lost') || [];

      return NextResponse.json({
        opportunities,
        open,
        won,
        lost,
        summary: {
          total: opportunities?.length || 0,
          open_value: open.reduce((sum, o) => sum + o.value, 0),
          won_value: won.reduce((sum, o) => sum + o.value, 0),
          lost_value: lost.reduce((sum, o) => sum + o.value, 0),
          win_rate: (won.length + lost.length) > 0 
            ? Math.round((won.length / (won.length + lost.length)) * 100) 
            : 0,
        },
      });
    }

    if (type === 'analysis') {
      // Get opportunity analysis
      const period = searchParams.get('period') || '365'; // days
      const periodStart = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();

      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('*')
        .gte('created_at', periodStart);

      if (error) throw error;

      // Win/loss analysis
      const closed = opportunities?.filter(o => ['closed_won', 'closed_lost'].includes(o.stage)) || [];
      const won = closed.filter(o => o.stage === 'closed_won');
      const lost = closed.filter(o => o.stage === 'closed_lost');

      // By type
      const byType = opportunities?.reduce((acc: Record<string, { count: number; value: number; won: number }>, o) => {
        if (!acc[o.type]) acc[o.type] = { count: 0, value: 0, won: 0 };
        acc[o.type].count++;
        acc[o.type].value += o.value;
        if (o.stage === 'closed_won') acc[o.type].won++;
        return acc;
      }, {});

      // By source
      const bySource = opportunities?.reduce((acc: Record<string, { count: number; value: number }>, o) => {
        const source = o.source || 'Unknown';
        if (!acc[source]) acc[source] = { count: 0, value: 0 };
        acc[source].count++;
        acc[source].value += o.value;
        return acc;
      }, {});

      // Average deal size
      const avgDealSize = won.length > 0 
        ? won.reduce((sum, o) => sum + o.value, 0) / won.length 
        : 0;

      // Average sales cycle (days from created to closed)
      const salesCycles = won.map(o => {
        const created = new Date(o.created_at);
        const closed = new Date(o.closed_at || o.updated_at);
        return (closed.getTime() - created.getTime()) / (24 * 60 * 60 * 1000);
      });
      const avgSalesCycle = salesCycles.length > 0 
        ? salesCycles.reduce((sum, d) => sum + d, 0) / salesCycles.length 
        : 0;

      return NextResponse.json({
        analysis: {
          total_opportunities: opportunities?.length || 0,
          total_value: opportunities?.reduce((sum, o) => sum + o.value, 0) || 0,
          win_rate: closed.length > 0 ? Math.round((won.length / closed.length) * 100) : 0,
          average_deal_size: Math.round(avgDealSize * 100) / 100,
          average_sales_cycle_days: Math.round(avgSalesCycle),
          won_value: won.reduce((sum, o) => sum + o.value, 0),
          lost_value: lost.reduce((sum, o) => sum + o.value, 0),
        },
        by_type: byType,
        by_source: bySource,
      });
    }

    // Default: return all opportunities
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        owner:platform_users(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ opportunities });
  } catch (error: any) {
    console.error('Opportunities error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create opportunity
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_opportunity') {
      const validated = opportunitySchema.parse(body.data);

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .insert({
          ...validated,
          weighted_value: validated.value * (validated.probability / 100),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ opportunity }, { status: 201 });
    }

    if (action === 'identify_upsell') {
      // Identify upsell opportunities from existing clients
      const { client_id, products, value, description } = body.data;
      const ownerId = body.owner_id;

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .insert({
          name: `Upsell - ${products?.[0] || 'Additional Services'}`,
          contact_id: client_id,
          type: 'upsell',
          stage: 'identified',
          value,
          probability: 30,
          expected_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          products,
          description,
          owner_id: ownerId,
          weighted_value: value * 0.3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ opportunity }, { status: 201 });
    }

    if (action === 'create_renewal') {
      // Create renewal opportunity from existing contract
      const { contract_id, contact_id, value, renewal_date } = body.data;
      const ownerId = body.owner_id;

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .insert({
          name: `Renewal - Contract ${contract_id}`,
          contact_id,
          type: 'renewal',
          stage: 'identified',
          value,
          probability: 70,
          expected_close_date: renewal_date,
          metadata: { contract_id },
          owner_id: ownerId,
          weighted_value: value * 0.7,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ opportunity }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Opportunities error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update opportunity
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (action === 'advance_stage') {
      const stageOrder = ['identified', 'qualified', 'proposal', 'negotiation', 'closed_won'];
      
      const { data: current } = await supabase
        .from('opportunities')
        .select('stage, probability')
        .eq('id', id)
        .single();

      if (!current) {
        return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
      }

      const currentIndex = stageOrder.indexOf(current.stage);
      if (currentIndex < stageOrder.length - 1) {
        const newStage = stageOrder[currentIndex + 1];
        const newProbability = [20, 40, 60, 80, 100][currentIndex + 1];

        const { data: opportunity, error } = await supabase
          .from('opportunities')
          .update({
            stage: newStage,
            probability: newProbability,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ opportunity });
      }
    }

    if (action === 'close_won') {
      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .update({
          stage: 'closed_won',
          probability: 100,
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ opportunity });
    }

    if (action === 'close_lost') {
      const { loss_reason } = body;

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .update({
          stage: 'closed_lost',
          probability: 0,
          loss_reason,
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ opportunity });
    }

    // Regular update
    if (updates.probability !== undefined || updates.value !== undefined) {
      const { data: current } = await supabase
        .from('opportunities')
        .select('value, probability')
        .eq('id', id)
        .single();

      const newValue = updates.value ?? current?.value ?? 0;
      const newProbability = updates.probability ?? current?.probability ?? 0;
      updates.weighted_value = newValue * (newProbability / 100);
    }

    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ opportunity });
  } catch (error: any) {
    console.error('Opportunities error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete opportunity
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Opportunities error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
