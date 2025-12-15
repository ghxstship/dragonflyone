'use client';

/**
 * Gap 9 Remediation: Batch Operations Admin UI
 * Provides UI for managing and monitoring batch operations
 * Uses GHXSTSHIP Design System components
 */

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Button,
  Badge,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  H1,
  H3,
  Body,
  Label,
  Spinner,
  Container,
  Stack,
  Alert,
  ProgressBar,
} from '@ghxstship/ui';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BatchOperation {
  id: string;
  user_id: string;
  entity_type: string;
  operation_type: string;
  entity_ids: string[];
  parameters: Record<string, unknown> | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  total_count: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  results: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

type BadgeVariant = 'solid' | 'outline' | 'ghost' | 'success' | 'warning' | 'error' | 'info' | 'pop';

const STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'error',
  partial: 'ghost',
};

export default function BatchOperationsPage() {
  const [operations, setOperations] = useState<BatchOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<BatchOperation | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const supabase = createClient();

  const fetchOperations = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('batch_operations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setOperations(data || []);
    }

    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => {
    fetchOperations();

    const channel = supabase
      .channel('batch_operations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batch_operations' },
        () => {
          fetchOperations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOperations, supabase]);

  const cancelOperation = async (id: string) => {
    const { error: cancelError } = await supabase
      .from('batch_operations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('status', 'pending');

    if (cancelError) {
      setError(cancelError.message);
    } else {
      fetchOperations();
    }
  };

  const retryOperation = async (id: string) => {
    const { error: retryError } = await supabase
      .from('batch_operations')
      .update({ status: 'pending', failed_items: 0, error_log: [] })
      .eq('id', id)
      .eq('status', 'failed');

    if (retryError) {
      setError(retryError.message);
    } else {
      fetchOperations();
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container className="py-8">
      <Stack gap={6}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <H1>Batch Operations</H1>
            <Body className="text-ink-secondary">Monitor and manage bulk data operations</Body>
          </div>
          <Button variant="solid" onClick={fetchOperations}>
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'processing', 'completed', 'failed', 'partial'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'solid' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Operations Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : operations.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <Body className="text-ink-secondary">No batch operations found</Body>
            </div>
          </Card>
        ) : (
          <Card>
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
                  const progressPercentage = op.total_count > 0 
                    ? Math.round((op.processed_count / op.total_count) * 100) 
                    : 0;
                  return (
                    <TableRow key={op.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-weight-bold">{op.operation_type}</Body>
                          <Label className="text-ink-secondary">{op.entity_type}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANTS[op.status]} size="sm">
                          {op.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <div className="flex justify-between">
                            <Label className="text-ink-secondary">{op.processed_count}/{op.total_count}</Label>
                            <Label className="text-ink-secondary">{progressPercentage}%</Label>
                          </div>
                          <ProgressBar 
                            value={progressPercentage} 
                            variant={op.status === 'failed' ? 'error' : 'default'}
                            size="sm"
                          />
                          {op.failed_count > 0 && (
                            <Label className="text-error">{op.failed_count} failed</Label>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Label className="text-ink-secondary">{formatDate(op.created_at)}</Label>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOperation(op)}
                          >
                            Details
                          </Button>
                          {op.status === 'pending' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelOperation(op.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          {op.status === 'failed' && (
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => retryOperation(op.id)}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </Stack>

      {/* Details Modal */}
      {selectedOperation && (
        <Modal open={!!selectedOperation} onClose={() => setSelectedOperation(null)} size="lg">
          <ModalHeader>
            <H3>Operation Details</H3>
          </ModalHeader>
          
          <ModalBody>
            <Stack gap={6}>
              {(() => {
                const progressPercentage = selectedOperation.total_count > 0 
                  ? Math.round((selectedOperation.processed_count / selectedOperation.total_count) * 100) 
                  : 0;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-ink-secondary">Operation Type</Label>
                        <Body className="font-weight-bold">{selectedOperation.operation_type}</Body>
                      </div>
                      <div>
                        <Label className="text-ink-secondary">Entity Type</Label>
                        <Body className="font-weight-bold">{selectedOperation.entity_type}</Body>
                      </div>
                      <div>
                        <Label className="text-ink-secondary">Status</Label>
                        <Badge variant={STATUS_BADGE_VARIANTS[selectedOperation.status]} size="md">
                          {selectedOperation.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-ink-secondary">Items Count</Label>
                        <Body className="font-weight-bold">{selectedOperation.entity_ids.length}</Body>
                      </div>
                      <div>
                        <Label className="text-ink-secondary">Created</Label>
                        <Body>{formatDate(selectedOperation.created_at)}</Body>
                      </div>
                      <div>
                        <Label className="text-ink-secondary">Completed</Label>
                        <Body>{formatDate(selectedOperation.completed_at)}</Body>
                      </div>
                    </div>

                    <Card>
                      <div className="p-4">
                        <Label className="text-ink-secondary mb-2 block">Progress</Label>
                        <div className="flex justify-between mb-2">
                          <Body className="text-ink-secondary">Processed: {selectedOperation.processed_count}</Body>
                          <Body className="text-ink-secondary">Total: {selectedOperation.total_count}</Body>
                        </div>
                        <ProgressBar 
                          value={progressPercentage} 
                          variant={selectedOperation.status === 'failed' ? 'error' : 'default'}
                        />
                        <div className="flex justify-between mt-2">
                          <Body className="text-success">Success: {selectedOperation.success_count}</Body>
                          {selectedOperation.failed_count > 0 && (
                            <Body className="text-error">Failed: {selectedOperation.failed_count}</Body>
                          )}
                        </div>
                      </div>
                    </Card>

                    {selectedOperation.error_message && (
                      <Alert variant="error">
                        <Body className="font-weight-bold">Error</Body>
                        <Body className="text-ink-secondary">{selectedOperation.error_message}</Body>
                      </Alert>
                    )}

                    {selectedOperation.results && Object.keys(selectedOperation.results).length > 0 && (
                      <div>
                        <Label className="text-ink-secondary mb-2 block">Results</Label>
                        <Card>
                          <pre className="p-4 text-mono-sm overflow-auto max-h-40">
                            {JSON.stringify(selectedOperation.results, null, 2)}
                          </pre>
                        </Card>
                      </div>
                    )}
                  </>
                );
              })()}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedOperation(null)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Container>
  );
}
