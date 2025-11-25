import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch business continuity and disaster recovery plans
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'bcp', 'drp', 'incident_response', 'all'
    const status = searchParams.get('status');

    let query = supabase
      .from('continuity_plans')
      .select(`
        *,
        owner:platform_users!owner_id(id, email, first_name, last_name),
        contacts:plan_contacts(*),
        procedures:plan_procedures(*),
        tests:plan_tests(*)
      `);

    if (type && type !== 'all') {
      query = query.eq('plan_type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get upcoming test dates
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingTests = data.flatMap(plan => 
      (plan.tests || []).filter((test: any) => 
        test.scheduled_date && new Date(test.scheduled_date) <= thirtyDaysFromNow && test.status === 'scheduled'
      )
    );

    return NextResponse.json({
      plans: data,
      upcoming_tests: upcomingTests,
      stats: {
        total_plans: data.length,
        active: data.filter(p => p.status === 'active').length,
        needs_review: data.filter(p => {
          const lastReview = new Date(p.last_review_date || p.created_at);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return lastReview < sixMonthsAgo;
        }).length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch continuity plans' },
      { status: 500 }
    );
  }
}

// POST - Create business continuity plan
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
    const {
      title,
      plan_type, // 'bcp', 'drp', 'incident_response', 'crisis_management'
      description,
      scope,
      objectives,
      critical_functions,
      recovery_time_objective, // RTO in hours
      recovery_point_objective, // RPO in hours
      owner_id,
      contacts,
      procedures,
      resources_required,
      dependencies,
      communication_plan,
      activation_criteria,
    } = body;

    const { data: plan, error: planError } = await supabase
      .from('continuity_plans')
      .insert({
        title,
        plan_type,
        description,
        scope,
        objectives: objectives || [],
        critical_functions: critical_functions || [],
        recovery_time_objective,
        recovery_point_objective,
        owner_id: owner_id || user.id,
        resources_required: resources_required || [],
        dependencies: dependencies || [],
        communication_plan,
        activation_criteria: activation_criteria || [],
        status: 'draft',
        version: '1.0',
        created_by: user.id,
      })
      .select()
      .single();

    if (planError) {
      return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    // Add contacts
    if (contacts && contacts.length > 0) {
      const contactRecords = contacts.map((contact: any) => ({
        plan_id: plan.id,
        name: contact.name,
        role: contact.role,
        phone: contact.phone,
        email: contact.email,
        is_primary: contact.is_primary || false,
        notification_order: contact.notification_order,
      }));
      await supabase.from('plan_contacts').insert(contactRecords);
    }

    // Add procedures
    if (procedures && procedures.length > 0) {
      const procedureRecords = procedures.map((proc: any, index: number) => ({
        plan_id: plan.id,
        title: proc.title,
        description: proc.description,
        responsible_party: proc.responsible_party,
        time_to_complete: proc.time_to_complete,
        order_index: index,
      }));
      await supabase.from('plan_procedures').insert(procedureRecords);
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

// PATCH - Update plan, schedule test, or record test results
export async function PATCH(request: NextRequest) {
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
    const { plan_id, action, ...updateData } = body;

    if (action === 'schedule_test') {
      const { test_type, scheduled_date, participants, objectives } = updateData;

      const { data: test, error } = await supabase
        .from('plan_tests')
        .insert({
          plan_id,
          test_type, // 'tabletop', 'walkthrough', 'simulation', 'full_scale'
          scheduled_date,
          participants: participants || [],
          objectives: objectives || [],
          status: 'scheduled',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ test });
    }

    if (action === 'record_test_results') {
      const { test_id, results, issues_found, recommendations, passed } = updateData;

      await supabase
        .from('plan_tests')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
          results,
          issues_found: issues_found || [],
          recommendations: recommendations || [],
          passed,
        })
        .eq('id', test_id);

      // Update plan last test date
      await supabase
        .from('continuity_plans')
        .update({ last_test_date: new Date().toISOString() })
        .eq('id', plan_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'activate') {
      await supabase
        .from('continuity_plans')
        .update({
          status: 'activated',
          activated_at: new Date().toISOString(),
          activated_by: user.id,
        })
        .eq('id', plan_id);

      // Create incident record
      await supabase.from('continuity_incidents').insert({
        plan_id,
        activated_by: user.id,
        activated_at: new Date().toISOString(),
        status: 'active',
      });

      return NextResponse.json({ success: true, message: 'Plan activated' });
    }

    // Default: update plan
    const { error } = await supabase
      .from('continuity_plans')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', plan_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}
