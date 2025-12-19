"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import { CloudRain, Cog, Users, Package, Building2, AlertTriangle, ClipboardList } from "lucide-react";
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
  useBackupPlans,
  useCreateBackupPlan,
  type BackupPlan,
} from "../../hooks/useBackupPlans";

import { getSubcategoryNames } from "@ghxstship/config";

const categories = ['All', ...getSubcategoryNames('SAFE')];

export default function BackupPlansPage() {
  const router = useRouter();
  const { data: plans = [], isLoading, error, refetch } = useBackupPlans();
  const createPlanMutation = useCreateBackupPlan();
  const [selectedPlan, setSelectedPlan] = useState<BackupPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [newPlan, setNewPlan] = useState({
    name: '',
    category: '',
    project: '',
    triggerCondition: '',
    steps: '',
    owner: '',
  });

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading backup plans...</Body>
            </Stack>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container>
            <Card className="p-6 border-destructive bg-destructive/10">
              <Stack gap={4} className="items-center text-center">
                <Body className="text-destructive font-display">Failed to load backup plans</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  const handleCreatePlan = async (status: 'Active' | 'Draft') => {
    if (!newPlan.name || !newPlan.category) return;
    await createPlanMutation.mutateAsync({
      name: newPlan.name,
      category: newPlan.category as BackupPlan['category'],
      project: newPlan.project || 'General',
      triggerCondition: newPlan.triggerCondition,
      steps: newPlan.steps.split('\n').filter(s => s.trim()),
      owner: newPlan.owner,
      status,
    });
    refetch();
    setShowCreateModal(false);
    setNewPlan({ name: '', category: '', project: '', triggerCondition: '', steps: '', owner: '' });
  };

  const filteredPlans = categoryFilter === "All" ? plans : plans.filter(p => p.category === categoryFilter);
  const activePlans = plans.filter(p => p.status === "Active").length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Weather": return <CloudRain className="size-5" />;
      case "Technical": return <Cog className="size-5" />;
      case "Staffing": return <Users className="size-5" />;
      case "Vendor": return <Package className="size-5" />;
      case "Venue": return <Building2 className="size-5" />;
      case "Safety": return <AlertTriangle className="size-5" />;
      default: return <ClipboardList className="size-5" />;
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
            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard value={plans.length.toString()} label="Total Plans" />
              <StatCard value={activePlans.toString()} label="Active" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
              <StatCard value={plans.filter(p => p.status === "Draft").length.toString()} label="Draft" />
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
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
                      <Body size="sm" className=" font-display">Trigger Condition</Body>
                      <Body size="sm" className="">{plan.triggerCondition}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body size="sm" className="">Owner: {plan.owner}</Body>
                      <Body size="sm" className="">Updated: {plan.lastUpdated}</Body>
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
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
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
                <Body size="sm" className="">Owner: {selectedPlan.owner}</Body>
                <Body size="sm" className="">Updated: {selectedPlan.lastUpdated}</Body>
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
            <Input 
              placeholder="Plan Name" 
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
            />
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Select
                value={newPlan.category}
                onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value })}
              >
                <option value="">Category...</option>
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select
                value={newPlan.project}
                onChange={(e) => setNewPlan({ ...newPlan, project: e.target.value })}
              >
                <option value="">Project...</option>
                <option value="Summer Fest 2024">Summer Fest 2024</option>
                <option value="Corporate Gala">Corporate Gala</option>
              </Select>
            </Grid>
            <Textarea 
              placeholder="Trigger condition (when should this plan be activated?)..." 
              rows={2}
              value={newPlan.triggerCondition}
              onChange={(e) => setNewPlan({ ...newPlan, triggerCondition: e.target.value })}
            />
            <Textarea 
              placeholder="Response steps (one per line)..." 
              rows={4}
              value={newPlan.steps}
              onChange={(e) => setNewPlan({ ...newPlan, steps: e.target.value })}
            />
            <Input 
              placeholder="Plan Owner"
              value={newPlan.owner}
              onChange={(e) => setNewPlan({ ...newPlan, owner: e.target.value })}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline" onClick={() => handleCreatePlan('Draft')}>Save as Draft</Button>
          <Button variant="solid" onClick={() => handleCreatePlan('Active')}>Create</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
