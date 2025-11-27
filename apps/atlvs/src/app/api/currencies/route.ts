import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const exchangeRateSchema = z.object({
  from_currency: z.string().length(3),
  to_currency: z.string().length(3),
  rate: z.number().positive(),
  source: z.enum(['manual', 'api', 'bank']).default('manual'),
  valid_from: z.string(),
  valid_until: z.string().optional()
});

// GET - List exchange rates or convert amount
export const GET = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');

    if (action === 'convert' && from && to && amount) {
      // Get latest exchange rate
      const { data: rate } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('from_currency', from.toUpperCase())
        .eq('to_currency', to.toUpperCase())
        .lte('valid_from', new Date().toISOString())
        .order('valid_from', { ascending: false })
        .limit(1)
        .single();

      if (!rate) {
        // Try to fetch from external API
        const fetchedRate = await fetchExchangeRate(from, to);
        if (fetchedRate) {
          const converted = parseFloat(amount) * fetchedRate;
          return NextResponse.json({
            from_currency: from.toUpperCase(),
            to_currency: to.toUpperCase(),
            original_amount: parseFloat(amount),
            exchange_rate: fetchedRate,
            converted_amount: converted,
            source: 'api'
          });
        }
        return NextResponse.json({ error: 'Exchange rate not found' }, { status: 404 });
      }

      const converted = parseFloat(amount) * rate.rate;
      return NextResponse.json({
        from_currency: from.toUpperCase(),
        to_currency: to.toUpperCase(),
        original_amount: parseFloat(amount),
        exchange_rate: rate.rate,
        converted_amount: converted,
        source: 'database'
      });
    }

    // List all exchange rates
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('valid_from', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by currency pair
    const grouped = data?.reduce((acc: any, rate: any) => {
      const key = `${rate.from_currency}_${rate.to_currency}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(rate);
      return acc;
    }, {});

    return NextResponse.json({ rates: grouped });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'currencies:list', resource: 'currencies' }
  }
);

// POST - Add exchange rate or sync from API
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabase = createAdminClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'sync_rates') {
      const { base_currency, target_currencies } = body;
      
      // Fetch latest rates from external API
      const rates = await fetchMultipleRates(base_currency, target_currencies);
      
      if (rates.length === 0) {
        return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
      }

      // Insert new rates
      const { data, error } = await supabase
        .from('exchange_rates')
        .insert(rates.map(r => ({
          ...r,
          source: 'api',
          created_by: context.user.id
        })))
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        rates: data,
        message: `Synced ${rates.length} exchange rates`
      }, { status: 201 });
    }

    // Manual rate entry
    const validated = exchangeRateSchema.parse(body);

    const { data: rate, error } = await supabase
      .from('exchange_rates')
      .insert({
        ...validated,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      rate,
      message: 'Exchange rate added successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'currencies:create', resource: 'currencies' }
  }
);

// Helper function to fetch exchange rate from API
async function fetchExchangeRate(from: string, to: string): Promise<number | null> {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) return null;

    // Using exchangerate-api.com as example
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from.toUpperCase()}/${to.toUpperCase()}`
    );
    const data = await response.json();
    
    if (data.result === 'success') {
      return data.conversion_rate;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return null;
  }
}

// Helper function to fetch multiple rates
async function fetchMultipleRates(base: string, targets: string[]): Promise<any[]> {
  const rates = [];
  const now = new Date().toISOString();

  for (const target of targets) {
    const rate = await fetchExchangeRate(base, target);
    if (rate) {
      rates.push({
        from_currency: base.toUpperCase(),
        to_currency: target.toUpperCase(),
        rate,
        valid_from: now
      });
    }
  }

  return rates;
}

// PUT - Update exchange rate
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('exchange_rates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rate: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'currencies:update', resource: 'currencies' }
  }
);

// DELETE - Deactivate exchange rate
export const DELETE = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('exchange_rates')
      .update({ 
        valid_until: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Exchange rate deactivated' });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'currencies:delete', resource: 'currencies' }
  }
);
