import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const exchangeRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.50,
  MXN: 17.15,
  BRL: 4.97,
  CHF: 0.88,
  CNY: 7.24,
};

const currencyInfo: Record<string, { symbol: string; name: string; locale: string }> = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const currency = searchParams.get('currency') || 'USD';
    const amount = parseFloat(searchParams.get('amount') || '0');

    if (type === 'currencies') {
      const currencies = Object.entries(currencyInfo).map(([code, info]) => ({
        code,
        ...info,
        rate: exchangeRates[code],
      }));
      return NextResponse.json({ currencies });
    }

    if (type === 'convert') {
      const fromCurrency = searchParams.get('from') || 'USD';
      const toCurrency = searchParams.get('to') || 'USD';

      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[toCurrency] || 1;

      const usdAmount = amount / fromRate;
      const convertedAmount = usdAmount * toRate;

      return NextResponse.json({
        original: { amount, currency: fromCurrency },
        converted: {
          amount: Math.round(convertedAmount * 100) / 100,
          currency: toCurrency,
          formatted: formatCurrency(convertedAmount, toCurrency),
        },
        rate: toRate / fromRate,
      });
    }

    if (type === 'localized_prices') {
      const eventId = searchParams.get('event_id');

      if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

      const { data: tickets } = await supabase
        .from('ticket_types')
        .select('id, name, price')
        .eq('event_id', eventId);

      const localizedPrices = tickets?.map(ticket => ({
        ticket_type_id: ticket.id,
        name: ticket.name,
        base_price_usd: ticket.price,
        localized_price: {
          amount: Math.round(ticket.price * (exchangeRates[currency] || 1) * 100) / 100,
          currency,
          formatted: formatCurrency(ticket.price * (exchangeRates[currency] || 1), currency),
        },
      }));

      return NextResponse.json({ prices: localizedPrices, currency });
    }

    return NextResponse.json({
      rates: exchangeRates,
      base_currency: 'USD',
      last_updated: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'set_event_pricing') {
      const { event_id, currency_prices } = body.data;

      for (const pricing of currency_prices) {
        await supabase
          .from('event_currency_prices')
          .upsert({
            event_id,
            currency_code: pricing.currency,
            price_multiplier: pricing.multiplier,
            fixed_price: pricing.fixed_price,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'event_id,currency_code' });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'calculate_checkout') {
      const { items, currency } = body.data;

      let subtotal = 0;
      const itemsWithPrices = items.map((item: any) => {
        const localPrice = item.price * (exchangeRates[currency] || 1);
        subtotal += localPrice * item.quantity;
        return {
          ...item,
          local_price: Math.round(localPrice * 100) / 100,
          local_total: Math.round(localPrice * item.quantity * 100) / 100,
        };
      });

      return NextResponse.json({
        items: itemsWithPrices,
        subtotal: Math.round(subtotal * 100) / 100,
        currency,
        formatted_subtotal: formatCurrency(subtotal, currency),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatCurrency(amount: number, currency: string): string {
  const info = currencyInfo[currency] || currencyInfo.USD;
  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
