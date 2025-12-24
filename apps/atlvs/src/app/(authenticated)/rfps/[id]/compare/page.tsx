'use client';

import { ArrowLeft, CheckCircle, Star, DollarSign, Clock, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Body,
  Button,
  H1,
  H3,
  Link,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

interface Quote {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_company?: string;
  total_price: number;
  delivery_timeline: string;
  proposal_summary: string;
  line_items?: { description: string; quantity: number; unit_price: number; total: number }[];
  strengths?: string[];
  rating?: number;
  submitted_at: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'awarded';
}

export default function RFPComparePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: rfpData, isLoading: rfpLoading } = useQuery({
    queryKey: ['rfp', id],
    queryFn: async () => {
      const res = await fetch(`/api/rfps/${id}`);
      if (!res.ok) throw new Error('Failed to fetch RFP');
      return res.json();
    },
  });

  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ['rfp-quotes', id],
    queryFn: async () => {
      const res = await fetch(`/api/rfps/${id}/quotes`);
      if (!res.ok) return { quotes: [] };
      return res.json();
    },
  });

  const rfp = rfpData?.rfp;
  const quotes = (quotesData?.quotes || []) as Quote[];

  const isLoading = rfpLoading || quotesLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getLowestPrice = () => {
    if (quotes.length === 0) return 0;
    return Math.min(...quotes.map(q => q.total_price));
  };

  const lowestPrice = getLowestPrice();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          RFP not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/rfps/${id}`}
          className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Compare Quotes</H1>
          <Body className="text-body-sm text-muted-foreground">{rfp.title}</Body>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No quotes received yet
          </H3>
          <Body className="text-body-sm text-muted-foreground">
            Quotes will appear here once vendors submit their proposals.
          </Body>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-background border-2 border-border rounded-card p-4">
              <Body className="text-body-xs text-muted-foreground mb-1">Quotes Received</Body>
              <Body className="text-h3-md font-weight-bold text-foreground">{quotes.length}</Body>
            </div>
            <div className="bg-background border-2 border-border rounded-card p-4">
              <Body className="text-body-xs text-muted-foreground mb-1">Lowest Quote</Body>
              <Body className="text-h3-md font-weight-bold text-success">{formatCurrency(lowestPrice)}</Body>
            </div>
            <div className="bg-background border-2 border-border rounded-card p-4">
              <Body className="text-body-xs text-muted-foreground mb-1">Highest Quote</Body>
              <Body className="text-h3-md font-weight-bold text-foreground">
                {formatCurrency(Math.max(...quotes.map(q => q.total_price)))}
              </Body>
            </div>
            <div className="bg-background border-2 border-border rounded-card p-4">
              <Body className="text-body-xs text-muted-foreground mb-1">Average Quote</Body>
              <Body className="text-h3-md font-weight-bold text-foreground">
                {formatCurrency(quotes.reduce((sum, q) => sum + q.total_price, 0) / quotes.length)}
              </Body>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-left p-4 text-body-sm font-weight-semibold text-foreground border-2 border-border">
                    Criteria
                  </TableHead>
                  {quotes.map((quote) => (
                    <TableHead key={quote.id} className="text-left p-4 text-body-sm font-weight-semibold text-foreground border-2 border-border min-w-[200px]">
                      <div className="flex items-center gap-2">
                        {quote.total_price === lowestPrice && (
                          <Award className="h-4 w-4 text-success" />
                        )}
                        {quote.vendor_company || quote.vendor_name}
                      </div>
                      {quote.status === 'shortlisted' && (
                        <Text className="inline-block mt-1 px-2 py-0.5 bg-success/10 text-success text-body-xs rounded-badge">
                          Shortlisted
                        </Text>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="p-4 border-2 border-border">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Text className="text-body-sm font-weight-medium">Total Price</Text>
                    </div>
                  </TableCell>
                  {quotes.map((quote) => (
                    <TableCell key={quote.id} className={`p-4 border-2 border-border text-body-sm font-weight-bold ${
                      quote.total_price === lowestPrice ? 'text-success bg-success/5' : ''
                    }`}>
                      {formatCurrency(quote.total_price)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 border-2 border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Text className="text-body-sm font-weight-medium">Delivery Timeline</Text>
                    </div>
                  </TableCell>
                  {quotes.map((quote) => (
                    <TableCell key={quote.id} className="p-4 border-2 border-border text-body-sm">
                      {quote.delivery_timeline}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 border-2 border-border">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <Text className="text-body-sm font-weight-medium">Vendor Rating</Text>
                    </div>
                  </TableCell>
                  {quotes.map((quote) => (
                    <TableCell key={quote.id} className="p-4 border-2 border-border">
                      {quote.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <Text className="text-body-sm">{quote.rating.toFixed(1)}</Text>
                        </div>
                      ) : (
                        <Text className="text-body-xs text-muted-foreground">No rating</Text>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 border-2 border-border align-top">
                    <Text className="text-body-sm font-weight-medium">Proposal Summary</Text>
                  </TableCell>
                  {quotes.map((quote) => (
                    <TableCell key={quote.id} className="p-4 border-2 border-border text-body-sm align-top">
                      <Body className="line-clamp-3">{quote.proposal_summary}</Body>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 border-2 border-border align-top">
                    <Text className="text-body-sm font-weight-medium">Key Strengths</Text>
                  </TableCell>
                  {quotes.map((quote) => (
                    <TableCell key={quote.id} className="p-4 border-2 border-border align-top">
                      {quote.strengths && quote.strengths.length > 0 ? (
                        <List className="space-y-1">
                          {quote.strengths.slice(0, 3).map((strength, i) => (
                            <ListItem key={i} className="flex items-start gap-1 text-body-xs">
                              <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                              {strength}
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Text className="text-body-xs text-muted-foreground">-</Text>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 border-2 border-border">
                    <Text className="text-body-sm font-weight-medium">Actions</Text>
                  </TableCell>
                  {quotes.map((quote) => (
                    <TableCell key={quote.id} className="p-4 border-2 border-border">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/rfps/${id}/quotes/${quote.id}`}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-button text-body-xs font-weight-medium hover:bg-primary/90 transition-colors"
                        >
                          View Full
                        </Link>
                        {quote.status !== 'awarded' && (
                          <Button variant="outline" size="sm" className="border-success text-success hover:bg-success/10">
                            Award
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
