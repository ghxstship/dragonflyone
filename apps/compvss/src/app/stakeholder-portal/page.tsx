"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../components/app-layout";
import { BarChart3, Target, AlertTriangle, FileText, ClipboardList } from "lucide-react";
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

import {
  useStakeholders,
  useStakeholderUpdates,
  type Stakeholder,
} from "../../hooks/useStakeholders";

export default function StakeholderPortalPage() {
  const router = useRouter();
  const { data: stakeholders = [], isLoading, error } = useStakeholders();
  const { data: updates = [] } = useStakeholderUpdates();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'updates',
    validTabs: ['updates', 'stakeholders', 'documents'],
  });
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading stakeholder data...</Body>
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
                <Body className="text-destructive font-display">Failed to load stakeholder data</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  const activeStakeholders = stakeholders.filter(s => s.status === "Active").length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Client": return "bg-info-900/30 border-info-800";
      case "Sponsor": return "bg-violet-900/30 border-violet-800";
      case "Vendor": return "bg-success-900/30 border-success-800";
      case "Partner": return "bg-warning-900/30 border-warning-800";
      default: return "bg-ink-800 border-ink-700";
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "Status": return <BarChart3 className="size-5" />;
      case "Milestone": return <Target className="size-5" />;
      case "Alert": return <AlertTriangle className="size-5" />;
      case "Document": return <FileText className="size-5" />;
      default: return <ClipboardList className="size-5" />;
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Stakeholder Portal"
        subtitle="Role-based communication portal for project stakeholders"


        primaryAction={{ label: 'Invite Stakeholder', onClick: () => setShowInviteModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Stakeholders" value={stakeholders.length.toString()} />
              <StatCard label="Active" value={activeStakeholders.toString()} />
              <StatCard label="Updates Today" value={updates.filter(u => u.timestamp.includes(new Date().toISOString().split('T')[0])).length.toString()} />
              <StatCard label="Pending Invites" value={stakeholders.filter(s => s.status === "Pending").length.toString()} />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={isActive('updates')} onClick={() => setActiveTab('updates')}>Updates</Tab>
                  <Tab active={isActive('stakeholders')} onClick={() => setActiveTab('stakeholders')}>Stakeholders</Tab>
                  <Tab active={isActive('documents')} onClick={() => setActiveTab('documents')}>Documents</Tab>
                </TabsList>
              </Tabs>
              <Stack direction="horizontal" gap={2}>
                <Button variant="outline">Post Update</Button>
                <Button variant="solid" onClick={() => setShowInviteModal(true)}>Invite Stakeholder</Button>
              </Stack>
            </Stack>

            <TabPanel active={isActive('updates')}>
              <Stack gap={4}>
                {updates.map((update) => (
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
                          <Body size="sm" className="">{update.timestamp}</Body>
                        </Stack>
                      </Stack>
                      <Body>{update.content}</Body>
                      <Body size="sm" className="">Posted by {update.author}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={isActive('stakeholders')}>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                {stakeholders.map((stakeholder) => (
                  <Card key={stakeholder.id}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display">{stakeholder.name}</Body>
                          <Body size="sm" className="">{stakeholder.organization}</Body>
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Badge className={getRoleColor(stakeholder.role)}>{stakeholder.role}</Badge>
                          <Badge variant={stakeholder.status === "Active" ? "solid" : "outline"}>{stakeholder.status}</Badge>
                        </Stack>
                      </Stack>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}><Body size="sm" className="">Access Level</Body><Body>{stakeholder.accessLevel}</Body></Stack>
                        <Stack gap={1}><Body size="sm" className="">Last Login</Body><Body>{stakeholder.lastLogin || "Never"}</Body></Stack>
                      </Grid>
                      <Button variant="outline" size="sm" onClick={() => setSelectedStakeholder(stakeholder)}>Manage Access</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('documents')}>
              <Stack gap={4}>
                {["Production Schedule", "Budget Summary", "Site Plans", "Contact List", "Safety Protocols"].map((doc, idx) => (
                  <Card key={idx}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={3}>
                        <FileText className="size-5" />
                        <Stack gap={1}>
                          <Body>{doc}</Body>
                          <Body size="sm" className="">Updated 2024-11-{20 + idx}</Body>
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

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
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
              <Body size="sm" className="">{selectedStakeholder.organization}</Body>
              <Select defaultValue={selectedStakeholder.accessLevel}>
                <option value="Full">Full Access</option>
                <option value="Limited">Limited Access</option>
                <option value="View Only">View Only</option>
              </Select>
              <Stack gap={2}>
                <Body size="sm" className="">Project Access</Body>
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
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
