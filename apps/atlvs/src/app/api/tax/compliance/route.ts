import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const taxReportSchema = z.object({
  report_type: z.enum(['1099', 'w2', 'sales_tax', 'vat', 'quarterly', 'annual']),
  fiscal_year: z.number().int().min(2020).max(2050),
  quarter: z.number().int().min(1).max(4).optional(),
  jurisdiction: z.string().default('US'),
  include_estimates: z.boolean().default(false)
});

// GET - Generate tax reports or retrieve tax data
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const year = searchParams.get('year');
    const report_type = searchParams.get('report_type');

    if (action === 'generate_report') {
      const validated = taxReportSchema.parse({
        report_type: report_type || 'annual',
        fiscal_year: year ? parseInt(year) : new Date().getFullYear(),
        quarter: searchParams.get('quarter') ? parseInt(searchParams.get('quarter')!) : undefined,
        jurisdiction: searchParams.get('jurisdiction') || 'US'
      });

      const report = await generateTaxReport(validated);

      return NextResponse.json({
        report,
        generated_at: new Date().toISOString()
      });
    }

    if (action === 'tax_liability') {
      // Calculate current tax liability
      const currentYear = new Date().getFullYear();
      const liability = await calculateTaxLiability(currentYear);

      return NextResponse.json({ liability });
    }

    // List all tax filings
    const { data, error } = await supabase
      .from('tax_filings')
      .select('*')
      .order('filing_date', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ filings: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'tax:list', resource: 'tax_compliance' }
  }
);

// POST - File tax return or record payment
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { action } = body;

    if (action === 'file_return') {
      const { report_type, fiscal_year, quarter, amount_due, forms_data } = body;

      const { data: filing, error } = await supabase
        .from('tax_filings')
        .insert({
          report_type,
          fiscal_year,
          quarter,
          amount_due,
          forms_data,
          filing_date: new Date().toISOString(),
          status: 'filed',
          filed_by: context.user.id
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        filing,
        message: 'Tax return filed successfully'
      }, { status: 201 });
    }

    if (action === 'record_payment') {
      const { filing_id, amount, payment_method, confirmation_number } = body;

      const { error } = await supabase
        .from('tax_filings')
        .update({
          amount_paid: amount,
          payment_date: new Date().toISOString(),
          payment_method,
          payment_confirmation: confirmation_number,
          status: 'paid'
        })
        .eq('id', filing_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Payment recorded successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'tax:file', resource: 'tax_compliance' }
  }
);

// Helper functions
async function generateTaxReport(config: any) {
  const startDate = config.quarter 
    ? new Date(config.fiscal_year, (config.quarter - 1) * 3, 1)
    : new Date(config.fiscal_year, 0, 1);
  
  const endDate = config.quarter
    ? new Date(config.fiscal_year, config.quarter * 3, 0)
    : new Date(config.fiscal_year, 11, 31);

  switch (config.report_type) {
    case '1099':
      return await generate1099Report(startDate, endDate);
    case 'w2':
      return await generateW2Report(config.fiscal_year);
    case 'sales_tax':
      return await generateSalesTaxReport(startDate, endDate, config.jurisdiction);
    case 'vat':
      return await generateVATReport(startDate, endDate, config.jurisdiction);
    case 'quarterly':
      return await generateQuarterlyReport(startDate, endDate);
    case 'annual':
      return await generateAnnualReport(config.fiscal_year);
    default:
      return {};
  }
}

async function generate1099Report(startDate: Date, endDate: Date) {
  // Get contractor payments
  const { data: payments } = await supabase
    .from('contractor_payments')
    .select(`
      contractor_id,
      contractors (
        name,
        ein,
        address
      ),
      sum(amount) as total_paid
    `)
    .gte('payment_date', startDate.toISOString())
    .lte('payment_date', endDate.toISOString())
    .gte('sum(amount)', 600); // IRS threshold

  return {
    report_type: '1099-NEC',
    recipients: payments || [],
    total_recipients: payments?.length || 0
  };
}

async function generateW2Report(year: number) {
  // Get employee wages
  const { data: employees } = await supabase
    .from('employees')
    .select(`
      id,
      first_name,
      last_name,
      ssn,
      address,
      payroll_records (
        gross_pay,
        federal_withholding,
        state_withholding,
        social_security,
        medicare
      )
    `)
    .eq('payroll_records.year', year);

  return {
    report_type: 'W-2',
    employees: employees?.map(emp => ({
      ...emp,
      totals: {
        wages: emp.payroll_records.reduce((sum: number, r: any) => sum + r.gross_pay, 0),
        federal_tax: emp.payroll_records.reduce((sum: number, r: any) => sum + r.federal_withholding, 0),
        state_tax: emp.payroll_records.reduce((sum: number, r: any) => sum + r.state_withholding, 0),
        social_security: emp.payroll_records.reduce((sum: number, r: any) => sum + r.social_security, 0),
        medicare: emp.payroll_records.reduce((sum: number, r: any) => sum + r.medicare, 0)
      }
    })) || []
  };
}

