"use client";

/**
 * Batch Operations Admin UI
 * Provides UI for managing and monitoring batch operations
 * Uses DetailPage template for consistent layout
 * 
 * RBAC: Requires ATLVS_ADMIN or LEGEND role
 */

import { useState, useCallback } from "react";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge, Body, Button, Card, Grid, Modal, ProgressBar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DetailPage, Section, SectionHeader, StatCard, Stack, Box} from "@ghxstship/ui";
import {
  useBatchOperationsQuery,
  useCancelBatchOperation,
  useRetryBatchOperation,
  type BatchOperation,
} from "@/hooks/useBatchOperationsQuery";
import { RefreshCw, AlertTriangle, CheckCircle, Clock, XCircle, Layers } from "lucide-react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "outline";

const STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  pending: "warning",
  processing: "info",
  completed: "success",
  failed: "error",
  partial: "warning",
  cancelled: "outline",
};

export default function BatchOperationsPage() {
  const { user, hasRole } = useAuthContext();
  const [selectedOperation, setSelectedOperation] = useState<BatchOperation | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const hasAdminAccess = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const {
    data: operations = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useBatchOperationsQuery({ status: filter });

  const cancelMutation = useCancelBatchOperation();
  const retryMutation = useRetryBatchOperation();

  const error = queryError?.message || cancelMutation.error?.message || retryMutation.error?.message || null;

  // Extract inline functions to useCallback for better performance with memoized children
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCloseModal = useCallback(() => {
    setSelectedOperation(null);
  }, []);

  const handleFilterChange = useCallback((status: string) => {
    setFilter(status);
  }, []);

  const handleViewOperation = useCallback((operation: BatchOperation) => {
    setSelectedOperation(operation);
  }, []);

  const cancelOperation = (id: string) => {
    cancelMutation.mutate(id);
  };

  const retryOperation = (id: string) => {
    retryMutation.mutate(id);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  // Stats
  const pendingCount = operations.filter((op) => op.status === "pending").length;
  const processingCount = operations.filter((op) => op.status === "processing").length;
  const completedCount = operations.filter((op) => op.status === "completed").length;
  const failedCount = operations.filter((op) => op.status === "failed").length;

  const headerActions = (
    <Button variant="solid" onClick={handleRefresh} icon={<RefreshCw className="size-4" />} iconPosition="left">
      Refresh
    </Button>
  );

  // RBAC: If user doesn't have admin access, show restricted state
  if (!hasAdminAccess) {
    return (
      <DetailPage
        header={{
          kicker: "Admin",
          title: "Batch Operations",
          description: "Monitor and manage bulk data operations",
        }}
        restricted
        restrictedMessage={`You do not have permission to access batch operations. This page requires ATLVS Admin or Legend role. Current user: ${user?.email || "Unknown"}`}
        backButton={{ label: "Dashboard", href: "/dashboard" }}
      />
    );
  }

  const tabs = [
    {
      id: "operations",
      label: "Operations",
      icon: <Layers className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Pending" value={pendingCount.toString()} icon={<Clock className="size-5" />} />
            <StatCard label="Processing" value={processingCount.toString()} icon={<RefreshCw className="size-5" />} />
            <StatCard label="Completed" value={completedCount.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Failed" value={failedCount.toString()} icon={<XCircle className="size-5" />} />
          </Grid>

          <SectionHeader title="Filter by Status" />
          <Stack direction="horizontal" className="flex-wrap gap-2 mb-6">
            {["all", "pending", "processing", "completed", "failed", "partial"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "solid" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </Stack>

          {operations.length === 0 ? (
            <Box className="text-center py-12">
              <Layers className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No batch operations found</Body>
            </Box>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((op) => {
                    const progressPercentage = op.total_count > 0 ? Math.round((op.processed_count / op.total_count) * 100) : 0;
                    return (
                      <TableRow key={op.id}>
                        <TableCell>
                          <Box>
                            <Body className="font-weight-medium">{op.operation_type}</Body>
                            <Body size="sm" className="text-text-muted">{op.entity_type}</Body>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGE_VARIANTS[op.status]}>{op.status.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Stack gap={1}>
                            <Stack direction="horizontal" className="justify-between">
                              <Body size="sm" className="text-text-muted">{op.processed_count}/{op.total_count}</Body>
                              <Body size="sm" className="text-text-muted">{progressPercentage}%</Body>
                            </Stack>
                            <ProgressBar value={progressPercentage} variant={op.status === "failed" ? "error" : "default"} size="sm" />
                            {op.failed_count > 0 && <Body size="sm" className="text-error">{op.failed_count} failed</Body>}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Body size="sm" className="text-text-muted">{formatDate(op.created_at)}</Body>
                        </TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Button variant="ghost" size="sm" onClick={() => handleViewOperation(op)}>Details</Button>
                            {op.status === "pending" && (
                              <Button variant="outline" size="sm" onClick={() => cancelOperation(op.id)}>Cancel</Button>
                            )}
                            {op.status === "failed" && (
                              <Button variant="solid" size="sm" onClick={() => retryOperation(op.id)}>Retry</Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Admin",
          title: "Batch Operations",
          description: "Monitor and manage bulk data operations",
        }}
        loading={loading}
        error={error ? new Error(error) : null}
        onRetry={refetch}
        tabs={tabs}
        actions={headerActions}
        backButton={{ label: "Admin", href: "/admin" }}
      />

      <Modal open={!!selectedOperation} onClose={() => setSelectedOperation(null)} title="Operation Details">
        {selectedOperation && (() => {
          const progressPercentage = selectedOperation.total_count > 0 ? Math.round((selectedOperation.processed_count / selectedOperation.total_count) * 100) : 0;
          return (
            <Stack gap={6}>
              <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
                <Box>
                  <Body size="sm" className="text-text-muted">Operation Type</Body>
                  <Body className="font-weight-medium">{selectedOperation.operation_type}</Body>
                </Box>
                <Box>
                  <Body size="sm" className="text-text-muted">Entity Type</Body>
                  <Body className="font-weight-medium">{selectedOperation.entity_type}</Body>
                </Box>
                <Box>
                  <Body size="sm" className="text-text-muted">Status</Body>
                  <Badge variant={STATUS_BADGE_VARIANTS[selectedOperation.status]}>{selectedOperation.status.toUpperCase()}</Badge>
                </Box>
                <Box>
                  <Body size="sm" className="text-text-muted">Items Count</Body>
                  <Body className="font-weight-medium">{selectedOperation.entity_ids.length}</Body>
                </Box>
                <Box>
                  <Body size="sm" className="text-text-muted">Created</Body>
                  <Body>{formatDate(selectedOperation.created_at)}</Body>
                </Box>
                <Box>
                  <Body size="sm" className="text-text-muted">Completed</Body>
                  <Body>{formatDate(selectedOperation.completed_at)}</Body>
                </Box>
              </Grid>

              <Card className="p-4">
                <Body size="sm" className="text-text-muted mb-2">Progress</Body>
                <Stack direction="horizontal" className="justify-between mb-2">
                  <Body size="sm" className="text-text-muted">Processed: {selectedOperation.processed_count}</Body>
                  <Body size="sm" className="text-text-muted">Total: {selectedOperation.total_count}</Body>
                </Stack>
                <ProgressBar value={progressPercentage} variant={selectedOperation.status === "failed" ? "error" : "default"} />
                <Stack direction="horizontal" className="justify-between mt-2">
                  <Body size="sm" className="text-success">Success: {selectedOperation.success_count}</Body>
                  {selectedOperation.failed_count > 0 && <Body size="sm" className="text-error">Failed: {selectedOperation.failed_count}</Body>}
                </Stack>
              </Card>

              {selectedOperation.error_message && (
                <Card className="p-4 bg-error-900 border-error-500">
                  <Stack direction="horizontal" gap={2} className="items-start">
                    <AlertTriangle className="size-5 text-error flex-shrink-0" />
                    <Box>
                      <Body className="font-weight-medium text-error-100">Error</Body>
                      <Body size="sm" className="text-error-200">{selectedOperation.error_message}</Body>
                    </Box>
                  </Stack>
                </Card>
              )}

              {selectedOperation.results && Object.keys(selectedOperation.results).length > 0 && (
                <Box>
                  <Body size="sm" className="text-text-muted mb-2">Results</Body>
                  <Card className="p-4">
                    <pre className="font-mono text-body-sm overflow-auto max-h-40">{JSON.stringify(selectedOperation.results, null, 2)}</pre>
                  </Card>
                </Box>
              )}

              <Button variant="outline" onClick={handleCloseModal}>Close</Button>
            </Stack>
          );
        })()}
      </Modal>
    </>
  );
}
