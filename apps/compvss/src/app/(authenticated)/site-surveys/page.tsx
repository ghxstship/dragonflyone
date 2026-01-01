"use client";

import { useRouter } from "next/navigation";
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { useSiteSurveysData, type SiteSurvey } from "@/hooks/useSiteSurveys";
import { Eye } from "lucide-react";

export default function SiteSurveysPage() {
  const router = useRouter();
  const { surveys, summary, isLoading: loading, error, refetch } = useSiteSurveysData();

  const columns = getEntityColumns<SiteSurvey>('site-surveys');
  const filters = getEntityFilters('site-surveys');

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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
