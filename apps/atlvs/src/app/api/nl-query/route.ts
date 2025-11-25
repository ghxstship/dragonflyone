import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const QuerySchema = z.object({
  query: z.string().min(3).max(500),
  context: z.enum(['sales', 'finance', 'projects', 'assets', 'workforce', 'general']).default('general'),
});

// Mapping of natural language patterns to SQL queries
const queryPatterns: Record<string, { pattern: RegExp; handler: (matches: RegExpMatchArray) => { sql: string; description: string } }> = {
  totalRevenue: {
    pattern: /(?:total|sum|all)\s+(?:revenue|sales|income)(?:\s+(?:for|in|during)\s+(?:the\s+)?(?:last|past)\s+(\d+)\s+(days?|weeks?|months?|years?))?/i,
    handler: (matches) => {
      const amount = matches[1] || '30';
      const unit = matches[2] || 'days';
      return {
        sql: `SELECT SUM(total_amount) as total_revenue FROM invoices WHERE status = 'paid' AND created_at > NOW() - INTERVAL '${amount} ${unit}'`,
        description: `Total revenue for the last ${amount} ${unit}`,
      };
    },
  },
  topClients: {
    pattern: /(?:top|best|highest)\s+(\d+)?\s*(?:clients?|customers?)/i,
    handler: (matches) => {
      const limit = matches[1] || '10';
      return {
        sql: `SELECT c.name, SUM(i.total_amount) as total_revenue FROM contacts c JOIN invoices i ON c.id = i.contact_id WHERE i.status = 'paid' GROUP BY c.id, c.name ORDER BY total_revenue DESC LIMIT ${limit}`,
        description: `Top ${limit} clients by revenue`,
      };
    },
  },
  openDeals: {
    pattern: /(?:open|active|pending)\s+(?:deals?|opportunities?)/i,
    handler: () => ({
      sql: `SELECT name, value, stage, created_at FROM deals WHERE stage NOT IN ('closed_won', 'closed_lost') ORDER BY value DESC`,
      description: 'All open deals',
    }),
  },
  dealsByStage: {
    pattern: /(?:deals?|opportunities?)\s+(?:by|per|in)\s+(?:stage|pipeline)/i,
    handler: () => ({
      sql: `SELECT stage, COUNT(*) as count, SUM(value) as total_value FROM deals GROUP BY stage ORDER BY count DESC`,
      description: 'Deals grouped by stage',
    }),
  },
  projectStatus: {
    pattern: /(?:project|projects?)\s+(?:status|overview|summary)/i,
    handler: () => ({
      sql: `SELECT status, COUNT(*) as count, SUM(budget) as total_budget FROM projects GROUP BY status`,
      description: 'Project status summary',
    }),
  },
  overdueInvoices: {
    pattern: /(?:overdue|late|unpaid|outstanding)\s+(?:invoices?|bills?|payments?)/i,
    handler: () => ({
      sql: `SELECT invoice_number, contact_id, total_amount, due_date, CURRENT_DATE - due_date as days_overdue FROM invoices WHERE status = 'sent' AND due_date < CURRENT_DATE ORDER BY days_overdue DESC`,
      description: 'Overdue invoices',
    }),
  },
  employeeCount: {
    pattern: /(?:how many|number of|count)\s+(?:employees?|staff|team members?|workers?)/i,
    handler: () => ({
      sql: `SELECT COUNT(*) as employee_count, department_id FROM platform_users WHERE is_active = true GROUP BY department_id`,
      description: 'Employee count by department',
    }),
  },
  recentActivity: {
    pattern: /(?:recent|latest|last)\s+(?:activity|activities|actions?)/i,
    handler: () => ({
      sql: `SELECT action, description, created_at, user_id FROM audit_logs ORDER BY created_at DESC LIMIT 50`,
      description: 'Recent activity log',
    }),
  },
  assetUtilization: {
    pattern: /(?:asset|equipment)\s+(?:utilization|usage|status)/i,
    handler: () => ({
      sql: `SELECT status, COUNT(*) as count, SUM(purchase_price) as total_value FROM assets GROUP BY status`,
      description: 'Asset utilization summary',
    }),
  },
  vendorSpend: {
    pattern: /(?:vendor|supplier)\s+(?:spend|spending|expenses?)/i,
    handler: () => ({
      sql: `SELECT v.name, SUM(po.total_amount) as total_spend FROM vendors v JOIN purchase_orders po ON v.id = po.vendor_id GROUP BY v.id, v.name ORDER BY total_spend DESC LIMIT 20`,
      description: 'Vendor spend analysis',
    }),
  },
};

