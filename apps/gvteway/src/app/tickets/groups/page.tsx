"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface GroupOrder {
  id: string;
  organizerName: string;
  organizerEmail: string;
  eventName: string;
  groupSize: number;
  ticketType: string;
  totalAmount: number;
  discount: number;
  status: "Pending" | "Confirmed" | "Paid" | "Completed";
  createdDate: string;
  attendeesRegistered: number;
}

const mockGroups: GroupOrder[] = [
  { id: "GRP-001", organizerName: "John Smith", organizerEmail: "john@company.com", eventName: "Summer Music Festival 2025", groupSize: 25, ticketType: "General Admission", totalAmount: 3375, discount: 10, status: "Confirmed", createdDate: "2024-11-20", attendeesRegistered: 18 },
  { id: "GRP-002", organizerName: "Sarah Johnson", organizerEmail: "sarah@corp.com", eventName: "Tech Conference 2025", groupSize: 50, ticketType: "Full Access", totalAmount: 12250, discount: 15, status: "Paid", createdDate: "2024-11-18", attendeesRegistered: 50 },
  { id: "GRP-003", organizerName: "Mike Davis", organizerEmail: "mike@org.com", eventName: "New Year Gala", groupSize: 10, ticketType: "VIP", totalAmount: 2250, discount: 5, status: "Pending", createdDate: "2024-11-22", attendeesRegistered: 0 },
  { id: "GRP-004", organizerName: "Emily Chen", organizerEmail: "emily@school.edu", eventName: "Summer Music Festival 2025", groupSize: 100, ticketType: "General Admission", totalAmount: 12000, discount: 20, status: "Completed", createdDate: "2024-11-10", attendeesRegistered: 100 },
];

