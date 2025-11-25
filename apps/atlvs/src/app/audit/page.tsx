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
  Grid,
  Stack,
  useNotifications,
  Section,
} from "@ghxstship/ui";

interface AuditLog {
  id: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  user?: { id: string; email: string; full_name: string };
  action: string;
  resource_type: string;
  resource_id: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

interface AuditSummary {
  total: number;
  today: number;
  active_users: number;
  failed_attempts: number;
  by_action: Record<string, number>;
}

const actionTypes = ["all", "login", "create", "update", "delete", "download", "view"];

export default function AuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterAction !== "all") {
        params.append("action", filterAction);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/kpi/audit-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }
      const data = await response.json();
      setLogs(data.logs || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterAction, searchQuery]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.user_email?.toLowerCase().includes(searchLower) ||
      log.user?.email?.toLowerCase().includes(searchLower) ||
      log.resource_id?.toLowerCase().includes(searchLower) ||
      log.details?.toLowerCase().includes(searchLower)
    );
  });

  const getActionVariant = (action: string): "solid" | "outline" | "ghost" => {
    switch (action?.toLowerCase()) {
      case "delete":
        return "solid";
      case "create":
      case "update":
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
          <LoadingSpinner size="lg" text="Loading audit logs..." />
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
            title="Error Loading Audit Logs"
            description={error}
            action={{ label: "Retry", onClick: fetchAuditLogs }}
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
          <H1>Audit Trail</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total || logs.length}
              label="Total Events"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.today || 0}
              label="Today"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.active_users || 0}
              label="Active Users"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.failed_attempts || 0}
              label="Failed Attempts"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Input
              type="search"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              className="flex-1 bg-black text-white border-grey-700 placeholder:text-grey-500"
            />
            <Select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Actions</option>
              {actionTypes.filter(a => a !== "all").map(action => (
                <option key={action} value={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</option>
              ))}
            </Select>
          </Stack>

          {filteredLogs.length === 0 ? (
            <EmptyState
              title="No Audit Logs Found"
              description={searchQuery ? "Try adjusting your search criteria" : "No activity recorded yet"}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="font-mono text-grey-400">
                      {log.timestamp || new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-white">
                      {log.user?.email || log.user_email || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {log.resource_type}/{log.resource_id}
                    </TableCell>
                    <TableCell className="text-grey-400">{log.details || "—"}</TableCell>
                    <TableCell className="font-mono text-grey-400">{log.ip_address || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/audit/export")}>
              Export Logs
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => setShowDateFilter(!showDateFilter)}>
              Filter by Date
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
