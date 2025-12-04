import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default quick links for fallback
const defaultQuickLinks = [
  { id: 'default-1', name: 'Create New Project', description: 'Start a new project from scratch', href: '/projects/new', icon: 'FolderPlus', category: 'projects', is_active: true, sort_order: 1 },
  { id: 'default-2', name: 'Submit Expense Report', description: 'Submit a new expense for reimbursement', href: '/expenses/new', icon: 'Receipt', category: 'finance', is_active: true, sort_order: 10 },
  { id: 'default-3', name: 'Check Asset Availability', description: 'View asset availability calendar', href: '/assets/availability', icon: 'Calendar', category: 'assets', is_active: true, sort_order: 20 },
  { id: 'default-4', name: 'Generate Financial Report', description: 'Create financial summary report', href: '/reports/financial/new', icon: 'FileBarChart', category: 'reports', is_active: true, sort_order: 40 },
  { id: 'default-5', name: 'Create Invoice', description: 'Generate a new invoice', href: '/invoices/new', icon: 'FileText', category: 'finance', is_active: true, sort_order: 11 },
  { id: 'default-6', name: 'Add New Contact', description: 'Create a new contact record', href: '/contacts/new', icon: 'UserPlus', category: 'crm', is_active: true, sort_order: 30 },
  { id: 'default-7', name: 'Create Deal', description: 'Start a new deal in pipeline', href: '/deals/new', icon: 'Handshake', category: 'crm', is_active: true, sort_order: 31 },
  { id: 'default-8', name: 'Reserve Asset', description: 'Reserve equipment or resources', href: '/assets/reserve', icon: 'Package', category: 'assets', is_active: true, sort_order: 21 },
  { id: 'default-9', name: 'Budget Request', description: 'Request budget allocation', href: '/budgets/request', icon: 'DollarSign', category: 'finance', is_active: true, sort_order: 12 },
  { id: 'default-10', name: 'Help Center', description: 'Browse help documentation', href: '/help', icon: 'HelpCircle', category: 'general', is_active: true, sort_order: 60 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('quick_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    // Return defaults if table doesn't exist or is empty
    if (error || !data || data.length === 0) {
      let filteredDefaults = defaultQuickLinks;
      if (category) {
        filteredDefaults = defaultQuickLinks.filter(l => l.category === category);
      }
      return NextResponse.json({
        quick_links: filteredDefaults.slice(0, limit),
        total: filteredDefaults.length,
      });
    }

    return NextResponse.json({
      quick_links: data,
      total: data.length,
    });
  } catch (error) {
    console.error('Error fetching quick links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quick links' },
      { status: 500 }
    );
  }
}
