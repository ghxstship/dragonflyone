"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  StatCard,
  Input,
  Select,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
  Container,
  Section,
  Grid,
  Stack,
} from "@ghxstship/ui";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client?: { id: string; name: string; email: string };
  opportunity_name: string;
  title: string;
  total_amount: number;
  status: string;
  valid_until: string;
  line_items_count?: number;
  created_at: string;
}

interface QuoteSummary {
  total: number;
  by_status: Record<string, number>;
  total_value: number;
  accepted_value: number;
  conversion_rate: string | number;
  expiring_soon: number;
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [summary, setSummary] = useState<QuoteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      params.append("include_line_items", "false");

      const response = await fetch(`/api/quotes?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }
      const data = await response.json();
      setQuotes(data.quotes || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const filteredQuotes = quotes.filter((quote) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      quote.quote_number?.toLowerCase().includes(searchLower) ||
      quote.client_name?.toLowerCase().includes(searchLower) ||
      quote.client?.name?.toLowerCase().includes(searchLower) ||
      quote.opportunity_name?.toLowerCase().includes(searchLower) ||
      quote.title?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "converted":
        return "solid";
      case "sent":
      case "viewed":
        return "outline";
      default:
        return "ghost";
    }
  };

  const handleSendQuote = async (quoteId: string) => {
    try {
      const response = await fetch("/api/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_id: quoteId, action: "send" }),
      });
      if (response.ok) {
        fetchQuotes();
      }
    } catch (err) {
      console.error("Failed to send quote:", err);
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading quotes..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Quotes"
            description={error}
            action={{ label: "Retry", onClick: fetchQuotes }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Quote Management</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total || 0}
              label="Total Quotes"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.by_status?.accepted || 0}
              label="Accepted"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.total_value || 0)}
              label="Pipeline Value"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={`${summary?.conversion_rate || 0}%`}
              label="Win Rate"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Section className="flex gap-4">
            <Input
              type="search"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              className="flex-1 bg-black text-white border-grey-700 placeholder:text-grey-500"
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="negotiating">Negotiating</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="converted">Converted</option>
            </Select>
          </Section>

          {filteredQuotes.length === 0 ? (
            <EmptyState
              title="No Quotes Found"
              description={searchQuery ? "Try adjusting your search criteria" : "Create your first quote to get started"}
              action={{ label: "Create Quote", onClick: () => router.push("/quotes/new") }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="font-mono text-white">{quote.quote_number}</TableCell>
                    <TableCell className="text-white">{quote.client?.name || quote.client_name}</TableCell>
                    <TableCell className="text-grey-400">{quote.opportunity_name || quote.title}</TableCell>
                    <TableCell className="font-mono text-white">{formatCurrency(Number(quote.total_amount) || 0)}</TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(quote.status)}>{quote.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Stack gap={2} className="flex-row">
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/quotes/${quote.id}`)}>
                          View
                        </Button>
                        {quote.status === "draft" && (
                          <Button size="sm" variant="outline" onClick={() => handleSendQuote(quote.id)}>
                            Send
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Section className="flex gap-3">
            <Button variant="outlineWhite" onClick={() => router.push("/quotes/new")}>
              Create Quote
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/quotes/templates")}>
              Template Library
            </Button>
          </Section>
        </Stack>
      </Container>
    </Section>
  );
}
