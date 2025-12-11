"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
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
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_BACKUP_PLANS,
  type DemoBackupPlan as BackupPlan,
} from "../../lib/demo-data";

const categories = ["All", "Weather", "Technical", "Staffing", "Vendor", "Venue", "Safety"];

export default function BackupPlansPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<BackupPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredPlans = categoryFilter === "All" ? DEMO_BACKUP_PLANS : DEMO_BACKUP_PLANS.filter(p => p.category === categoryFilter);
  const activePlans = DEMO_BACKUP_PLANS.filter(p => p.status === "Active").length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Weather": return "🌧️";
      case "Technical": return "⚙️";
      case "Staffing": return "👥";
      case "Vendor": return "📦";
      case "Venue": return "🏟️";
      case "Safety": return "🚨";
      default: return "📋";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Backup Plans"
        subtitle="Contingency and backup plan documentation"


        primaryAction={{ label: 'Create Plan', onClick: () => setShowCreateModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Grid cols={4} gap={6}>
              <StatCard value={DEMO_BACKUP_PLANS.length.toString()} label="Total Plans" />
              <StatCard value={activePlans.toString()} label="Active" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
              <StatCard value={DEMO_BACKUP_PLANS.filter(p => p.status === "Draft").length.toString()} label="Draft" />
            </Grid>

            {/* Filters and Actions */}
            <Stack direction="horizontal" className="justify-between">
              <Stack direction="horizontal" gap={4}>
                <Input type="search" placeholder="Search plans..." className="w-64" />
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Stack>
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Plan</Button>
            </Stack>

            {/* Plans Grid */}
            <Grid cols={2} gap={4}>
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack direction="horizontal" gap={3}>
                        <Body className="text-h5-md">{getCategoryIcon(plan.category)}</Body>
                        <Stack gap={1}>
                          <Body className="font-display text-body-md">{plan.name}</Body>
                          <Badge variant="outline">{plan.project}</Badge>
                        </Stack>
                      </Stack>
                      <Badge variant={plan.status === "Active" ? "solid" : "outline"}>{plan.status}</Badge>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm font-display">Trigger Condition</Body>
                      <Body className="text-body-sm">{plan.triggerCondition}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-body-sm">Owner: {plan.owner}</Body>
                      <Body className="text-body-sm">Updated: {plan.lastUpdated}</Body>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>View Steps</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>

            {/* Quick Links */}
            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/weather")}>Weather</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      {/* View Plan Modal */}
      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)}>
        <ModalHeader><H3>{selectedPlan?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Body className="text-h6-md">{getCategoryIcon(selectedPlan.category)}</Body>
                <Badge variant="outline">{selectedPlan.category}</Badge>
                <Badge variant={selectedPlan.status === "Active" ? "solid" : "outline"}>{selectedPlan.status}</Badge>
              </Stack>
              <Stack gap={1}>
                <Body className="font-display">Project</Body>
                <Body>{selectedPlan.project}</Body>
              </Stack>
              <Stack gap={1}>
                <Body className="font-display">Trigger Condition</Body>
                <Body>{selectedPlan.triggerCondition}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Response Steps</Body>
                <Stack gap={2}>
                  {selectedPlan.steps.map((step, idx) => (
                    <Card key={idx} className="p-3">
                      <Stack direction="horizontal" gap={3}>
                        <Badge variant="solid">{idx + 1}</Badge>
                        <Body>{step}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Body className="text-body-sm">Owner: {selectedPlan.owner}</Body>
                <Body className="text-body-sm">Updated: {selectedPlan.lastUpdated}</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPlan(null)}>Close</Button>
          <Button variant="outline">Edit Plan</Button>
          <Button variant="solid">Activate Plan</Button>
        </ModalFooter>
      </Modal>

      {/* Create Plan Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Backup Plan</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Plan Name" />
            <Grid cols={2} gap={4}>
              <Select>
                <option value="">Category...</option>
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select>
                <option value="">Project...</option>
                <option value="summer">Summer Fest 2024</option>
                <option value="corporate">Corporate Gala</option>
              </Select>
            </Grid>
            <Textarea placeholder="Trigger condition (when should this plan be activated?)..." rows={2} />
            <Textarea placeholder="Response steps (one per line)..." rows={4} />
            <Input placeholder="Plan Owner" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline">Save as Draft</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
