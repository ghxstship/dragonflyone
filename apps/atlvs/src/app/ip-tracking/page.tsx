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

interface IntellectualProperty {
  id: string;
  title: string;
  ip_type: string;
  registration_number?: string;
  filing_date?: string;
  registration_date?: string;
  expiration_date?: string;
  jurisdiction: string;
  status: string;
  owner_entity: string;
  description?: string;
  classes?: string[];
  renewal_date?: string;
  estimated_value?: number;
}

interface IPSummary {
  total_assets: number;
  trademarks: number;
  patents: number;
  copyrights: number;
  trade_secrets: number;
  pending_applications: number;
  expiring_soon: number;
  total_value: number;
}

export default function IPTrackingPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [assets, setAssets] = useState<IntellectualProperty[]>([]);
  const [summary, setSummary] = useState<IPSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchIPAssets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await fetch(`/api/intellectual-property?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch IP assets");
      
      const data = await response.json();
      setAssets(data.assets || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  useEffect(() => {
    fetchIPAssets();
  }, [fetchIPAssets]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
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
      case "registered":
      case "active":
        return "solid";
      case "pending":
      case "filed":
        return "outline";
      case "expired":
      case "abandoned":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "trademark":
        return "™";
      case "patent":
        return "⚙";
      case "copyright":
        return "©";
      case "trade_secret":
        return "🔒";
      default:
        return "📄";
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading IP assets..." />
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
            title="Error Loading IP Assets"
            description={error}
            action={{ label: "Retry", onClick: fetchIPAssets }}
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
            <H1>Intellectual Property</H1>
            <Body className="text-grey-400">
              Track and manage trademarks, patents, copyrights, and trade secrets
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_assets || 0}
              label="Total IP Assets"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.pending_applications || 0}
              label="Pending"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.expiring_soon || 0}
              label="Expiring Soon"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.total_value || 0)}
              label="Estimated Value"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>IP Portfolio Overview</H2>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Trademarks</Body>
                    <Stack gap={1} direction="horizontal" className="items-center">
                      <Body className="text-2xl">™</Body>
                      <Body className="text-2xl font-bold">{summary?.trademarks || 0}</Body>
                    </Stack>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Patents</Body>
                    <Stack gap={1} direction="horizontal" className="items-center">
                      <Body className="text-2xl">⚙</Body>
                      <Body className="text-2xl font-bold">{summary?.patents || 0}</Body>
                    </Stack>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Copyrights</Body>
                    <Stack gap={1} direction="horizontal" className="items-center">
                      <Body className="text-2xl">©</Body>
                      <Body className="text-2xl font-bold">{summary?.copyrights || 0}</Body>
                    </Stack>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Trade Secrets</Body>
                    <Stack gap={1} direction="horizontal" className="items-center">
                      <Body className="text-2xl">🔒</Body>
                      <Body className="text-2xl font-bold">{summary?.trade_secrets || 0}</Body>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Types</option>
              <option value="trademark">Trademarks</option>
              <option value="patent">Patents</option>
              <option value="copyright">Copyrights</option>
              <option value="trade_secret">Trade Secrets</option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="pending">Pending</option>
              <option value="filed">Filed</option>
              <option value="expired">Expired</option>
            </Select>
          </Stack>

          {assets.length === 0 ? (
            <EmptyState
              title="No IP Assets Found"
              description="Register your first intellectual property asset"
              action={{ label: "Add IP Asset", onClick: () => {} }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Registration #</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Filed</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell>
                      <Stack gap={1}>
                        <Body className="text-white font-medium">{asset.title}</Body>
                        <Body className="text-grey-500 text-sm">{asset.owner_entity}</Body>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack gap={1} direction="horizontal" className="items-center">
                        <Body className="text-lg">{getTypeIcon(asset.ip_type)}</Body>
                        <Body className="text-grey-400">{asset.ip_type}</Body>
                      </Stack>
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {asset.registration_number || "—"}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {asset.jurisdiction}
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {asset.filing_date ? formatDate(asset.filing_date) : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {asset.expiration_date ? formatDate(asset.expiration_date) : "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {asset.estimated_value ? formatCurrency(asset.estimated_value) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push('/ip-tracking/new')}>
              Register New IP
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/ip-tracking/renewals')}>
              Renewal Calendar
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/ip-tracking/export')}>
              Export Portfolio
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