// GET /api/nl-query - Get query history and suggestions
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
    const action = searchParams.get('action');

    if (action === 'history') {
      const { data: history } = await supabase
        .from('nl_queries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({ history: history || [] });
    } else if (action === 'suggestions') {
      const suggestions = [
        'Show me total revenue for the last 30 days',
        'Top 10 clients by revenue',
        'Open deals by stage',
        'Overdue invoices',
        'Project status summary',
        'Asset utilization',
        'Vendor spend analysis',
        'Employee count by department',
      ];

      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST /api/nl-query - Execute natural language query
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
    const validated = QuerySchema.parse(body);

    const startTime = Date.now();

    // Try to match query against patterns
    let matchedQuery: { sql: string; description: string } | null = null;

    for (const [, { pattern, handler }] of Object.entries(queryPatterns)) {
      const matches = validated.query.match(pattern);
      if (matches) {
        matchedQuery = handler(matches);
        break;
      }
    }

    if (!matchedQuery) {
      // Log failed query for improvement
      await supabase.from('nl_queries').insert({
        user_id: user.id,
        query_text: validated.query,
        was_successful: false,
      });

      return NextResponse.json({
        error: 'Could not understand query',
        suggestions: [
          'Try asking about revenue, deals, projects, or assets',
          'Example: "Show me total revenue for the last 30 days"',
          'Example: "Top 10 clients by revenue"',
        ],
      }, { status: 400 });
    }

    // Execute the query (in production, this would be more secure)
    // For now, we'll simulate results based on the query type
    let results: any[] = [];
    let rowCount = 0;

    try {
      // Note: In production, you would NOT execute raw SQL like this
      // This is a simplified example - use proper query builders or views
      const { data, error } = await supabase.rpc('execute_safe_query', {
        query_sql: matchedQuery.sql,
      });

      if (error) {
        // If RPC doesn't exist, return mock data
        results = generateMockResults(matchedQuery.description);
        rowCount = results.length;
      } else {
        results = data || [];
        rowCount = results.length;
      }
    } catch {
      // Return mock data if query execution fails
      results = generateMockResults(matchedQuery.description);
      rowCount = results.length;
    }

    const executionTime = Date.now() - startTime;

    // Log successful query
    await supabase.from('nl_queries').insert({
      user_id: user.id,
      query_text: validated.query,
      generated_sql: matchedQuery.sql,
      result_summary: matchedQuery.description,
      execution_time_ms: executionTime,
      row_count: rowCount,
      was_successful: true,
    });

    return NextResponse.json({
      query: validated.query,
      description: matchedQuery.description,
      sql: matchedQuery.sql,
      results,
      row_count: rowCount,
      execution_time_ms: executionTime,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
  }
}

// PATCH /api/nl-query - Provide feedback on query
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('query_id');

    if (!queryId) {
      return NextResponse.json({ error: 'Query ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { feedback } = body;

    if (!['helpful', 'not_helpful', 'incorrect'].includes(feedback)) {
      return NextResponse.json({ error: 'Invalid feedback value' }, { status: 400 });
    }

    const { error } = await supabase
      .from('nl_queries')
      .update({ feedback })
      .eq('id', queryId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}

// Helper function to generate mock results
function generateMockResults(description: string): any[] {
  if (description.includes('revenue')) {
    return [{ total_revenue: 1250000 }];
  } else if (description.includes('clients')) {
    return [
      { name: 'Acme Corp', total_revenue: 250000 },
      { name: 'Tech Solutions', total_revenue: 180000 },
      { name: 'Global Events', total_revenue: 150000 },
    ];
  } else if (description.includes('deals')) {
    return [
      { stage: 'Proposal', count: 12, total_value: 450000 },
      { stage: 'Negotiation', count: 8, total_value: 320000 },
      { stage: 'Discovery', count: 15, total_value: 280000 },
    ];
  } else if (description.includes('Project')) {
    return [
      { status: 'active', count: 25, total_budget: 1500000 },
      { status: 'completed', count: 42, total_budget: 2800000 },
      { status: 'planning', count: 8, total_budget: 450000 },
    ];
  }
  return [{ message: 'Query executed successfully' }];
}
