import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Sample tax rates by jurisdiction
const taxRates: Record<string, { state: number; county?: number; city?: number; special?: number }> = {
  'CA': { state: 0.0725, county: 0.01, city: 0.0125 },
  'NY': { state: 0.04, county: 0.045, city: 0.045 },
  'TX': { state: 0.0625, county: 0.02 },
  'FL': { state: 0.06, county: 0.01 },
  'WA': { state: 0.065, county: 0.02, city: 0.036 },
  'NV': { state: 0.0685, county: 0.0125 },
  'IL': { state: 0.0625, county: 0.0175, city: 0.01 },
  'PA': { state: 0.06, county: 0.02 },
  'OH': { state: 0.0575, county: 0.0175 },
  'GA': { state: 0.04, county: 0.03, special: 0.01 },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const state = searchParams.get('state');
    const zip = searchParams.get('zip');

    if (type === 'rates') {
      if (state) {
        const rates = taxRates[state.toUpperCase()];
        if (!rates) {
          return NextResponse.json({ error: 'State not found', default_rate: 0.08 });
        }

        const totalRate = (rates.state || 0) + (rates.county || 0) + (rates.city || 0) + (rates.special || 0);

        return NextResponse.json({
          state: state.toUpperCase(),
          breakdown: rates,
          total_rate: Math.round(totalRate * 10000) / 10000,
          total_percentage: `${(totalRate * 100).toFixed(2)}%`,
        });
      }

      return NextResponse.json({ rates: taxRates });
    }

    if (type === 'by_zip' && zip) {
      // In production, integrate with tax API like Avalara or TaxJar
      // For now, use state-based lookup
      const stateByZip = getStateFromZip(zip);
      const rates = taxRates[stateByZip] || { state: 0.08 };
      const totalRate = (rates.state || 0) + (rates.county || 0) + (rates.city || 0) + (rates.special || 0);

      return NextResponse.json({
        zip,
        state: stateByZip,
        total_rate: totalRate,
      });
    }

    if (type === 'exemptions') {
      const { data: exemptions, error } = await supabase
        .from('tax_exemptions')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return NextResponse.json({ exemptions });
    }

    return NextResponse.json({ rates: taxRates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'calculate') {
      const { items, shipping_address, exemption_id } = body.data;

      const state = shipping_address?.state?.toUpperCase() || 'CA';
      const rates = taxRates[state] || { state: 0.08 };
      let totalRate = (rates.state || 0) + (rates.county || 0) + (rates.city || 0) + (rates.special || 0);

      // Check for exemption
      if (exemption_id) {
        const { data: exemption } = await supabase
          .from('tax_exemptions')
          .select('exemption_type, exemption_rate')
          .eq('id', exemption_id)
          .eq('status', 'active')
          .single();

        if (exemption) {
          totalRate = totalRate * (1 - (exemption.exemption_rate || 1));
        }
      }

      let subtotal = 0;
      const taxableItems = items.map((item: any) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Some items may be tax-exempt (e.g., certain food items)
        const taxable = item.taxable !== false;
        const itemTax = taxable ? itemTotal * totalRate : 0;

        return {
          ...item,
          subtotal: itemTotal,
          taxable,
          tax: Math.round(itemTax * 100) / 100,
        };
      });

      const totalTax = taxableItems.reduce((sum: number, item: any) => sum + item.tax, 0);

      return NextResponse.json({
        items: taxableItems,
        subtotal: Math.round(subtotal * 100) / 100,
        tax_rate: totalRate,
        tax_breakdown: rates,
        total_tax: Math.round(totalTax * 100) / 100,
        total: Math.round((subtotal + totalTax) * 100) / 100,
        jurisdiction: { state, rates },
      });
    }

    if (action === 'add_exemption') {
      const { user_id, exemption_type, certificate_number, expiry_date } = body.data;

      const { data: exemption, error } = await supabase
        .from('tax_exemptions')
        .insert({
          user_id,
          exemption_type,
          certificate_number,
          expiry_date,
          exemption_rate: exemption_type === 'full' ? 1 : 0.5,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ exemption }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getStateFromZip(zip: string): string {
  const zipNum = parseInt(zip.substring(0, 3));

  if (zipNum >= 900 && zipNum <= 961) return 'CA';
  if (zipNum >= 100 && zipNum <= 149) return 'NY';
  if (zipNum >= 750 && zipNum <= 799) return 'TX';
  if (zipNum >= 320 && zipNum <= 349) return 'FL';
  if (zipNum >= 980 && zipNum <= 994) return 'WA';
  if (zipNum >= 889 && zipNum <= 898) return 'NV';
  if (zipNum >= 600 && zipNum <= 629) return 'IL';
  if (zipNum >= 150 && zipNum <= 196) return 'PA';
  if (zipNum >= 430 && zipNum <= 459) return 'OH';
  if (zipNum >= 300 && zipNum <= 319) return 'GA';

  return 'CA'; // Default
}
