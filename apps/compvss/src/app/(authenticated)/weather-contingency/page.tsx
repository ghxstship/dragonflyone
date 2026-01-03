"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import {
  ListPage, H3, Body, Grid, Stack, Select, Button, Card, Badge, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import {
  useWeatherPlans,
  type WeatherPlan,
} from '@/hooks/useWeatherContingency';
import { Eye, AlertTriangle } from "lucide-react";

const getRiskBg = (risk: string): string => {
  switch (risk) {
    case "Severe": return "bg-error/10";
    case "High": return "bg-warning/10";
    case "Moderate": return "bg-info/10";
    default: return "bg-muted";
  }
};

export default function WeatherContingencyPage() {
  const router = useRouter();
  const { data: weatherPlans = [], isLoading, refetch } = useWeatherPlans();
  const [selectedPlan, setSelectedPlan] = useState<WeatherPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activePlans = weatherPlans.filter(p => p.status === "Active").length;
  const triggeredPlans = weatherPlans.filter(p => p.status === "Triggered").length;
  const highRiskCount = weatherPlans.filter(p => p.riskLevel === "High" || p.riskLevel === "Severe").length;

  const columns = getEntityColumns<WeatherPlan>('weather-contingency');
  const filters = getEntityFilters('weather-contingency');

  const rowActions: ListPageAction<WeatherPlan>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (p) => setSelectedPlan(p) },
    { id: 'trigger', label: 'Trigger', icon: <AlertTriangle className="h-4 w-4" />, onClick: () => {}, hidden: (p) => p.status === 'Triggered' },
  ];

  const stats = [
    { label: 'Active Plans', value: activePlans },
    { label: 'Triggered', value: triggeredPlans },
    { label: 'High Risk', value: highRiskCount },
    { label: 'Outdoor Events', value: weatherPlans.filter(p => p.venueType === "Outdoor").length },
  ];

  return (
    <>
      {triggeredPlans > 0 && (
        <Alert variant="warning" className="mx-4 mt-4">
          {triggeredPlans} contingency plan(s) currently triggered due to weather conditions
        </Alert>
      )}

      <ListPage<WeatherPlan>
        title="Weather Contingency Planning"
        subtitle="Monitor conditions and manage weather-related contingency plans"
        data={weatherPlans}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={refetch}
        searchPlaceholder="Search plans..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(p) => setSelectedPlan(p)}
        createLabel="Create Plan"
        onCreate={() => setShowCreateModal(true)}
        entityType="weather-contingency"
        onExport={createExportHandler({
          filename: "weather-plans",
          getData: () => weatherPlans.map((p: WeatherPlan) => ({
            projectName: p.projectName,
            venue: p.venue,
            venueType: p.venueType,
            eventDate: p.eventDate,
            riskLevel: p.riskLevel,
            status: p.status,
            currentConditions: p.currentConditions,
          })),
        })}
        stats={stats}
        emptyMessage="No weather plans found"
        emptyAction={{ label: 'Create Plan', onClick: () => setShowCreateModal(true) }}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)}>
        <ModalHeader><H3>Weather Plan Details</H3></ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <Stack gap={4}>
              <Body className="font-display">{selectedPlan.projectName}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Venue</Body><Body>{selectedPlan.venue}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Type</Body><Badge variant="outline">{selectedPlan.venueType}</Badge></Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Event Date</Body><Body>{selectedPlan.eventDate}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Risk Level</Body><Badge variant={getRiskColor(selectedPlan.riskLevel)} className={getRiskBg(selectedPlan.riskLevel)}>{selectedPlan.riskLevel}</Badge></Stack>
              </Grid>
              <Stack gap={1}><Body size="sm" className="">Current Conditions</Body><Body>{selectedPlan.currentConditions}</Body></Stack>
              <Stack gap={2}>
                <Body size="sm" className="">All Contingency Actions</Body>
                {selectedPlan.contingencyPlans.map((action) => (
                  <Card key={action.id}>
                    <Stack gap={1}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body>{action.trigger}: {action.threshold}</Body>
                        <Badge variant={getStatusVariant(action.status)}>{action.status}</Badge>
                      </Stack>
                      <Body>{action.action}</Body>
                      <Body size="sm" className="">{action.responsible}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPlan(null)}>Close</Button>
          <Button variant="solid">Trigger Plan</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Weather Plan</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select>
              <option value="">Select Project...</option>
              <option value="PROJ-089">Summer Fest 2024</option>
              <option value="PROJ-090">Corporate Gala</option>
            </Select>
            <Select>
              <option value="">Venue Type...</option>
              <option value="outdoor">Outdoor</option>
              <option value="indoor">Indoor</option>
              <option value="hybrid">Hybrid</option>
            </Select>
            <Textarea placeholder="Add contingency actions..." rows={4} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
