'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  Container,
  H2,
  H3,
  Body,
  Label,
  Card,
  CardHeader,
  CardBody,
  Grid,
  Button,
  Badge,
  Select,
  Stack,
  Spinner,
  StatCard,
  EnterprisePageHeader,
  MainContent,
  useNotifications,
} from '@ghxstship/ui';
import { BarChart3, TrendingUp, Target, Activity, Star, Copy, Edit, Trash2 } from 'lucide-react';
import { 
  useKPILibraryData,
  useToggleKPIReportFavorite,
  useDuplicateKPIReport,
  useDeleteKPIReport,
  type KPIReport,
  type KPIDefinition
} from '@/hooks/useAnalytics';

export default function KPILibraryPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const {
    kpis,
    reports,
    isLoading: loading,
    refetchReports,
  } = useKPILibraryData();

  const toggleFavorite = useToggleKPIReportFavorite();
  const duplicateReport = useDuplicateKPIReport();
  const deleteReport = useDeleteKPIReport();

  const handleToggleFavorite = async (report: KPIReport, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite.mutateAsync(report.id);
      addNotification({
        type: 'success',
        title: report.is_favorited ? 'Removed from favorites' : 'Added to favorites',
        message: `${report.name} has been ${report.is_favorited ? 'removed from' : 'added to'} your favorites.`
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update favorite status.'
      });
    }
  };

  const handleDuplicate = async (report: KPIReport, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateReport.mutateAsync({ reportId: report.id });
      addNotification({
        type: 'success',
        title: 'Report duplicated',
        message: `A copy of "${report.name}" has been created.`
      });
      refetchReports();
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to duplicate report.'
      });
    }
  };

  const handleDelete = async (report: KPIReport, e: React.MouseEvent) => {
    e.stopPropagation();
    if (report.is_global) {
      addNotification({
        type: 'warning',
        title: 'Cannot delete',
        message: 'Global reports cannot be deleted. Duplicate it first to create your own copy.'
      });
      return;
    }
    try {
      await deleteReport.mutateAsync(report.id);
      addNotification({
        type: 'success',
        title: 'Report deleted',
        message: `"${report.name}" has been deleted.`
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete report.'
      });
    }
  };

  const handleEdit = (report: KPIReport, e: React.MouseEvent) => {
    e.stopPropagation();
    if (report.is_global && !report.is_user_copy) {
      addNotification({
        type: 'info',
        title: 'Duplicate to edit',
        message: 'Global reports cannot be edited directly. Duplicate it first to create your own editable copy.'
      });
      return;
    }
    router.push(`/analytics/kpi/reports/${report.id}/edit`);
  };

  const categories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'FINANCIAL_PERFORMANCE', label: 'Financial Performance' },
    { value: 'TICKET_ATTENDANCE', label: 'Ticket & Attendance' },
    { value: 'OPERATIONAL_EFFICIENCY', label: 'Operational Efficiency' },
    { value: 'MARKETING_ENGAGEMENT', label: 'Marketing & Engagement' },
    { value: 'CUSTOMER_EXPERIENCE', label: 'Customer Experience' }
  ];

  const filteredKPIs = selectedCategory === 'ALL' 
    ? kpis 
    : kpis.filter((kpi: KPIDefinition) => kpi.category === selectedCategory);

  const getUnitDisplay = (unit: string) => {
    switch (unit) {
      case 'CURRENCY': return '$';
      case 'PERCENTAGE': return '%';
      case 'COUNT': return '#';
      case 'DAYS': return 'days';
      case 'HOURS': return 'hrs';
      case 'MINUTES': return 'min';
      case 'RATIO': return 'x';
      case 'SCORE': return 'pts';
      default: return unit;
    }
  };

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'HIGHER_IS_BETTER':
        return <Badge variant="solid" inverted>↑ Higher is Better</Badge>;
      case 'LOWER_IS_BETTER':
        return <Badge variant="outline" inverted>↓ Lower is Better</Badge>;
      case 'TARGET_RANGE':
        return <Badge variant="solid" inverted>⊙ Target Range</Badge>;
      default:
        return <Badge variant="ghost" inverted>ℹ Informational</Badge>;
    }
  };

  const getCategoryStats = () => {
    const financial = kpis.filter((k: KPIDefinition) => k.category === 'FINANCIAL_PERFORMANCE').length;
    const ticket = kpis.filter((k: KPIDefinition) => k.category === 'TICKET_ATTENDANCE').length;
    const operational = kpis.filter((k: KPIDefinition) => k.category === 'OPERATIONAL_EFFICIENCY').length;
    const marketing = kpis.filter((k: KPIDefinition) => k.category === 'MARKETING_ENGAGEMENT').length;
    const customer = kpis.filter((k: KPIDefinition) => k.category === 'CUSTOMER_EXPERIENCE').length;
    return { financial, ticket, operational, marketing, customer };
  };

  if (loading) {
    return (
      <AtlvsAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Spinner variant="grey" size="lg" text="Loading KPI definitions..." />
          </Container>
        </MainContent>
      </AtlvsAppLayout>
    );
  }

  const categoryStats = getCategoryStats();

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="KPI Master Library"
        subtitle="Complete reference library of 200 preconfigured KPI metrics for analytics and insights"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard
                value={kpis.length.toString()}
                label="Total KPIs"
                icon={<BarChart3 className="size-6" />}
                inverted
              />
              <StatCard
                value={categoryStats.financial.toString()}
                label="Financial KPIs"
                icon={<TrendingUp className="size-6" />}
                inverted
              />
              <StatCard
                value={categoryStats.operational.toString()}
                label="Operational KPIs"
                icon={<Activity className="size-6" />}
                inverted
              />
              <StatCard
                value={reports.length.toString()}
                label="Preconfigured Reports"
                icon={<Target className="size-6" />}
                inverted
              />
            </Grid>

            {/* Preconfigured Reports */}
            <Stack gap={6}>
              <H2 className="text-white">PRECONFIGURED REPORTS</H2>
              <Grid cols={3} gap={6}>
                {reports.map((report: KPIReport) => (
                  <Card
                    key={report.id}
                    variant="default"
                    inverted
                    className={selectedReport === report.id ? 'ring-2 ring-primary' : ''}
                    onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                  >
                    <CardHeader inverted>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <H3 className="text-white">{report.name}</H3>
                        <Stack direction="horizontal" gap={1}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleToggleFavorite(report, e)}
                            className={report.is_favorited ? 'text-accent' : 'text-on-dark-muted'}
                          >
                            <Star className={`size-4 ${report.is_favorited ? 'fill-current' : ''}`} />
                          </Button>
                        </Stack>
                      </Stack>
                    </CardHeader>
                    <CardBody inverted>
                      <Stack gap={3}>
                        <Body className="text-on-dark-secondary">{report.description}</Body>
                        <Stack direction="horizontal" gap={2} className="items-center justify-between">
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant="outline" inverted>{report.kpi_codes.length} KPIs</Badge>
                            {report.is_global && <Badge variant="solid" inverted>Global</Badge>}
                            {report.is_user_copy && <Badge variant="info" inverted>My Copy</Badge>}
                          </Stack>
                          <Stack direction="horizontal" gap={1}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDuplicate(report, e)}
                              title="Duplicate report"
                            >
                              <Copy className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleEdit(report, e)}
                              title={report.is_global ? 'Duplicate to edit' : 'Edit report'}
                            >
                              <Edit className="size-4" />
                            </Button>
                            {!report.is_global && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(report, e)}
                                title="Delete report"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </Stack>

            {/* Category Filter */}
            <Card variant="default" inverted>
              <CardBody inverted>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Label className="text-white">FILTER BY CATEGORY:</Label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                  <Body className="text-on-dark-secondary">
                    Showing {filteredKPIs.length} of {kpis.length} KPIs
                  </Body>
                </Stack>
              </CardBody>
            </Card>

            {/* KPI Grid */}
            <Stack gap={4}>
              {filteredKPIs.map((kpi: KPIDefinition) => (
                <Card key={kpi.id} variant="default" inverted>
                  <CardBody inverted>
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack className="flex-1" gap={3}>
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <H3 className="text-white">{kpi.name}</H3>
                          <Badge variant="outline" inverted>{kpi.code}</Badge>
                          {getDirectionBadge(kpi.targetDirection)}
                        </Stack>
                        <Body className="text-on-dark-secondary">{kpi.description}</Body>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Label size="xs" className="text-on-dark-disabled">
                            Unit: {getUnitDisplay(kpi.unit)}
                          </Label>
                          <Label size="xs" className="text-on-dark-disabled">
                            Update: {kpi.updateFrequency.replace(/_/g, ' ')}
                          </Label>
                          <Label size="xs" className="text-on-dark-disabled">
                            Subcategory: {kpi.subcategory.replace(/_/g, ' ')}
                          </Label>
                        </Stack>
                        {(kpi.targetValue || kpi.warningThreshold) && (
                          <Stack direction="horizontal" gap={4} className="border-t border-white/20 pt-3">
                            {kpi.targetValue && (
                              <Label size="xs" className="text-on-dark-secondary">
                                Target: {kpi.targetValue}{getUnitDisplay(kpi.unit)}
                              </Label>
                            )}
                            {kpi.warningThreshold && (
                              <Label size="xs" className="text-accent">
                                Warning: {kpi.warningThreshold}{getUnitDisplay(kpi.unit)}
                              </Label>
                            )}
                            {kpi.criticalThreshold && (
                              <Label size="xs" className="text-destructive">
                                Critical: {kpi.criticalThreshold}{getUnitDisplay(kpi.unit)}
                              </Label>
                            )}
                          </Stack>
                        )}
                      </Stack>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/analytics/kpi/${kpi.code}`)}
                      >
                        VIEW DATA
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </Stack>

            {filteredKPIs.length === 0 && (
              <Card variant="default" inverted className="p-12 text-center">
                <Body className="text-on-dark-disabled">
                  No KPIs found for the selected category.
                </Body>
              </Card>
            )}

            {/* Category Summary Stats */}
            <Stack gap={6}>
              <H2 className="text-white">CATEGORY BREAKDOWN</H2>
              <Grid cols={4} gap={4}>
                <Card variant="default" inverted>
                  <CardBody inverted>
                    <H3 className="text-success">{categoryStats.financial || 45}</H3>
                    <Label size="xs" className="text-on-dark-secondary">Financial KPIs</Label>
                  </CardBody>
                </Card>
                <Card variant="default" inverted>
                  <CardBody inverted>
                    <H3 className="text-info">{categoryStats.ticket || 45}</H3>
                    <Label size="xs" className="text-on-dark-secondary">Ticket & Attendance</Label>
                  </CardBody>
                </Card>
                <Card variant="default" inverted>
                  <CardBody inverted>
                    <H3 className="text-secondary">{categoryStats.operational || 55}</H3>
                    <Label size="xs" className="text-on-dark-secondary">Operational</Label>
                  </CardBody>
                </Card>
                <Card variant="default" inverted>
                  <CardBody inverted>
                    <H3 className="text-accent">{categoryStats.marketing || 30}</H3>
                    <Label size="xs" className="text-on-dark-secondary">Marketing</Label>
                  </CardBody>
                </Card>
                <Card variant="default" inverted>
                  <CardBody inverted>
                    <H3 className="text-primary">{categoryStats.customer || 25}</H3>
                    <Label size="xs" className="text-on-dark-secondary">Customer Experience</Label>
                  </CardBody>
                </Card>
              </Grid>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
