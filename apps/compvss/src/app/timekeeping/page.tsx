"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import { useTimekeeping, useApproveTimeEntry } from "../../hooks/useTimekeeping";
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
  Container,
  Grid,
  Stack,
  Section,
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
      <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading timekeeping data..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Timekeeping</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={timeEntries?.length || 0}
              label="Total Entries"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={totalRegular}
              label="Regular Hours"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={totalOvertime}
              label="Overtime Hours"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={pendingCount}
              label="Pending Approval"
              className="bg-black text-white border-ink-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Input
              type="search"
              placeholder="Search crew or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-black text-white border-ink-700"
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-ink-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </Select>
          </Stack>

          <Table variant="bordered" className="bg-black">
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
                <TableRow key={entry.id} className="bg-black text-white hover:bg-ink-900">
                  <TableCell className="font-mono text-white">{entry.id.substring(0, 8).toUpperCase()}</TableCell>
                  <TableCell className="text-white">{entry.user?.full_name || entry.user?.email || 'Unknown'}</TableCell>
                  <TableCell className="text-ink-300">{entry.project?.name || 'Unassigned'}</TableCell>
                  <TableCell className="font-mono text-ink-400">{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-white">{entry.hours_regular}h</TableCell>
                  <TableCell className="font-mono text-white">{entry.hours_overtime}h</TableCell>
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
            <Button variant="outlineWhite" onClick={() => router.push('/timekeeping/log')}>
              Log Time
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/timekeeping/export')}>
              Export Timesheet
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
