'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Pagination,
  EmptyState,
  LoadingSpinner,
  H3,
  Body,
  ButtonGroup,
} from '@ghxstship/ui';
import { useAdvancingRequests } from '@ghxstship/config';
import type { ProductionAdvance, AdvanceStatus } from '@ghxstship/config/types/advancing';

interface AdvanceRequestsListProps {
  projectId?: string;
  status?: AdvanceStatus;
}

export function AdvanceRequestsList({ projectId, status }: AdvanceRequestsListProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<AdvanceStatus | ''>(status || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: requestsData, isLoading } = useAdvancingRequests({
    project_id: projectId,
    status: selectedStatus || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  const requests = requestsData?.data || [];
  const totalCount = requestsData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getStatusBadgeVariant = (status: AdvanceStatus) => {
    switch (status) {
      case 'draft':
        return 'outline';
      case 'submitted':
      case 'under_review':
        return 'outline';
      case 'approved':
        return 'solid';
      case 'in_progress':
        return 'solid';
      case 'fulfilled':
        return 'solid';
      case 'rejected':
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <H3>Advance Requests</H3>
        <Body>Manage production advancing requests</Body>
      </CardHeader>

      <CardBody>
        {/* Filters */}
        <Select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value as AdvanceStatus | '');
            setCurrentPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </Select>

        {/* Requests Table */}
        {isLoading ? (
          <LoadingSpinner />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests found"
            description="No advance requests match your current filters"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Team/Activation</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Estimated Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request: ProductionAdvance) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Body>
                        {request.team_workspace || request.activation_name || '-'}
                      </Body>
                      {request.project && (
                        <Body className="text-body-sm text-ink-500">
                          {request.project.name}
                        </Body>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.submitter?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{formatDate(request.submitted_at)}</TableCell>
                    <TableCell>{formatCurrency(request.estimated_cost)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/advancing/requests/${request.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
