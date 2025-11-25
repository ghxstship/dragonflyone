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
      case 'approved':
      case 'fulfilled':
        return 'solid';
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
        <Body>View and manage your requests</Body>
      </CardHeader>

      <CardBody>
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
        </Select>

        {isLoading ? (
          <LoadingSpinner />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests found"
            description="No advance requests match your filters"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Team/Activation</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Cost</TableHead>
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
                      <Body>{request.team_workspace || request.activation_name || '-'}</Body>
                    </TableCell>
                    <TableCell>{formatDate(request.submitted_at)}</TableCell>
                    <TableCell>{formatCurrency(request.estimated_cost)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/advancing/${request.id}`)}
                      >
                        View
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
