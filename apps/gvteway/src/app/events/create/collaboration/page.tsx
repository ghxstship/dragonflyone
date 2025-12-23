"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_COLLABORATORS,
  DEMO_ACTIVITY_LOGS,
  DEMO_PERMISSION_OPTIONS,
  type DemoCollaborator as Collaborator,
} from "@/lib/demo-data";

const mockCollaborators = DEMO_COLLABORATORS;
const mockActivity = DEMO_ACTIVITY_LOGS;
const permissionOptions = DEMO_PERMISSION_OPTIONS;

function EventCollaborationPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'team',
    validTabs: ['team', 'activity', 'permissions'],
  });
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const activeCount = mockCollaborators.filter(c => c.status === "Active").length;
  const pendingCount = mockCollaborators.filter(c => c.status === "Pending").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Pending": return "text-warning-600";
      case "Revoked": return "text-error-600";
      default: return "text-ink-600";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Promoter": return "bg-primary-100 text-primary-800";
      case "Venue": return "bg-secondary-100 text-secondary-800";
      case "Artist": return "bg-success-100 text-success-800";
      case "Sponsor": return "bg-warning-100 text-warning-800";
      case "Production": return "bg-success-100 text-success-800";
      default: return "bg-ink-100 text-ink-800";
    }
  };

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Event Collaboration</H2>
              <Body className="text-on-dark-muted">Manage team permissions and collaboration</Body>
            </Stack>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Team Members" value={mockCollaborators.length} className="border-2 border-black" />
            <StatCard label="Active" value={activeCount} className="border-2 border-black" />
            <StatCard label="Pending Invites" value={pendingCount} className="border-2 border-black" />
            <StatCard label="Recent Activity" value={mockActivity.length} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={isActive('team')} onClick={() => setActiveTab('team')}>Team</Tab>
                <Tab active={isActive('activity')} onClick={() => setActiveTab('activity')}>Activity</Tab>
                <Tab active={isActive('permissions')} onClick={() => setActiveTab('permissions')}>Permissions</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowInviteModal(true)}>Invite Collaborator</Button>
          </Stack>

          <TabPanel active={isActive('team')}>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              {mockCollaborators.map((collaborator) => (
                <Card key={collaborator.id} className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Body className="font-weight-bold">{collaborator.name}</Body>
                        <Label className="text-ink-500">{collaborator.email}</Label>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Badge className={getRoleColor(collaborator.role)}>{collaborator.role}</Badge>
                        <Label className={getStatusColor(collaborator.status)}>{collaborator.status}</Label>
                      </Stack>
                    </Stack>
                    <Label className="text-ink-600">{collaborator.organization}</Label>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {collaborator.permissions.slice(0, 3).map((perm, idx) => (
                        <Badge key={idx} variant="outline">{perm}</Badge>
                      ))}
                      {collaborator.permissions.length > 3 && (
                        <Badge variant="outline">+{collaborator.permissions.length - 3}</Badge>
                      )}
                    </Stack>
                    {collaborator.lastActive && (
                      <Label size="xs" className="text-ink-600">Last active: {collaborator.lastActive}</Label>
                    )}
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCollaborator(collaborator)}>Manage</Button>
                      {collaborator.status === "Pending" && <Button variant="solid" size="sm">Resend Invite</Button>}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel active={isActive('activity')}>
            <Table variant="dark" className="border-2 border-black">
              <TableHeader>
                <TableRow className="bg-black text-white">
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell><Label className="font-weight-medium">{activity.user}</Label></TableCell>
                    <TableCell><Label>{activity.action}</Label></TableCell>
                    <TableCell><Badge variant="outline">{activity.section}</Badge></TableCell>
                    <TableCell><Label className="text-ink-500">{activity.timestamp}</Label></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>

          <TabPanel active={isActive('permissions')}>
            <Card className="border-2 border-black p-6">
              <Stack gap={4}>
                <H3>Permission Levels</H3>
                <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                  {[
                    { role: "Promoter", perms: ["Full event management", "Ticket pricing", "Analytics access"] },
                    { role: "Venue", perms: ["Venue info editing", "Capacity management", "Event viewing"] },
                    { role: "Artist", perms: ["Artist info editing", "Event viewing", "Rider access"] },
                    { role: "Sponsor", perms: ["Event viewing", "Analytics viewing", "Brand placement"] },
                  ].map((level) => (
                    <Card key={level.role} className="p-4 border-2 border-ink-200">
                      <Stack gap={2}>
                        <Badge className={getRoleColor(level.role)}>{level.role}</Badge>
                        <Stack gap={1}>
                          {level.perms.map((perm, idx) => (
                            <Label key={idx} className="text-ink-600">• {perm}</Label>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Card>
          </TabPanel>

          <Button variant="outlineInk" onClick={() => router.push("/events/create")}>Back to Event</Button>
          </Stack>

      <Modal open={!!selectedCollaborator} onClose={() => setSelectedCollaborator(null)}>
        <ModalHeader><H3>Manage Collaborator</H3></ModalHeader>
        <ModalBody>
          {selectedCollaborator && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="font-weight-bold">{selectedCollaborator.name}</Label>
                <Label className="text-ink-500">{selectedCollaborator.email}</Label>
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-500">Organization</Label>
                <Label>{selectedCollaborator.organization}</Label>
              </Stack>
              <Stack gap={2}>
                <Label className="text-ink-500">Role</Label>
                <Select defaultValue={selectedCollaborator.role} className="border-2 border-black">
                  <option value="Promoter">Promoter</option>
                  <option value="Venue">Venue</option>
                  <option value="Artist">Artist</option>
                  <option value="Sponsor">Sponsor</option>
                  <option value="Production">Production</option>
                </Select>
              </Stack>
              <Stack gap={2}>
                <Label className="text-ink-500">Permissions</Label>
                <Stack gap={1}>
                  {permissionOptions.map((perm) => (
                    <Stack key={perm} direction="horizontal" gap={2}>
                      <Input type="checkbox" defaultChecked={selectedCollaborator.permissions.includes(perm)} className="w-4 h-4" />
                      <Label>{perm}</Label>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCollaborator(null)}>Cancel</Button>
          <Button variant="outline" className="text-error-600">Revoke Access</Button>
          <Button variant="solid" onClick={() => setSelectedCollaborator(null)}>Save Changes</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)}>
        <ModalHeader><H3>Invite Collaborator</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Email address" className="border-2 border-black" />
            <Input placeholder="Name" className="border-2 border-black" />
            <Input placeholder="Organization" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Select Role...</option>
              <option value="Promoter">Promoter</option>
              <option value="Venue">Venue</option>
              <option value="Artist">Artist</option>
              <option value="Sponsor">Sponsor</option>
              <option value="Production">Production</option>
            </Select>
            <Textarea placeholder="Personal message (optional)..." rows={2} className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowInviteModal(false)}>Send Invite</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function EventCollaborationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <EventCollaborationPageContent />
    </Suspense>
  );
}