async function generateSalesTaxReport(startDate: Date, endDate: Date, jurisdiction: string) {
  // Get taxable sales
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, tax_amount, jurisdiction')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'completed');

  const salesByJurisdiction = (orders || []).reduce((acc: any, order: any) => {
    const j = order.jurisdiction || 'unknown';
    if (!acc[j]) {
      acc[j] = { sales: 0, tax_collected: 0, count: 0 };
    }
    acc[j].sales += order.total_amount - order.tax_amount;
    acc[j].tax_collected += order.tax_amount;
    acc[j].count += 1;
    return acc;
  }, {});

  return {
    report_type: 'Sales Tax',
    period: { start: startDate, end: endDate },
    by_jurisdiction: salesByJurisdiction,
    total_tax_collected: Object.values(salesByJurisdiction).reduce((sum: number, j: any) => sum + j.tax_collected, 0)
  };
}

async function generateVATReport(startDate: Date, endDate: Date, jurisdiction: string) {
  // Similar to sales tax but with VAT calculations
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, vat_amount, vat_rate')
    .gte('transaction_date', startDate.toISOString())
    .lte('transaction_date', endDate.toISOString());

  return {
    report_type: 'VAT',
    period: { start: startDate, end: endDate },
    output_vat: (transactions || []).reduce((sum: number, t: any) => sum + t.vat_amount, 0),
    total_transactions: transactions?.length || 0
  };
}

async function generateQuarterlyReport(startDate: Date, endDate: Date) {
  const { data: financials } = await supabase
    .from('ledger_entries')
    .select('entry_type, amount')
    .gte('entry_date', startDate.toISOString().split('T')[0])
    .lte('entry_date', endDate.toISOString().split('T')[0]);

  const revenue = (financials || [])
    .filter((e: any) => e.entry_type === 'revenue')
    .reduce((sum: number, e: any) => sum + e.amount, 0);

  const expenses = (financials || [])
    .filter((e: any) => e.entry_type === 'expense')
    .reduce((sum: number, e: any) => sum + e.amount, 0);

  return {
    report_type: 'Quarterly',
    period: { start: startDate, end: endDate },
    revenue,
    expenses,
    net_income: revenue - expenses,
    estimated_tax: (revenue - expenses) * 0.21 // Example corporate rate
  };
}

async function generateAnnualReport(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // Aggregate all financial data
  const { data: financials } = await supabase
    .from('ledger_entries')
    .select('entry_type, amount, category')
    .gte('entry_date', startDate.toISOString().split('T')[0])
    .lte('entry_date', endDate.toISOString().split('T')[0]);

  const byCategory = (financials || []).reduce((acc: any, entry: any) => {
    if (!acc[entry.category]) {
      acc[entry.category] = 0;
    }
    acc[entry.category] += entry.amount;
    return acc;
  }, {});

  return {
    report_type: 'Annual',
    fiscal_year: year,
    summary: byCategory,
    total_revenue: (financials || [])
      .filter((e: any) => e.entry_type === 'revenue')
      .reduce((sum: number, e: any) => sum + e.amount, 0),
    total_expenses: (financials || [])
      .filter((e: any) => e.entry_type === 'expense')
      .reduce((sum: number, e: any) => sum + e.amount, 0)
  };
}

async function calculateTaxLiability(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date();

  const { data: revenue } = await supabase
    .from('ledger_entries')
    .select('amount')
    .eq('entry_type', 'revenue')
    .gte('entry_date', startDate.toISOString().split('T')[0])
    .lte('entry_date', endDate.toISOString().split('T')[0]);

  const { data: expenses } = await supabase
    .from('ledger_entries')
    .select('amount')
    .eq('entry_type', 'expense')
    .gte('entry_date', startDate.toISOString().split('T')[0])
    .lte('entry_date', endDate.toISOString().split('T')[0]);

  const totalRevenue = (revenue || []).reduce((sum: number, r: any) => sum + r.amount, 0);
  const totalExpenses = (expenses || []).reduce((sum: number, e: any) => sum + e.amount, 0);
  const taxableIncome = totalRevenue - totalExpenses;

  return {
    year,
    total_revenue: totalRevenue,
    total_expenses: totalExpenses,
    taxable_income: taxableIncome,
    estimated_federal_tax: taxableIncome * 0.21,
    estimated_state_tax: taxableIncome * 0.05,
    total_estimated_tax: taxableIncome * 0.26
  };
}

// PUT - Update filing status
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tax_filings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ filing: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'tax:update', resource: 'tax_compliance' }
  }
);
