import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Revenue recognition rule schema
const revenueRuleSchema = z.object({
  project_id: z.string().uuid(),
  revenue_type: z.enum(['upfront', 'milestone', 'time_based', 'completion', 'subscription']),
  total_amount: z.number().positive(),
  recognition_start_date: z.string(),
  recognition_end_date: z.string().optional(),
  milestones: z.array(z.object({
    name: z.string(),
    percentage: z.number().min(0).max(100),
    date: z.string(),
    status: z.enum(['pending', 'completed', 'deferred'])
  })).optional(),
  schedule_type: z.enum(['monthly', 'quarterly', 'custom']).optional()
});

// GET - List revenue recognition rules
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('revenue_recognition_rules')
      .select(`
        *,
        projects (
          id,
          name,
          client_name,
          total_budget
        )
      `)
      .order('created_at', { ascending: false });

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rules: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'revenue_recognition:list', resource: 'revenue_recognition' }
  }
);

// POST - Create revenue recognition rule
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const validated = revenueRuleSchema.parse(body);

    // Create recognition rule
    const { data: rule, error: ruleError } = await supabase
      .from('revenue_recognition_rules')
      .insert({
        ...validated,
        created_by: context.user.id,
        status: 'active'
      })
      .select()
      .single();

    if (ruleError) {
      return NextResponse.json({ error: ruleError.message }, { status: 500 });
    }

    // Generate recognition schedule based on rule type
    const schedule = await generateRecognitionSchedule(rule);

    // Insert schedule entries
    if (schedule.length > 0) {
      const { error: scheduleError } = await supabase
        .from('revenue_recognition_schedule')
        .insert(schedule);

      if (scheduleError) {
        return NextResponse.json({ error: scheduleError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      rule, 
      schedule,
      message: 'Revenue recognition rule created successfully' 
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    validation: revenueRuleSchema,
    audit: { action: 'revenue_recognition:create', resource: 'revenue_recognition' }
  }
);

// Helper function to generate recognition schedule
async function generateRecognitionSchedule(rule: any) {
  const schedule = [];
  const startDate = new Date(rule.recognition_start_date);
  const endDate = rule.recognition_end_date ? new Date(rule.recognition_end_date) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  switch (rule.revenue_type) {
    case 'upfront':
      // Recognize all revenue immediately
      schedule.push({
        rule_id: rule.id,
        recognition_date: rule.recognition_start_date,
        amount: rule.total_amount,
        status: 'pending',
        description: 'Upfront revenue recognition'
      });
      break;

    case 'milestone':
      // Recognize based on milestones
      if (rule.milestones && rule.milestones.length > 0) {
        rule.milestones.forEach((milestone: any) => {
          schedule.push({
            rule_id: rule.id,
            recognition_date: milestone.date,
            amount: (rule.total_amount * milestone.percentage) / 100,
            status: 'pending',
            description: `Milestone: ${milestone.name}`,
            metadata: { milestone_name: milestone.name }
          });
        });
      }
      break;

    case 'time_based':
      // Recognize evenly over time period
      const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
      const monthlyAmount = rule.total_amount / months;

      for (let i = 0; i < months; i++) {
        const recognitionDate = new Date(startDate);
        recognitionDate.setMonth(recognitionDate.getMonth() + i);
        
        schedule.push({
          rule_id: rule.id,
          recognition_date: recognitionDate.toISOString().split('T')[0],
          amount: monthlyAmount,
          status: 'pending',
          description: `Month ${i + 1} revenue recognition`
        });
      }
      break;

    case 'completion':
      // Recognize upon project completion (100% at end)
      schedule.push({
        rule_id: rule.id,
        recognition_date: endDate.toISOString().split('T')[0],
        amount: rule.total_amount,
        status: 'pending',
        description: 'Revenue recognition upon completion'
      });
      break;

    case 'subscription':
      // Recurring monthly recognition
      const subscriptionMonths = 12; // Default to 12 months
      const subscriptionAmount = rule.total_amount / subscriptionMonths;

      for (let i = 0; i < subscriptionMonths; i++) {
        const recognitionDate = new Date(startDate);
        recognitionDate.setMonth(recognitionDate.getMonth() + i);
        
        schedule.push({
          rule_id: rule.id,
          recognition_date: recognitionDate.toISOString().split('T')[0],
          amount: subscriptionAmount,
          status: 'pending',
          description: `Subscription period ${i + 1}`
        });
      }
      break;
  }

  return schedule;
}

// PUT - Process revenue recognition
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { schedule_id, status } = body;

    if (!schedule_id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    // Get schedule entry
    const { data: scheduleEntry, error: fetchError } = await supabase
      .from('revenue_recognition_schedule')
      .select('*, revenue_recognition_rules(*)')
      .eq('id', schedule_id)
      .single();

    if (fetchError || !scheduleEntry) {
      return NextResponse.json({ error: 'Schedule entry not found' }, { status: 404 });
    }

    // Update schedule status
    const { error: updateError } = await supabase
      .from('revenue_recognition_schedule')
      .update({ 
        status: status || 'recognized',
        recognized_at: new Date().toISOString()
      })
      .eq('id', schedule_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create ledger entry for recognized revenue
    if (status === 'recognized' || !status) {
      const { error: ledgerError } = await supabase
        .from('ledger_entries')
        .insert({
          entry_type: 'revenue',
          amount: scheduleEntry.amount,
          description: `Revenue recognition: ${scheduleEntry.description}`,
          project_id: scheduleEntry.revenue_recognition_rules.project_id,
          entry_date: new Date().toISOString().split('T')[0],
          status: 'posted',
          metadata: {
            revenue_rule_id: scheduleEntry.rule_id,
            schedule_id: scheduleEntry.id
          }
        });

      if (ledgerError) {
        return NextResponse.json({ error: ledgerError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      message: 'Revenue recognition processed successfully',
      schedule_entry: scheduleEntry
    });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'revenue_recognition:process', resource: 'revenue_recognition' }
  }
);
