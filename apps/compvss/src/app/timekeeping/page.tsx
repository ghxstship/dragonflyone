"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import { useTimekeeping, useApproveTimeEntry } from "../../hooks/useTimekeeping";
import {
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
  Container,
  Grid,
  Stack,
  Body,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

export default function TimekeepingPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: timeEntries, isLoading } = useTimekeeping({ status: filterStatus });
  const approveEntry = useApproveTimeEntry();

  const filteredEntries = (timeEntries || []).filter(entry => {
    const matchesSearch = entry.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalRegular = filteredEntries.reduce((sum: number, e) => sum + e.hours_regular, 0);
  const totalOvertime = filteredEntries.reduce((sum: number, e) => sum + e.hours_overtime, 0);
  const pendingCount = (timeEntries || []).filter(e => e.status === "pending").length;

  const handleApprove = async (id: string) => {
    try {
      await approveEntry.mutateAsync(id);
    } catch (error) {
      console.error('Failed to approve time entry:', error);
    }
  };

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <EnterprisePageHeader
          title="Timekeeping"
          subtitle="Track crew hours, overtime, and timesheet approvals"
          breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Timekeeping' }]}
          views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
          activeView="default"
          showFavorite
          showSettings
        />
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading timekeeping data..." />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Timekeeping"
        subtitle="Track crew hours, overtime, and timesheet approvals"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Timekeeping' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'Log Time', onClick: () => router.push('/timekeeping/log') }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard
                value={(timeEntries?.length || 0).toString()}
                label="Total Entries"
              />
              <StatCard
                value={totalRegular.toString()}
                label="Regular Hours"
              />
              <StatCard
                value={totalOvertime.toString()}
                label="Overtime Hours"
              />
              <StatCard
                value={pendingCount.toString()}
                label="Pending Approval"
              />
            </Grid>

            <Stack gap={4} direction="horizontal">
              <Input
                type="search"
                placeholder="Search crew or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </Select>
            </Stack>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Crew Member</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Regular</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell><Body className="font-mono">{entry.id.substring(0, 8).toUpperCase()}</Body></TableCell>
                    <TableCell><Body>{entry.user?.full_name || entry.user?.email || 'Unknown'}</Body></TableCell>
                    <TableCell><Body className="text-body-sm">{entry.project?.name || 'Unassigned'}</Body></TableCell>
                    <TableCell><Body className="font-mono text-body-sm">{new Date(entry.date).toLocaleDateString()}</Body></TableCell>
                    <TableCell><Body className="font-mono">{entry.hours_regular}h</Body></TableCell>
                    <TableCell><Body className="font-mono">{entry.hours_overtime}h</Body></TableCell>
                    <TableCell>
                      <Badge variant={entry.status === "approved" ? "solid" : "outline"}>{entry.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {entry.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(entry.id)}
                          disabled={approveEntry.isPending}
                        >
                          {approveEntry.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Stack gap={3} direction="horizontal">
              <Button variant="solid" onClick={() => router.push('/timekeeping/log')}>
                Log Time
              </Button>
              <Button variant="outline" onClick={() => router.push('/timekeeping/export')}>
                Export Timesheet
              </Button>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
