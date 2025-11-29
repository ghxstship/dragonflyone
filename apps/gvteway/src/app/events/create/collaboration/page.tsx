"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Kicker,
} from "@ghxstship/ui";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: "Promoter" | "Venue" | "Artist" | "Sponsor" | "Production";
  permissions: string[];
  status: "Active" | "Pending" | "Revoked";
  lastActive?: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  section: string;
}

const mockCollaborators: Collaborator[] = [
  { id: "COL-001", name: "John Smith", email: "john@promoter.com", organization: "Live Nation", role: "Promoter", permissions: ["Edit Event", "Manage Tickets", "View Analytics"], status: "Active", lastActive: "2 hours ago" },
  { id: "COL-002", name: "Sarah Johnson", email: "sarah@venue.com", organization: "Madison Square Garden", role: "Venue", permissions: ["View Event", "Edit Venue Info", "Manage Capacity"], status: "Active", lastActive: "1 day ago" },
  { id: "COL-003", name: "Mike Davis", email: "mike@artist.com", organization: "Artist Management", role: "Artist", permissions: ["View Event", "Edit Artist Info"], status: "Pending" },
  { id: "COL-004", name: "Emily Chen", email: "emily@sponsor.com", organization: "Brand Corp", role: "Sponsor", permissions: ["View Event", "View Analytics"], status: "Active", lastActive: "3 days ago" },
];

const mockActivity: ActivityLog[] = [
  { id: "ACT-001", user: "John Smith", action: "Updated ticket pricing", timestamp: "2 hours ago", section: "Ticketing" },
  { id: "ACT-002", user: "Sarah Johnson", action: "Modified venue capacity", timestamp: "1 day ago", section: "Venue" },
  { id: "ACT-003", user: "You", action: "Added new collaborator", timestamp: "2 days ago", section: "Team" },
  { id: "ACT-004", user: "Emily Chen", action: "Viewed analytics report", timestamp: "3 days ago", section: "Analytics" },
];

const permissionOptions = [
  "View Event",
  "Edit Event",
  "Manage Tickets",
  "View Analytics",
  "Edit Venue Info",
  "Manage Capacity",
  "Edit Artist Info",
  "Manage Marketing",
];

export default function EventCollaborationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("team");
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
      case "Promoter": return "bg-info-100 text-info-800";
      case "Venue": return "bg-purple-100 text-purple-800";
      case "Artist": return "bg-success-100 text-success-800";
      case "Sponsor": return "bg-warning-100 text-warning-800";
      case "Production": return "bg-error-100 text-error-800";
      default: return "bg-ink-100 text-ink-800";
    }
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Event Collaboration</H2>
              <Body className="text-on-dark-muted">Manage team permissions and collaboration</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Team Members" value={mockCollaborators.length} className="border-2 border-black" />
            <StatCard label="Active" value={activeCount} className="border-2 border-black" />
            <StatCard label="Pending Invites" value={pendingCount} className="border-2 border-black" />
            <StatCard label="Recent Activity" value={mockActivity.length} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "team"} onClick={() => setActiveTab("team")}>Team</Tab>
                <Tab active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>Activity</Tab>
                <Tab active={activeTab === "permissions"} onClick={() => setActiveTab("permissions")}>Permissions</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowInviteModal(true)}>Invite Collaborator</Button>
          </Stack>

          <TabPanel active={activeTab === "team"}>
            <Grid cols={2} gap={4}>
              {mockCollaborators.map((collaborator) => (
                <Card key={collaborator.id} className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Body className="font-bold">{collaborator.name}</Body>
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

          <TabPanel active={activeTab === "activity"}>
            <Table className="border-2 border-black">
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
                    <TableCell><Label className="font-medium">{activity.user}</Label></TableCell>
                    <TableCell><Label>{activity.action}</Label></TableCell>
                    <TableCell><Badge variant="outline">{activity.section}</Badge></TableCell>
                    <TableCell><Label className="text-ink-500">{activity.timestamp}</Label></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>

          <TabPanel active={activeTab === "permissions"}>
            <Card className="border-2 border-black p-6">
              <Stack gap={4}>
                <H3>Permission Levels</H3>
                <Grid cols={2} gap={4}>
                  {[
                    { role: "Promoter", perms: ["Full event management", "Ticket pricing", "Analytics access"] },
                    { role: "Venue", perms: ["Venue info editing", "Capacity management", "Event viewing"] },
                    { role: "Artist", perms: ["Artist info editing", "Event viewing", "Rider access"] },
                    { role: "Sponsor", perms: ["Event viewing", "Analytics viewing", "Brand placement"] },
                  ].map((level) => (
                    <Card key={level.role} className="p-4 border border-ink-200">
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
                <Label className="font-bold">{selectedCollaborator.name}</Label>
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
    </GvtewayAppLayout>
  );
}
