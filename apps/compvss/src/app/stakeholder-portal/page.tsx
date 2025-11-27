"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface Stakeholder {
  id: string;
  name: string;
  organization: string;
  role: "Client" | "Sponsor" | "Vendor" | "Partner";
  accessLevel: "Full" | "Limited" | "View Only";
  lastLogin?: string;
  status: "Active" | "Pending" | "Inactive";
}

interface Update {
  id: string;
  projectName: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  type: "Status" | "Milestone" | "Alert" | "Document";
}

const mockStakeholders: Stakeholder[] = [
  { id: "STK-001", name: "John Client", organization: "Festival Productions", role: "Client", accessLevel: "Full", lastLogin: "2024-11-25 09:30", status: "Active" },
  { id: "STK-002", name: "Sarah Sponsor", organization: "Brand Corp", role: "Sponsor", accessLevel: "Limited", lastLogin: "2024-11-24 14:15", status: "Active" },
  { id: "STK-003", name: "Mike Vendor", organization: "Audio House", role: "Vendor", accessLevel: "View Only", lastLogin: "2024-11-23 11:00", status: "Active" },
  { id: "STK-004", name: "Emily Partner", organization: "Venue Group", role: "Partner", accessLevel: "Limited", status: "Pending" },
];

const mockUpdates: Update[] = [
  { id: "UPD-001", projectName: "Summer Fest 2024", title: "Stage Build Complete", content: "Main stage construction finished ahead of schedule. Ready for equipment load-in.", author: "Production Manager", timestamp: "2024-11-25 10:00", type: "Milestone" },
  { id: "UPD-002", projectName: "Summer Fest 2024", title: "Weather Advisory", content: "Monitoring potential rain for load-in day. Contingency plans activated.", author: "Operations", timestamp: "2024-11-25 08:30", type: "Alert" },
  { id: "UPD-003", projectName: "Corporate Gala", title: "Budget Update", content: "Q4 budget revision approved. Updated documents available in portal.", author: "Finance", timestamp: "2024-11-24 16:00", type: "Document" },
];

