import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { authorizeAdminRequest } from '@/lib/admin-auth';

const payoutsQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  startingAfter: z.string().optional(),
  status: z.enum(['paid', 'pending', 'in_transit', 'canceled', 'failed']).optional(),
});

interface PayoutSummary {
  id: string;
  amount: number;
  currency: string;
  arrival_date: number;
  created: number;
  status: string;
  method: string;
  type: string;
  description: string | null;
  destination?: string;
}

interface PayoutsResponse {
  payouts: PayoutSummary[];
  hasMore: boolean;
  summary: {
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    nextPayoutDate: number | null;
    nextPayoutAmount: number | null;
  };
}

export async function GET(request: Request) {
  if (!authorizeAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      startingAfter: searchParams.get('startingAfter') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const params = payoutsQuerySchema.parse(queryParams);

    // Fetch payouts from Stripe
    const payouts = await stripe.payouts.list({
      limit: params.limit,
      starting_after: params.startingAfter,
      ...(params.status && { status: params.status }),
    });

    // Fetch balance to get upcoming payout information
    const balance = await stripe.balance.retrieve();

    // Calculate summary statistics
    const allPayouts = await stripe.payouts.list({ limit: 100 });
    
    const summary = allPayouts.data.reduce(
      (acc, payout) => {
        if (payout.status === 'paid') {
          acc.totalPaid += payout.amount;
        } else if (payout.status === 'pending' || payout.status === 'in_transit') {
          acc.totalPending += payout.amount;
        } else if (payout.status === 'failed' || payout.status === 'canceled') {
          acc.totalFailed += payout.amount;
        }

        // Find next upcoming payout
        if ((payout.status === 'pending' || payout.status === 'in_transit') && 
            payout.arrival_date > Math.floor(Date.now() / 1000)) {
          if (!acc.nextPayoutDate || payout.arrival_date < acc.nextPayoutDate) {
            acc.nextPayoutDate = payout.arrival_date;
            acc.nextPayoutAmount = payout.amount;
          }
        }

        return acc;
      },
      {
        totalPaid: 0,
        totalPending: 0,
        totalFailed: 0,
        nextPayoutDate: null as number | null,
        nextPayoutAmount: null as number | null,
      }
    );

    // Add pending balance to summary
    const pendingBalance = balance.pending.reduce((sum, bal) => sum + bal.amount, 0);
    summary.totalPending += pendingBalance;

    const response: PayoutsResponse = {
      payouts: payouts.data.map((payout) => ({
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        arrival_date: payout.arrival_date,
        created: payout.created,
        status: payout.status,
        method: payout.method,
        type: payout.type,
        description: payout.description,
        destination: typeof payout.destination === 'string' ? payout.destination : undefined,
      })),
      hasMore: payouts.has_more,
      summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Payouts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual payout creation (if needed)
export async function POST(request: Request) {
  if (!authorizeAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payoutSchema = z.object({
    amount: z.number().int().positive(),
    currency: z.string().length(3).toLowerCase(),
    description: z.string().max(255).optional(),
    statementDescriptor: z.string().max(22).optional(),
  });

  try {
    const body = await request.json();
    const payload = payoutSchema.parse(body);

    // Create manual payout
    const payout = await stripe.payouts.create({
      amount: payload.amount,
      currency: payload.currency,
      description: payload.description,
      statement_descriptor: payload.statementDescriptor,
    });

    return NextResponse.json({ 
      success: true, 
      payout: {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        arrival_date: payout.arrival_date,
      }
    });
  } catch (error) {
    console.error('Manual payout creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json(
      { error: 'Failed to create payout', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
