"use client";

import { useState } from "react";
// Layout provided by route group
import {
  ListPage,
  H3,
  Body,
  Grid,
  Stack,
  Input,
  Select,
  Button,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import {
  useRisks,
  type Risk,
} from '@/hooks/useRiskRegister';
import { Eye, AlertTriangle } from "lucide-react";

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case "Closed": return "solid";
    case "Monitoring": return "outline";
    default: return "ghost";
  }
};

export default function RiskRegisterPage() {
  const { data: risks = [], isLoading, error, refetch } = useRisks();
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeRisks = risks.filter(r => r.status !== "Closed");
  const highRisks = risks.filter(r => r.riskScore >= 12 && r.status !== "Closed").length;
  const avgRiskScore = activeRisks.length > 0 ? Math.round(activeRisks.reduce((sum, r) => sum + r.riskScore, 0) / activeRisks.length) : 0;

  const columns: ListPageColumn<Risk>[] = [
    {
      key: 'title',
      label: 'Risk',
      accessor: 'title',
      sortable: true,
      render: (_, risk) => (
        <Stack gap={1}>
          <Body className="font-display">{risk.title}</Body>
          <Body size="sm" className="text-muted-foreground">{risk.projectName}</Body>
        </Stack>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      accessor: 'category',
      sortable: true,
      render: (_, risk) => <Badge variant="outline">{risk.category}</Badge>,
    },
    {
      key: 'probability',
      label: 'P/I',
      accessor: (r) => `${r.probability}/${r.impact}`,
      render: (_, risk) => <Body size="sm">P: {risk.probability} / I: {risk.impact}</Body>,
    },
    {
      key: 'riskScore',
      label: 'Score',
      accessor: 'riskScore',
      sortable: true,
      render: (_, risk) => <Badge variant={risk.riskScore >= 12 ? "solid" : "outline"}>{risk.riskScore}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, risk) => <Badge variant={getStatusVariant(risk.status)}>{risk.status}</Badge>,
    },
    { key: 'owner', label: 'Owner', accessor: 'owner' },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'Technical', label: 'Technical' },
        { value: 'Weather', label: 'Weather' },
        { value: 'Vendor', label: 'Vendor' },
        { value: 'Safety', label: 'Safety' },
        { value: 'Financial', label: 'Financial' },
        { value: 'Operational', label: 'Operational' },
        { value: 'Regulatory', label: 'Regulatory' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Identified', label: 'Identified' },
        { value: 'Mitigating', label: 'Mitigating' },
        { value: 'Monitoring', label: 'Monitoring' },
        { value: 'Closed', label: 'Closed' },
      ],
    },
  ];

  const rowActions: ListPageAction<Risk>[] = [
    { id: 'view', label: 'Details', icon: <Eye className="h-4 w-4" />, onClick: (risk) => setSelectedRisk(risk) },
    { id: 'escalate', label: 'Escalate', icon: <AlertTriangle className="h-4 w-4" />, onClick: () => {}, hidden: (risk) => risk.riskScore >= 12 },
  ];

  const stats = [
    { label: 'Active Risks', value: activeRisks.length },
    { label: 'High Priority', value: highRisks },
    { label: 'Avg Risk Score', value: avgRiskScore },
    { label: 'Closed This Month', value: risks.filter(r => r.status === "Closed").length },
  ];

  return (
    <>
      <ListPage<Risk>
        title="Risk Register"
        subtitle="Track and manage project risks and mitigation strategies"
        data={risks}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error instanceof Error ? error : undefined}
        onRetry={refetch}
        searchPlaceholder="Search risks..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(risk) => setSelectedRisk(risk)}
        createLabel="Add Risk"
        onCreate={() => setShowAddModal(true)}
        entityType="risks"
        onExport={createExportHandler({
          filename: "risk-register",
          getData: () => risks.map((r: Risk) => ({
            title: r.title,
            category: r.category,
            probability: r.probability,
            impact: r.impact,
            riskScore: r.riskScore,
            status: r.status,
            owner: r.owner,
            projectName: r.projectName,
          })),
        })}
        stats={stats}
        emptyMessage="No risks found"
        emptyAction={{ label: 'Add Risk', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />

      <Modal open={!!selectedRisk} onClose={() => setSelectedRisk(null)}>
        <ModalHeader><H3>Risk Details</H3></ModalHeader>
        <ModalBody>
          {selectedRisk && (
            <Stack gap={4}>
              <Body className="font-display">{selectedRisk.title}</Body>
              <Body>{selectedRisk.description}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Category</Body>
                  <Badge variant="outline">{selectedRisk.category}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Status</Body>
                  <Badge variant={getStatusVariant(selectedRisk.status)}>{selectedRisk.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                <Stack gap={1}>
                  <Body size="sm" className="">Probability</Body>
                  <Body>{selectedRisk.probability}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Impact</Body>
                  <Body>{selectedRisk.impact}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Risk Score</Body>
                  <Badge variant={selectedRisk.riskScore >= 12 ? "solid" : "outline"}>{selectedRisk.riskScore}</Badge>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body size="sm" className="">Owner</Body>
                <Body>{selectedRisk.owner}</Body>
              </Stack>
              {selectedRisk.mitigationPlan && (
                <Stack gap={1}>
                  <Body size="sm" className="">Mitigation Plan</Body>
                  <Body>{selectedRisk.mitigationPlan}</Body>
                </Stack>
              )}
              {selectedRisk.contingencyPlan && (
                <Stack gap={1}>
                  <Body size="sm" className="">Contingency Plan</Body>
                  <Body>{selectedRisk.contingencyPlan}</Body>
                </Stack>
              )}
              {selectedRisk.triggers && selectedRisk.triggers.length > 0 && (
                <Stack gap={2}>
                  <Body size="sm" className="">Triggers</Body>
                  {selectedRisk.triggers.map((trigger, idx) => (
                    <Card key={idx} className="p-2">
                      <Body size="sm" className="">{trigger}</Body>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRisk(null)}>Close</Button>
          <Button variant="solid">Update Risk</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Risk</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Risk Title" />
            <Textarea placeholder="Description..." rows={2} />
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Select>
                <option value="">Category...</option>
                <option value="Technical">Technical</option>
                <option value="Weather">Weather</option>
                <option value="Vendor">Vendor</option>
                <option value="Safety">Safety</option>
                <option value="Financial">Financial</option>
                <option value="Operational">Operational</option>
                <option value="Regulatory">Regulatory</option>
              </Select>
              <Select>
                <option value="">Project...</option>
                <option value="PROJ-089">Summer Fest 2024</option>
                <option value="PROJ-090">Corporate Gala</option>
              </Select>
            </Grid>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Select>
                <option value="">Probability...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
              <Select>
                <option value="">Impact...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
            </Grid>
            <Select>
              <option value="">Owner...</option>
              <option value="john">John Martinez</option>
              <option value="sarah">Sarah Chen</option>
              <option value="mike">Mike Thompson</option>
            </Select>
            <Textarea placeholder="Mitigation Plan..." rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Risk</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
