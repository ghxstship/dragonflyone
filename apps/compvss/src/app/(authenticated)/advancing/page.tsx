"use client";

/**
 * COMPVSS Production Advancing List Page
 * Displays advancing requests with tabs for filtering
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import {
  Button, Card, Grid, StatCard, DetailPage, Box} from "@ghxstship/ui";
import { AdvanceRequestsList } from "@/components/advancing/advance-requests-list";
import { useQuery } from "@tanstack/react-query";
import type { ProductionAdvance } from "@ghxstship/config/types/advancing";
import { useAuthContext, PlatformRole } from "@ghxstship/config";
import { Plus, BookOpen, FolderKanban, Users, LayoutDashboard } from "lucide-react";

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function AdvancingPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();

  const canCreateRequests = ADMIN_ROLES.some((role) => hasRole(role));

  const { data: requestsData, isLoading, error, refetch } = useQuery({
    queryKey: ["advancing-requests-stats"],
    queryFn: async () => {
      const response = await fetch("/api/advancing/requests?limit=1000");
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
  });

  const requests: ProductionAdvance[] = requestsData?.data || [];

  const stats = {
    pending: requests.filter((r) => r.status === "submitted" || r.status === "under_review").length,
    approved: requests.filter((r) => r.status === "approved" || r.status === "in_progress").length,
    fulfilled: requests.filter((r) => r.status === "fulfilled").length,
    total: requests.length,
  };

  const headerActions = (
    <Box className="flex gap-3">
      {canCreateRequests && (
        <Button
          variant="solid"
          icon={<Plus className="size-4" />}
          iconPosition="left"
          onClick={() => router.push("/advancing/new")}
        >
          Create Request
        </Button>
      )}
      <Button
        variant="outline"
        icon={<BookOpen className="size-4" />}
        iconPosition="left"
        onClick={() => router.push("/advancing/catalog")}
      >
        Browse Catalog
      </Button>
    </Box>
  );

  const tabs = [
    {
      id: "my-requests",
      label: "My Requests",
      content: (
        <>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard value={stats.pending.toString()} label="Pending" />
            <StatCard value={stats.approved.toString()} label="Approved" />
            <StatCard value={stats.fulfilled.toString()} label="Fulfilled" />
            <StatCard value={stats.total.toString()} label="Total" />
          </Grid>
          <Card className="p-4">
            <AdvanceRequestsList />
          </Card>
          <Grid cols={3} gap={4} className="grid-cols-1 sm:grid-cols-3 mt-6">
            <Button variant="outline" className="w-full" icon={<FolderKanban className="size-4" />} iconPosition="left" onClick={() => router.push("/projects")}>
              Projects
            </Button>
            <Button variant="outline" className="w-full" icon={<Users className="size-4" />} iconPosition="left" onClick={() => router.push("/vendors")}>
              Vendors
            </Button>
            <Button variant="outline" className="w-full" icon={<LayoutDashboard className="size-4" />} iconPosition="left" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          </Grid>
        </>
      ),
    },
    {
      id: "to-fulfill",
      label: "To Fulfill",
      content: (
        <>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard value={stats.pending.toString()} label="Pending" />
            <StatCard value={stats.approved.toString()} label="Approved" />
            <StatCard value={stats.fulfilled.toString()} label="Fulfilled" />
            <StatCard value={stats.total.toString()} label="Total" />
          </Grid>
          <Card className="p-4">
            <AdvanceRequestsList status="approved" />
          </Card>
        </>
      ),
    },
    {
      id: "all",
      label: "All Requests",
      content: (
        <>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard value={stats.pending.toString()} label="Pending" />
            <StatCard value={stats.approved.toString()} label="Approved" />
            <StatCard value={stats.fulfilled.toString()} label="Fulfilled" />
            <StatCard value={stats.total.toString()} label="Total" />
          </Grid>
          <Card className="p-4">
            <AdvanceRequestsList />
          </Card>
        </>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Operations",
        title: "Production Advancing",
        description: "Manage advancing requests for productions",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={headerActions}
    />
  );
}
