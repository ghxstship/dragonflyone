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
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  EnterprisePageHeader,
  MainContent,
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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Stakeholder Portal"
        subtitle="Role-based communication portal for project stakeholders"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Stakeholder Portal' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'Invite Stakeholder', onClick: () => setShowInviteModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard label="Total Stakeholders" value={mockStakeholders.length.toString()} />
              <StatCard label="Active" value={activeStakeholders.toString()} />
              <StatCard label="Updates Today" value={mockUpdates.filter(u => u.timestamp.includes("2024-11-25")).length.toString()} />
              <StatCard label="Pending Invites" value={mockStakeholders.filter(s => s.status === "Pending").length.toString()} />
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
                <Button variant="outline">Post Update</Button>
                <Button variant="solid" onClick={() => setShowInviteModal(true)}>Invite Stakeholder</Button>
              </Stack>
            </Stack>

            <TabPanel active={activeTab === "updates"}>
              <Stack gap={4}>
                {mockUpdates.map((update) => (
                  <Card key={update.id}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack direction="horizontal" gap={3}>
                          <Body>{getUpdateIcon(update.type)}</Body>
                          <Stack gap={1}>
                            <Body className="font-display">{update.title}</Body>
                            <Badge variant="outline">{update.projectName}</Badge>
                          </Stack>
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Badge variant="outline">{update.type}</Badge>
                          <Body className="text-body-sm">{update.timestamp}</Body>
                        </Stack>
                      </Stack>
                      <Body>{update.content}</Body>
                      <Body className="text-body-sm">Posted by {update.author}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "stakeholders"}>
              <Grid cols={2} gap={4}>
                {mockStakeholders.map((stakeholder) => (
                  <Card key={stakeholder.id}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display">{stakeholder.name}</Body>
                          <Body className="text-body-sm">{stakeholder.organization}</Body>
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Badge variant="outline">{stakeholder.role}</Badge>
                          <Badge variant={stakeholder.status === "Active" ? "solid" : "outline"}>{stakeholder.status}</Badge>
                        </Stack>
                      </Stack>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}><Body className="text-body-sm">Access Level</Body><Body>{stakeholder.accessLevel}</Body></Stack>
                        <Stack gap={1}><Body className="text-body-sm">Last Login</Body><Body>{stakeholder.lastLogin || "Never"}</Body></Stack>
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
                  <Card key={idx}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={3}>
                        <Body>📄</Body>
                        <Stack gap={1}>
                          <Body>{doc}</Body>
                          <Body className="text-body-sm">Updated 2024-11-{20 + idx}</Body>
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
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
              <Button variant="outline" onClick={() => router.push("/communications")}>Communications</Button>
              <Button variant="outline" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedStakeholder} onClose={() => setSelectedStakeholder(null)}>
        <ModalHeader><H3>Manage Access</H3></ModalHeader>
        <ModalBody>
          {selectedStakeholder && (
            <Stack gap={4}>
              <Body>{selectedStakeholder.name}</Body>
              <Body className="text-body-sm">{selectedStakeholder.organization}</Body>
              <Select defaultValue={selectedStakeholder.accessLevel}>
                <option value="Full">Full Access</option>
                <option value="Limited">Limited Access</option>
                <option value="View Only">View Only</option>
              </Select>
              <Stack gap={2}>
                <Body className="text-body-sm">Project Access</Body>
                {["Summer Fest 2024", "Corporate Gala"].map((proj, idx) => (
                  <Card key={idx}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>{proj}</Body>
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
          <Button variant="ghost">Revoke Access</Button>
          <Button variant="solid" onClick={() => setSelectedStakeholder(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)}>
        <ModalHeader><H3>Invite Stakeholder</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Name" />
            <Input type="email" placeholder="Email" />
            <Input placeholder="Organization" />
            <Grid cols={2} gap={4}>
              <Select>
                <option value="">Role...</option>
                <option value="Client">Client</option>
                <option value="Sponsor">Sponsor</option>
                <option value="Vendor">Vendor</option>
                <option value="Partner">Partner</option>
              </Select>
              <Select>
                <option value="">Access Level...</option>
                <option value="Full">Full Access</option>
                <option value="Limited">Limited Access</option>
                <option value="View Only">View Only</option>
              </Select>
            </Grid>
            <Textarea placeholder="Welcome message (optional)..." rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowInviteModal(false)}>Send Invite</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
