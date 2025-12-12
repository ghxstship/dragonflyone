'use client';


import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useApiLogs, type ApiLog } from '../../../hooks/useApiManagement';
import { useProductionContextSafe } from '@ghxstship/config';
import {
  ListPage,
  Badge,
  Stack,
  Body,
  Button,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';

const columns: ListPageColumn<ApiLog>[] = [
  { 
    key: 'created_at', 
    label: 'Timestamp', 
    accessor: 'created_at', 
    sortable: true,
    render: (value) => new Date(String(value)).toLocaleString()
  },
  { 
    key: 'method', 
    label: 'Method', 
    accessor: 'method', 
    render: (value) => {
      const methodColors: Record<string, string> = {
        GET: 'text-success',
        POST: 'text-info',
        PUT: 'text-warning',
        PATCH: 'text-warning',
        DELETE: 'text-error',
      };
      return <Body className={`font-weight-semibold ${methodColors[String(value)] || ''}`}>{String(value)}</Body>;
    }
  },
  { 
    key: 'endpoint', 
    label: 'Endpoint', 
    accessor: 'endpoint', 
    render: (value) => <Body className="max-w-xs truncate font-mono">{String(value)}</Body>
  },
  { 
    key: 'status_code', 
    label: 'Status', 
    accessor: 'status_code', 
    render: (value) => {
      const code = Number(value);
      const isSuccess = code >= 200 && code < 300;
      const isClientError = code >= 400 && code < 500;
      const isServerError = code >= 500;
      return (
        <Stack direction="horizontal" gap={2} className="items-center">
          {isSuccess && <CheckCircle className="size-4 text-success" />}
          {isClientError && <XCircle className="size-4 text-warning" />}
          {isServerError && <XCircle className="size-4 text-error" />}
          <Badge variant={isSuccess ? 'success' : isClientError ? 'warning' : 'error'}>
            {String(value)}
          </Badge>
        </Stack>
      );
    }
  },
  { 
    key: 'response_time_ms', 
    label: 'Response Time', 
    accessor: 'response_time_ms', 
    sortable: true,
    render: (value) => {
      const time = Number(value);
      const isSlow = time > 1000;
      return (
        <Stack direction="horizontal" gap={2} className="items-center">
          <Clock className={`size-4 ${isSlow ? 'text-warning' : 'text-grey-400'}`} />
          <Body className={isSlow ? 'text-warning' : ''}>{time}ms</Body>
        </Stack>
      );
    }
  },
  { 
    key: 'ip_address', 
    label: 'IP Address', 
    accessor: 'ip_address', 
    render: (value) => value || '—'
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status_code', 
    label: 'Status', 
    options: [
      { value: '200', label: '200 OK' },
      { value: '201', label: '201 Created' },
      { value: '400', label: '400 Bad Request' },
      { value: '401', label: '401 Unauthorized' },
      { value: '403', label: '403 Forbidden' },
      { value: '404', label: '404 Not Found' },
      { value: '500', label: '500 Server Error' },
    ]
  },
  { 
    key: 'method', 
    label: 'Method', 
    options: [
      { value: 'GET', label: 'GET' },
      { value: 'POST', label: 'POST' },
      { value: 'PUT', label: 'PUT' },
      { value: 'PATCH', label: 'PATCH' },
      { value: 'DELETE', label: 'DELETE' },
    ]
  },
];

export default function ApiLogsPage() {
  const router = useRouter();
  const { currentProductionId } = useProductionContextSafe();
  const productionId = currentProductionId || '';
  const { data: logs, isLoading, error, refetch } = useApiLogs({ productionId: productionId });

  const successCount = logs?.filter(l => l.status_code >= 200 && l.status_code < 300).length || 0;
  const errorCount = logs?.filter(l => l.status_code >= 400).length || 0;
  const avgResponseTime = logs && logs.length > 0 
    ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length)
    : 0;

  const pageStats = [
    { label: 'Total Requests', value: logs?.length || 0 },
    { label: 'Successful', value: successCount },
    { label: 'Errors', value: errorCount },
    { label: 'Avg Response', value: `${avgResponseTime}ms` },
  ];

  return (
    <AtlvsAppLayout>
      <Stack gap={4} className="p-4">
        <Stack direction="horizontal" gap={4} className="items-center justify-between">
          <Button
            onClick={() => router.push('/api-management')}
            className="flex w-fit items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
          >
            <ArrowLeft className="size-4" />
            Back to API Management
          </Button>
          <Stack direction="horizontal" gap={2}>
            <Button
              onClick={() => refetch()}
              className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button
              onClick={() => {}}
              className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
            >
              <Download className="size-4" />
              Export
            </Button>
          </Stack>
        </Stack>
      </Stack>
      
      <ListPage<ApiLog>
        title="API Logs"
        subtitle="View API request history and performance metrics"
        data={logs || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search logs..."
        filters={filters}
        stats={pageStats}
        emptyMessage="No API requests logged yet"
      />
    </AtlvsAppLayout>
  );
}