export default function GroupTicketsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedGroup, setSelectedGroup] = useState<GroupOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalGroups = mockGroups.length;
  const totalAttendees = mockGroups.reduce((s, g) => s + g.groupSize, 0);
  const totalRevenue = mockGroups.reduce((s, g) => s + g.totalAmount, 0);
  const avgDiscount = Math.round(mockGroups.reduce((s, g) => s + g.discount, 0) / mockGroups.length);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-success-600";
      case "Paid": return "text-info-600";
      case "Confirmed": return "text-warning-600";
      case "Pending": return "text-grey-400";
      default: return "text-grey-600";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>GROUP TICKETS</H1>
            <Body className="text-grey-600">Group organizer tools and registration management</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Group Orders" value={totalGroups} className="border-2 border-black" />
            <StatCard label="Total Attendees" value={totalAttendees} className="border-2 border-black" />
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} className="border-2 border-black" />
            <StatCard label="Avg Discount" value={`${avgDiscount}%`} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>Group Orders</Tab>
              <Tab active={activeTab === "discounts"} onClick={() => setActiveTab("discounts")}>Discount Tiers</Tab>
              <Tab active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Settings</Tab>
            </TabsList>

            <TabPanel active={activeTab === "orders"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between">
                  <Input type="search" placeholder="Search groups..." className="border-2 border-black w-64" />
                  <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Group Order</Button>
                </Stack>
                <Table className="border-2 border-black">
                  <TableHeader>
                    <TableRow className="bg-black text-white">
                      <TableHead>Organizer</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <Stack gap={0}>
                            <Label className="font-medium">{group.organizerName}</Label>
                            <Label className="text-grey-500">{group.organizerEmail}</Label>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack gap={0}>
                            <Label>{group.eventName}</Label>
                            <Badge variant="outline">{group.ticketType}</Badge>
                          </Stack>
                        </TableCell>
                        <TableCell><Label className="font-mono">{group.groupSize}</Label></TableCell>
                        <TableCell>
                          <Stack gap={1}>
                            <Label className="font-mono">{group.attendeesRegistered} / {group.groupSize}</Label>
                            <ProgressBar value={(group.attendeesRegistered / group.groupSize) * 100} className="h-2" />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack gap={0}>
                            <Label className="font-mono">{formatCurrency(group.totalAmount)}</Label>
                            <Label className="text-success-600">-{group.discount}%</Label>
                          </Stack>
                        </TableCell>
                        <TableCell><Label className={getStatusColor(group.status)}>{group.status}</Label></TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedGroup(group)}>Manage</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "discounts"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={6}>
                  <H3>Group Discount Tiers</H3>
                  <Stack gap={4}>
                    {[
                      { min: 10, max: 24, discount: 5 },
                      { min: 25, max: 49, discount: 10 },
                      { min: 50, max: 99, discount: 15 },
                      { min: 100, max: null, discount: 20 },
                    ].map((tier, idx) => (
                      <Card key={idx} className="p-4 border border-grey-200">
                        <Grid cols={4} gap={4} className="items-center">
                          <Stack gap={1}>
                            <Label className="text-grey-500">Group Size</Label>
                            <Label className="font-bold">{tier.min} - {tier.max || "∞"} tickets</Label>
                          </Stack>
                          <Stack gap={1}>
                            <Label className="text-grey-500">Discount</Label>
                            <Label className="font-mono text-success-600 text-xl">{tier.discount}%</Label>
                          </Stack>
                          <Stack gap={1}>
                            <Label className="text-grey-500">Example Savings</Label>
                            <Label className="font-mono">{formatCurrency(150 * tier.min * (tier.discount / 100))}</Label>
                          </Stack>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                  <Button variant="outline">Add Tier</Button>
                </Stack>
              </Card>
            </TabPanel>

            <TabPanel active={activeTab === "settings"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={6}>
                  <H3>Group Order Settings</H3>
                  <Grid cols={2} gap={6}>
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Label className="font-bold">Minimum Group Size</Label>
                        <Input type="number" defaultValue={10} className="border-2 border-black" />
                      </Stack>
                      <Stack gap={2}>
                        <Label className="font-bold">Maximum Group Size</Label>
                        <Input type="number" defaultValue={500} className="border-2 border-black" />
                      </Stack>
                      <Stack gap={2}>
                        <Label className="font-bold">Registration Deadline</Label>
                        <Select className="border-2 border-black">
                          <option value="7">7 days before event</option>
                          <option value="14">14 days before event</option>
                          <option value="30">30 days before event</option>
                        </Select>
                      </Stack>
                    </Stack>
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Label className="font-bold">Organizer Features</Label>
                        <Stack gap={1}>
                          {["Allow organizer to collect attendee info", "Send registration link to organizer", "Allow partial payments", "Enable attendee self-registration", "Send reminders to unregistered attendees"].map((opt, idx) => (
                            <Stack key={idx} direction="horizontal" gap={2}>
                              <Input type="checkbox" defaultChecked={idx < 4} className="w-4 h-4" />
                              <Label>{opt}</Label>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Button variant="solid">Save Settings</Button>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/tickets")}>Back to Tickets</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedGroup} onClose={() => setSelectedGroup(null)}>
        <ModalHeader><H3>Manage Group Order</H3></ModalHeader>
        <ModalBody>
          {selectedGroup && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Body className="font-bold">{selectedGroup.organizerName}</Body>
                <Label className="text-grey-500">{selectedGroup.organizerEmail}</Label>
              </Stack>
              <Stack gap={1}>
                <Label className="text-grey-500">Event</Label>
                <Label>{selectedGroup.eventName}</Label>
                <Badge variant="outline">{selectedGroup.ticketType}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-grey-500">Group Size</Label><Label className="font-mono">{selectedGroup.groupSize}</Label></Stack>
                <Stack gap={1}><Label className="text-grey-500">Registered</Label><Label className="font-mono">{selectedGroup.attendeesRegistered}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Stack direction="horizontal" className="justify-between">
                  <Label className="text-grey-500">Registration Progress</Label>
                  <Label>{Math.round((selectedGroup.attendeesRegistered / selectedGroup.groupSize) * 100)}%</Label>
                </Stack>
                <ProgressBar value={(selectedGroup.attendeesRegistered / selectedGroup.groupSize) * 100} className="h-3" />
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-grey-500">Total Amount</Label><Label className="font-mono">{formatCurrency(selectedGroup.totalAmount)}</Label></Stack>
                <Stack gap={1}><Label className="text-grey-500">Discount Applied</Label><Label className="text-success-600">{selectedGroup.discount}%</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-grey-500">Status</Label><Label className={getStatusColor(selectedGroup.status)}>{selectedGroup.status}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedGroup(null)}>Close</Button>
          <Button variant="outline">View Attendees</Button>
          <Button variant="outline">Send Reminder</Button>
          <Button variant="solid">Download Roster</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Group Order</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Organizer Name" className="border-2 border-black" />
            <Input type="email" placeholder="Organizer Email" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="summer">Summer Music Festival 2025</option>
              <option value="gala">New Year Gala</option>
              <option value="tech">Tech Conference 2025</option>
            </Select>
            <Select className="border-2 border-black">
              <option value="">Ticket Type...</option>
              <option value="ga">General Admission</option>
              <option value="vip">VIP</option>
              <option value="full">Full Access</option>
            </Select>
            <Input type="number" placeholder="Group Size" className="border-2 border-black" />
            <Textarea placeholder="Notes (optional)..." rows={2} className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create Order</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
