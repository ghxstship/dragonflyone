import { NextRequest, NextResponse } from 'next/server';
import { ingestTicketRevenue } from '@ghxstship/config/supabase-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgSlug, projectCode, eventCode, ticketCount, grossAmount, currency } = body;

    if (!orgSlug || !projectCode || !eventCode || !ticketCount || !grossAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await ingestTicketRevenue({
      orgSlug,
      projectCode,
      eventCode,
      ticketCount,
      grossAmount,
      currency,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ticket revenue ingestion API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
