"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface BackupPlan {
  id: string;
  name: string;
  project: string;
  category: "Weather" | "Technical" | "Staffing" | "Vendor" | "Venue" | "Safety";
  triggerCondition: string;
  status: "Active" | "Draft" | "Archived";
  lastUpdated: string;
  owner: string;
  steps: string[];
}

const mockPlans: BackupPlan[] = [
  { id: "BP-001", name: "Rain Delay Protocol", project: "Summer Fest 2024", category: "Weather", triggerCondition: "Rainfall > 0.5in/hr or lightning within 10mi", status: "Active", lastUpdated: "2024-11-20", owner: "Production Manager", steps: ["Pause outdoor activities", "Move guests to covered areas", "Notify all departments via radio", "Monitor weather radar", "Resume when conditions clear"] },
  { id: "BP-002", name: "Main PA Failure", project: "Summer Fest 2024", category: "Technical", triggerCondition: "Loss of main PA system", status: "Active", lastUpdated: "2024-11-18", owner: "Audio Lead", steps: ["Switch to backup system", "Notify FOH engineer", "Diagnose primary system", "Inform production manager", "Document incident"] },
  { id: "BP-003", name: "Key Crew No-Show", project: "Summer Fest 2024", category: "Staffing", triggerCondition: "Department head unavailable", status: "Active", lastUpdated: "2024-11-15", owner: "Operations", steps: ["Contact backup personnel", "Reassign duties if needed", "Brief replacement on responsibilities", "Update crew manifest", "Document for post-event"] },
  { id: "BP-004", name: "Vendor Equipment Delay", project: "Corporate Gala", category: "Vendor", triggerCondition: "Equipment delivery delayed > 2 hours", status: "Draft", lastUpdated: "2024-11-22", owner: "Logistics", steps: ["Contact vendor for ETA", "Identify alternative sources", "Adjust load-in schedule", "Notify affected departments", "Escalate if unresolved"] },
];

const categories = ["All", "Weather", "Technical", "Staffing", "Vendor", "Venue", "Safety"];

export default function BackupPlansPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<BackupPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredPlans = categoryFilter === "All" ? mockPlans : mockPlans.filter(p => p.category === categoryFilter);
  const activePlans = mockPlans.filter(p => p.status === "Active").length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Weather": return "bg-blue-900/30 border-blue-800";
      case "Technical": return "bg-yellow-900/30 border-yellow-800";
      case "Staffing": return "bg-green-900/30 border-green-800";
      case "Vendor": return "bg-purple-900/30 border-purple-800";
      case "Venue": return "bg-orange-900/30 border-orange-800";
      case "Safety": return "bg-red-900/30 border-red-800";
      default: return "bg-ink-800 border-ink-700";
    }
  };

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
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Backup Plans</H1>
            <Label className="text-ink-400">Contingency and backup plan documentation</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Plans" value={mockPlans.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active" value={activePlans} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length - 1} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Draft" value={mockPlans.filter(p => p.status === "Draft").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Stack direction="horizontal" gap={4}>
              <Input type="search" placeholder="Search plans..." className="border-ink-700 bg-black text-white w-64" />
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Stack>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Plan</Button>
          </Stack>

          <Grid cols={2} gap={4}>
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className={`border-2 ${getCategoryColor(plan.category)} p-6`}>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-2xl">{getCategoryIcon(plan.category)}</Label>
                      <Stack gap={1}>
                        <Body className="font-display text-white">{plan.name}</Body>
                        <Badge variant="outline">{plan.project}</Badge>
                      </Stack>
                    </Stack>
                    <Badge variant={plan.status === "Active" ? "solid" : "outline"}>{plan.status}</Badge>
                  </Stack>
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">Trigger Condition</Label>
                    <Label className="text-ink-300">{plan.triggerCondition}</Label>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Label size="xs" className="text-ink-500">Owner: {plan.owner}</Label>
                    <Label size="xs" className="text-ink-500">Updated: {plan.lastUpdated}</Label>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>View Steps</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/weather")}>Weather</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/projects")}>Projects</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)}>
        <ModalHeader><H3>{selectedPlan?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Label className="text-xl">{getCategoryIcon(selectedPlan.category)}</Label>
                <Badge variant="outline">{selectedPlan.category}</Badge>
                <Badge variant={selectedPlan.status === "Active" ? "solid" : "outline"}>{selectedPlan.status}</Badge>
              </Stack>
              <Stack gap={1}><Label className="text-ink-400">Project</Label><Label className="text-white">{selectedPlan.project}</Label></Stack>
              <Stack gap={1}><Label className="text-ink-400">Trigger Condition</Label><Body className="text-ink-300">{selectedPlan.triggerCondition}</Body></Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">Response Steps</Label>
                <Stack gap={2}>
                  {selectedPlan.steps.map((step, idx) => (
                    <Card key={idx} className="p-3 border border-ink-700">
                      <Stack direction="horizontal" gap={3}>
                        <Card className="w-8 h-8 bg-ink-800 rounded-full flex items-center justify-center">
                          <Label>{idx + 1}</Label>
                        </Card>
                        <Label className="text-ink-200">{step}</Label>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Label className="text-ink-500">Owner: {selectedPlan.owner}</Label>
                <Label className="text-ink-500">Updated: {selectedPlan.lastUpdated}</Label>
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

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Backup Plan</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Plan Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Category...</option>
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Project...</option>
                <option value="summer">Summer Fest 2024</option>
                <option value="corporate">Corporate Gala</option>
              </Select>
            </Grid>
            <Textarea placeholder="Trigger condition (when should this plan be activated?)..." rows={2} className="border-ink-700 bg-black text-white" />
            <Textarea placeholder="Response steps (one per line)..." rows={4} className="border-ink-700 bg-black text-white" />
            <Input placeholder="Plan Owner" className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline">Save as Draft</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
