"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  StatCard,
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
  Grid,
  Stack,
  Card,
  Section,
  useNotifications,
} from "@ghxstship/ui";

interface TaxDocument {
  id: string;
  document_type: string;
  tax_year: number;
  entity_name: string;
  jurisdiction: string;
  filing_deadline: string;
  status: string;
  amount_due?: number;
  amount_paid?: number;
  filed_date?: string;
  confirmation_number?: string;
}

interface TaxSummary {
  total_documents: number;
  pending_filings: number;
  completed_filings: number;
  total_liability: number;
  total_paid: number;
  upcoming_deadlines: number;
}

export default function TaxesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState("2024");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchTaxDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", filterYear);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await fetch(`/api/taxes?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tax documents");
      
      const data = await response.json();
      setDocuments(data.documents || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterYear, filterStatus]);

  useEffect(() => {
    fetchTaxDocuments();
  }, [fetchTaxDocuments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "filed":
        return "solid";
      case "pending":
        return "outline";
      case "overdue":
        return "solid";
      default:
        return "ghost";
    }
  };

  const handleGenerateReport = async (docId: string) => {
    try {
      const response = await fetch(`/api/taxes/${docId}/report`, {
        method: "POST",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Success", message: "Tax report generated" });
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to generate report" });
    }
  };

  const handleFileTax = async (docId: string) => {
    try {
      const response = await fetch(`/api/taxes/${docId}/file`, {
        method: "POST",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Success", message: "Tax filing initiated" });
        fetchTaxDocuments();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to file taxes" });
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading tax documents..." />
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
            title="Error Loading Tax Data"
            description={error}
            action={{ label: "Retry", onClick: fetchTaxDocuments }}
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
          <Stack gap={2}>
            <H1>Tax Documentation</H1>
            <Body className="text-grey-400">
              Manage tax filings, track deadlines, and maintain compliance documentation
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_documents || 0}
              label="Total Documents"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.pending_filings || 0}
              label="Pending Filings"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.total_liability || 0)}
              label="Total Liability"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.upcoming_deadlines || 0}
              label="Upcoming Deadlines"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Tax Calendar</H2>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Q1 Estimated</Body>
                    <Body className="text-lg">Apr 15, 2024</Body>
                    <Badge variant="solid">Filed</Badge>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Q2 Estimated</Body>
                    <Body className="text-lg">Jun 15, 2024</Body>
                    <Badge variant="solid">Filed</Badge>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Q3 Estimated</Body>
                    <Body className="text-lg">Sep 15, 2024</Body>
                    <Badge variant="solid">Filed</Badge>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Q4 Estimated</Body>
                    <Body className="text-lg">Jan 15, 2025</Body>
                    <Badge variant="outline">Pending</Badge>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="2024">Tax Year 2024</option>
              <option value="2023">Tax Year 2023</option>
              <option value="2022">Tax Year 2022</option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="filed">Filed</option>
              <option value="overdue">Overdue</option>
            </Select>
          </Stack>

          {documents.length === 0 ? (
            <EmptyState
              title="No Tax Documents"
              description="No tax documents found for the selected filters"
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="text-white font-medium">
                      {doc.document_type}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {doc.entity_name}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {doc.jurisdiction}
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {formatDate(doc.filing_deadline)}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {doc.amount_due ? formatCurrency(doc.amount_due) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(doc.status)}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Stack gap={2} direction="horizontal">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleGenerateReport(doc.id)}
                        >
                          Report
                        </Button>
                        {doc.status === "pending" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleFileTax(doc.id)}
                          >
                            File
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push('/taxes/new')}>
              Add Tax Document
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/taxes/annual-report')}>
              Generate Annual Report
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
