"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
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
  useNotifications,
  Section,
} from "@ghxstship/ui";

interface RFP {
  id: string;
  title: string;
  description: string;
  project_type: string;
  budget_min: number;
  budget_max: number;
  status: string;
  deadline: string;
  submission_deadline: string;
  responses?: { count: number }[];
  created_by_user?: { id: string; full_name: string; email: string };
  created_at: string;
}

export default function RFPPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const handleViewRFP = (rfpId: string) => router.push(`/rfp/${rfpId}`);
  const handleCreateRFP = () => router.push("/rfp/new");
  const handleTemplateLibrary = () => router.push("/rfp/templates");
  const handlePublishRFP = async (rfpId: string) => {
    try {
      const response = await fetch(`/api/rfp/${rfpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" }),
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Success", message: "RFP published successfully" });
        fetchRFPs();
      } else {
        addNotification({ type: "error", title: "Error", message: "Failed to publish RFP" });
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to publish RFP" });
    }
  };

  const fetchRFPs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      const response = await fetch(`/api/rfp?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch RFPs");
      }
      const data = await response.json();
      setRfps(data.rfps || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchRFPs();
  }, [fetchRFPs]);

  const totalBudget = rfps.reduce((sum, r) => sum + (Number(r.budget_max) || 0), 0);
  const openCount = rfps.filter((r) => r.status === "open" || r.status === "draft").length;
  const totalResponses = rfps.reduce((sum, r) => sum + (r.responses?.[0]?.count || 0), 0);

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
      case "awarded":
      case "closed":
        return "solid";
      case "open":
      case "evaluation":
        return "outline";
      default:
        return "ghost";
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading RFPs..." />
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
            title="Error Loading RFPs"
            description={error}
            action={{ label: "Retry", onClick: fetchRFPs }}
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
          <H1>RFP Management</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={rfps.length}
              label="Total RFPs"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={openCount}
              label="Open"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(totalBudget)}
              label="Total Budget"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={totalResponses}
              label="Responses"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="evaluation">Evaluation</option>
              <option value="awarded">Awarded</option>
              <option value="closed">Closed</option>
            </Select>
          </Stack>

          {rfps.length === 0 ? (
            <EmptyState
              title="No RFPs Found"
              description="Create your first RFP to start receiving vendor responses"
              action={{ label: "Create RFP", onClick: handleCreateRFP }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Budget Range</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfps.map((rfp) => (
                  <TableRow key={rfp.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="text-white">{rfp.title}</TableCell>
                    <TableCell>
                      <Badge variant="ghost">{rfp.project_type || "General"}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {rfp.budget_min && rfp.budget_max
                        ? `${formatCurrency(rfp.budget_min)} - ${formatCurrency(rfp.budget_max)}`
                        : rfp.budget_max
                        ? formatCurrency(rfp.budget_max)
                        : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-white">{rfp.responses?.[0]?.count || 0}</TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {rfp.submission_deadline
                        ? new Date(rfp.submission_deadline).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(rfp.status)}>{rfp.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Stack gap={2} direction="horizontal">
                        <Button size="sm" variant="ghost" onClick={() => handleViewRFP(rfp.id)}>
                          View
                        </Button>
                        {rfp.status === "draft" && (
                          <Button size="sm" variant="outline" onClick={() => handlePublishRFP(rfp.id)}>
                            Publish
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
            <Button variant="outlineWhite" onClick={handleCreateRFP}>
              Create RFP
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={handleTemplateLibrary}>
              Template Library
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
