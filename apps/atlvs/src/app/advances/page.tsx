'use client';

import { useState } from 'react';
import { useAdvanceReviewQueue } from '@/hooks/useAdvanceReview';
import Link from 'next/link';
import { Alert, Skeleton, SkeletonCard, Button, Card, H1, H2, H3, Body, Container, Stack, Grid, StatusBadge, Badge, EmptyState } from '@ghxstship/ui';

type PriorityFilter = 'high' | 'medium' | 'low' | undefined;

export default function AdvanceReviewQueuePage() {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>();
  
  const { data, isLoading, error } = useAdvanceReviewQueue({
    priority: priorityFilter,
    limit: 50,
  });

  const getPriorityStatus = (cost: number): "error" | "warning" | "success" => {
    if (cost >= 10000) return 'error';
    if (cost >= 1000) return 'warning';
    return 'success';
  };

  const getPriorityLabel = (cost: number) => {
    if (cost >= 10000) return 'High Priority';
    if (cost >= 1000) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <Container className="p-6">
      <Stack gap={6}>
        {/* Header */}
        <Stack gap={1}>
          <H1>Production Advance Review Queue</H1>
          <Body className="text-grey-600">
            Review and approve production advance requests from COMPVSS
          </Body>
        </Stack>

        {/* Priority Filter */}
        <Card className="p-4">
          <Stack direction="horizontal" gap={2}>
            <Button
              size="sm"
              variant={!priorityFilter ? 'solid' : 'ghost'}
              onClick={() => setPriorityFilter(undefined)}
            >
              All Priority
            </Button>
            <Button
              size="sm"
              variant={priorityFilter === 'high' ? 'solid' : 'ghost'}
              onClick={() => setPriorityFilter('high')}
            >
              High ($10k+)
            </Button>
            <Button
              size="sm"
              variant={priorityFilter === 'medium' ? 'solid' : 'ghost'}
              onClick={() => setPriorityFilter('medium')}
            >
              Medium ($1k-$10k)
            </Button>
            <Button
              size="sm"
              variant={priorityFilter === 'low' ? 'solid' : 'ghost'}
              onClick={() => setPriorityFilter('low')}
            >
              Low (&lt;$1k)
            </Button>
          </Stack>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="error" title="Error Loading Review Queue">
            {error.message}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Stack gap={3}>
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </Stack>
        )}

      {/* Advances List */}
      {!isLoading && data?.advances && data.advances.length > 0 ? (
        <Stack gap={3}>
          {data.advances.map((advance) => {
            const cost = advance.estimated_cost || 0;
            return (
              <Link
                key={advance.id}
                href={`/advances/${advance.id}`}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack gap={2} className="flex-1">
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <H3>
                            {advance.activation_name || advance.project?.name || 'Untitled Advance'}
                          </H3>
                          <StatusBadge status={getPriorityStatus(cost)} size="sm">
                            {getPriorityLabel(cost)}
                          </StatusBadge>
                          <Badge variant="outline" size="sm">
                            {advance.status.replace('_', ' ')}
                          </Badge>
                        </Stack>
                        
                        <Grid cols={2} gap={4}>
                          <Body size="sm" className="text-grey-600">
                            <strong>Organization:</strong>{' '}
                            {advance.organization?.name || 'N/A'}
                          </Body>
                          {advance.project && (
                            <Body size="sm" className="text-grey-600">
                              <strong>Project:</strong>{' '}
                              {advance.project.name}
                            </Body>
                          )}
                          {advance.team_workspace && (
                            <Body size="sm" className="text-grey-600">
                              <strong>Team:</strong>{' '}
                              {advance.team_workspace}
                            </Body>
                          )}
                          {advance.submitter && (
                            <Body size="sm" className="text-grey-600">
                              <strong>Submitted by:</strong>{' '}
                              {advance.submitter.full_name}
                            </Body>
                          )}
                        </Grid>
                      </Stack>

                      <Stack className="text-right ml-6">
                        <H2>
                          ${cost.toLocaleString()}
                        </H2>
                        <Body size="xs" className="mt-1 text-grey-500">
                          Estimated Cost
                        </Body>
                        {advance.items && (
                          <Body className="text-sm text-grey-600 mt-2">
                            {advance.items.length} items
                          </Body>
                        )}
                      </Stack>
                    </Stack>

                    <Stack direction="horizontal" className="justify-between items-center pt-4 border-t">
                      <Body size="xs" className="text-grey-500">
                        Submitted: {new Date(advance.submitted_at || advance.created_at).toLocaleString()}
                      </Body>
                      <Body className="text-sm text-blue-600 font-medium">
                        Review →
                      </Body>
                    </Stack>
                  </Stack>
                </Card>
              </Link>
            );
          })}
        </Stack>
      ) : !isLoading && (
        <EmptyState
          title="No advances pending review"
          description={priorityFilter ? `No ${priorityFilter} priority advances at this time` : 'All caught up!'}
        />
      )}

        {/* Results Summary */}
        {data && (
          <Body className="text-center text-sm text-grey-600">
            Showing {data.advances?.length || 0} of {data.total} advances
            {priorityFilter && ` with ${priorityFilter} priority`}
          </Body>
        )}
      </Stack>
    </Container>
  );
}
