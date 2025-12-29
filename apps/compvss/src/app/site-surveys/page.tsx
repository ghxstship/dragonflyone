"use client";

import { useRouter } from "next/navigation";
// Layout provided by route group
import {
  ListPage,
  Badge,
  Stack,
  Body,
  Text,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import { useSiteSurveysData, type SiteSurvey } from "@/hooks/useSiteSurveys";
import { Eye } from "lucide-react";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "approved":
      return "solid";
    case "scheduled":
    case "in_progress":
      return "outline";
    default:
      return "ghost";
  }
};

export default function SiteSurveysPage() {
  const router = useRouter();
  const { surveys, summary, isLoading: loading, error, refetch } = useSiteSurveysData();

  const columns: ListPageColumn<SiteSurvey>[] = [
    {
      key: 'survey_number',
      label: 'Survey #',
      accessor: 'survey_number',
      sortable: true,
      render: (_, s) => <Text className="font-mono">{s.survey_number}</Text>,
    },
    {
      key: 'venue_name',
      label: 'Venue',
      accessor: 'venue_name',
      sortable: true,
      render: (_, s) => (
        <Stack gap={1}>
          <Body>{s.venue_name}</Body>
          <Body size="sm" className="text-muted-foreground">{s.venue_address}</Body>
        </Stack>
      ),
    },
    { key: 'project_name', label: 'Project', accessor: 'project_name', sortable: true },
    {
      key: 'survey_date',
      label: 'Date',
      accessor: 'survey_date',
      sortable: true,
      render: (_, s) => <Text className="font-mono">{formatDate(s.survey_date)}</Text>,
    },
    { key: 'surveyor_name', label: 'Surveyor', accessor: 'surveyor_name' },
    { key: 'power_assessment', label: 'Power', accessor: (s) => s.power_assessment || '—' },
    { key: 'rigging_assessment', label: 'Rigging', accessor: (s) => s.rigging_assessment || '—' },
    { key: 'load_in_assessment', label: 'Load-In', accessor: (s) => s.load_in_assessment || '—' },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, s) => <Badge variant={getStatusVariant(s.status)}>{s.status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'approved', label: 'Approved' },
      ],
    },
    {
      key: 'survey_type',
      label: 'Type',
      options: [
        { value: 'initial', label: 'Initial Survey' },
        { value: 'technical', label: 'Technical Advance' },
        { value: 'follow_up', label: 'Follow-up' },
        { value: 'final_walk', label: 'Final Walk' },
      ],
    },
  ];

  const rowActions: ListPageAction<SiteSurvey>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (s) => router.push(`/site-surveys/${s.id}`) },
  ];

  const stats = [
    { label: 'Total Surveys', value: summary?.total_surveys || 0 },
    { label: 'Pending', value: summary?.pending_surveys || 0 },
    { label: 'Venues Surveyed', value: summary?.venues_surveyed || 0 },
    { label: 'Photos Captured', value: summary?.photos_captured || 0 },
  ];

  return (
    <ListPage<SiteSurvey>
      title="Site Surveys"
      subtitle="Venue assessments, technical specifications, and site documentation"
      data={surveys}
      columns={columns}
      rowKey="id"
      loading={loading}
      error={error instanceof Error ? error : undefined}
      onRetry={refetch}
      searchPlaceholder="Search surveys..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(s) => router.push(`/site-surveys/${s.id}`)}
      createLabel="Schedule Survey"
      onCreate={() => router.push('/site-surveys/schedule')}
      entityType="site-surveys"
      onExport={createExportHandler({
        filename: "site-surveys",
        getData: () => surveys.map((s: SiteSurvey) => ({
          survey_number: s.survey_number,
          venue_name: s.venue_name,
          venue_address: s.venue_address,
          project_name: s.project_name,
          survey_date: s.survey_date,
          surveyor_name: s.surveyor_name,
          power_assessment: s.power_assessment || '',
          rigging_assessment: s.rigging_assessment || '',
          load_in_assessment: s.load_in_assessment || '',
          status: s.status,
        })),
      })}
      stats={stats}
      emptyMessage="No site surveys found"
      emptyAction={{ label: 'Schedule Survey', onClick: () => router.push('/site-surveys/schedule') }}
      showFavorite
      showSettings
    />
  );
}