export default function StakeholderPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("updates");
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const activeStakeholders = mockStakeholders.filter(s => s.status === "Active").length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Client": return "bg-info-900/30 border-info-800";
      case "Sponsor": return "bg-purple-900/30 border-purple-800";
      case "Vendor": return "bg-success-900/30 border-success-800";
      case "Partner": return "bg-warning-900/30 border-warning-800";
      default: return "bg-ink-800 border-ink-700";
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "Status": return "📊";
      case "Milestone": return "🎯";
      case "Alert": return "⚠️";
      case "Document": return "📄";
      default: return "📋";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Stakeholder Portal</H1>
            <Label className="text-ink-400">Role-based communication portal for project stakeholders</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Stakeholders" value={mockStakeholders.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active" value={activeStakeholders} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Updates Today" value={mockUpdates.filter(u => u.timestamp.includes("2024-11-25")).length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Invites" value={mockStakeholders.filter(s => s.status === "Pending").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "updates"} onClick={() => setActiveTab("updates")}>Updates</Tab>
                <Tab active={activeTab === "stakeholders"} onClick={() => setActiveTab("stakeholders")}>Stakeholders</Tab>
                <Tab active={activeTab === "documents"} onClick={() => setActiveTab("documents")}>Documents</Tab>
              </TabsList>
            </Tabs>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" className="border-ink-700">Post Update</Button>
              <Button variant="outlineWhite" onClick={() => setShowInviteModal(true)}>Invite Stakeholder</Button>
            </Stack>
          </Stack>

          <TabPanel active={activeTab === "updates"}>
            <Stack gap={4}>
              {mockUpdates.map((update) => (
                <Card key={update.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack direction="horizontal" gap={3}>
                        <Label className="text-2xl">{getUpdateIcon(update.type)}</Label>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{update.title}</Body>
                          <Badge variant="outline">{update.projectName}</Badge>
                        </Stack>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Badge variant="outline">{update.type}</Badge>
                        <Label size="xs" className="text-ink-500">{update.timestamp}</Label>
                      </Stack>
                    </Stack>
                    <Body className="text-ink-300">{update.content}</Body>
                    <Label className="text-ink-500">Posted by {update.author}</Label>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          <TabPanel active={activeTab === "stakeholders"}>
            <Grid cols={2} gap={4}>
              {mockStakeholders.map((stakeholder) => (
                <Card key={stakeholder.id} className={`border-2 ${getRoleColor(stakeholder.role)} p-6`}>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{stakeholder.name}</Body>
                        <Label className="text-ink-400">{stakeholder.organization}</Label>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Badge variant="outline">{stakeholder.role}</Badge>
                        <Label className={stakeholder.status === "Active" ? "text-success-400" : "text-warning-400"}>{stakeholder.status}</Label>
                      </Stack>
                    </Stack>
                    <Grid cols={2} gap={4}>
                      <Stack gap={1}><Label size="xs" className="text-ink-500">Access Level</Label><Label className="text-white">{stakeholder.accessLevel}</Label></Stack>
                      <Stack gap={1}><Label size="xs" className="text-ink-500">Last Login</Label><Label className="text-ink-300">{stakeholder.lastLogin || "Never"}</Label></Stack>
                    </Grid>
                    <Button variant="outline" size="sm" onClick={() => setSelectedStakeholder(stakeholder)}>Manage Access</Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel active={activeTab === "documents"}>
            <Stack gap={4}>
              {["Production Schedule", "Budget Summary", "Site Plans", "Contact List", "Safety Protocols"].map((doc, idx) => (
                <Card key={idx} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-xl">📄</Label>
                      <Stack gap={1}>
                        <Label className="text-white">{doc}</Label>
                        <Label size="xs" className="text-ink-500">Updated 2024-11-{20 + idx}</Label>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Badge variant="outline">{["Client", "All", "Vendor", "All", "All"][idx]}</Badge>
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Download</Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/projects")}>Projects</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/communications")}>Communications</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedStakeholder} onClose={() => setSelectedStakeholder(null)}>
        <ModalHeader><H3>Manage Access</H3></ModalHeader>
        <ModalBody>
          {selectedStakeholder && (
            <Stack gap={4}>
              <Body className="text-white">{selectedStakeholder.name}</Body>
              <Label className="text-ink-400">{selectedStakeholder.organization}</Label>
              <Select defaultValue={selectedStakeholder.accessLevel} className="border-ink-700 bg-black text-white">
                <option value="Full">Full Access</option>
                <option value="Limited">Limited Access</option>
                <option value="View Only">View Only</option>
              </Select>
              <Stack gap={2}>
                <Label className="text-ink-400">Project Access</Label>
                {["Summer Fest 2024", "Corporate Gala"].map((proj, idx) => (
                  <Card key={idx} className="p-3 border border-ink-700">
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-white">{proj}</Label>
                      <Button variant="outline" size="sm">Granted</Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedStakeholder(null)}>Cancel</Button>
          <Button variant="ghost" className="text-error-400">Revoke Access</Button>
          <Button variant="solid" onClick={() => setSelectedStakeholder(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)}>
        <ModalHeader><H3>Invite Stakeholder</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Name" className="border-ink-700 bg-black text-white" />
            <Input type="email" placeholder="Email" className="border-ink-700 bg-black text-white" />
            <Input placeholder="Organization" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Role...</option>
                <option value="Client">Client</option>
                <option value="Sponsor">Sponsor</option>
                <option value="Vendor">Vendor</option>
                <option value="Partner">Partner</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Access Level...</option>
                <option value="Full">Full Access</option>
                <option value="Limited">Limited Access</option>
                <option value="View Only">View Only</option>
              </Select>
            </Grid>
            <Textarea placeholder="Welcome message (optional)..." rows={2} className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowInviteModal(false)}>Send Invite</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
