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
  Section,
  useNotifications,
} from "@ghxstship/ui";

interface ComplianceItem {
  id: string;
  title: string;
  compliance_type: string;
  category?: string;
  provider_name?: string;
  status: string;
  effective_date: string;
  expiration_date?: string;
  coverage_amount?: number;
  annual_cost?: number;
}

interface ComplianceSummary {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
  totalAnnualCost: number;
  byType: Record<string, number>;
}

export default function CompliancePage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleViewItem = (itemId: string) => router.push(`/compliance/${itemId}`);
  const handleAddItem = () => router.push("/compliance/new");
  const handleGenerateReport = async () => {
    try {
      const response = await fetch("/api/compliance/report", { method: "POST" });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `compliance-report-${new Date().toISOString().split("T")[0]}.pdf`;
        a.click();
        addNotification({ type: "success", title: "Success", message: "Report generated" });
      } else {
        addNotification({ type: "error", title: "Error", message: "Failed to generate report" });
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to generate report" });
    }
  };
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== "all") {
        params.append("type", filterCategory);
      }
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      const response = await fetch(`/api/compliance?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch compliance items");
      }
      const data = await response.json();
      setItems(data.items || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus]);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "active":
        return "solid";
      case "expired":
      case "suspended":
        return "ghost";
      default:
        return "outline";
    }
  };

  const complianceRate = summary
    ? Math.round((summary.active / Math.max(summary.total, 1)) * 100)
    : 0;

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading compliance data..." />
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
            title="Error Loading Compliance"
            description={error}
            action={{ label: "Retry", onClick: fetchCompliance }}
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
          <H1>Compliance Tracking</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total || 0}
              label="Total Items"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.active || 0}
              label="Active"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.expiringSoon || 0}
              label="Expiring Soon"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={`${complianceRate}%`}
              label="Compliance Rate"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Categories</option>
              <option value="insurance">Insurance</option>
              <option value="license">License</option>
              <option value="certification">Certification</option>
              <option value="permit">Permit</option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </Select>
          </Stack>

          {items.length === 0 ? (
            <EmptyState
              title="No Compliance Items Found"
              description="Add your first compliance item to get started"
              action={{ label: "Add Item", onClick: handleAddItem }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="text-white">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.compliance_type}</Badge>
                    </TableCell>
                    <TableCell className="text-grey-400">{item.provider_name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {item.effective_date ? new Date(item.effective_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => handleViewItem(item.id)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={handleAddItem}>
              Add Compliance Item
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
