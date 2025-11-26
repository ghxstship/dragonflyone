"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface EarlyBirdCampaign {
  id: string;
  name: string;
  eventId: string;
  eventName: string;
  discountType: "Percentage" | "Fixed Amount";
  discountValue: number;
  startDate: string;
  endDate: string;
  ticketLimit?: number;
  ticketsSold: number;
  status: "Scheduled" | "Active" | "Ended" | "Paused";
  revenue: number;
}

const mockCampaigns: EarlyBirdCampaign[] = [
  { id: "EB-001", name: "Super Early Bird", eventId: "EVT-001", eventName: "Summer Fest 2024", discountType: "Percentage", discountValue: 30, startDate: "2024-10-01", endDate: "2024-10-31", ticketLimit: 500, ticketsSold: 500, status: "Ended", revenue: 26250 },
  { id: "EB-002", name: "Early Bird", eventId: "EVT-001", eventName: "Summer Fest 2024", discountType: "Percentage", discountValue: 20, startDate: "2024-11-01", endDate: "2024-11-30", ticketLimit: 1000, ticketsSold: 756, status: "Active", revenue: 45360 },
  { id: "EB-003", name: "Holiday Special", eventId: "EVT-002", eventName: "Winter Gala", discountType: "Fixed Amount", discountValue: 25, startDate: "2024-12-01", endDate: "2024-12-15", ticketsSold: 0, status: "Scheduled", revenue: 0 },
  { id: "EB-004", name: "Flash Sale", eventId: "EVT-001", eventName: "Summer Fest 2024", discountType: "Percentage", discountValue: 15, startDate: "2024-11-20", endDate: "2024-11-22", ticketLimit: 200, ticketsSold: 200, status: "Ended", revenue: 12750 },
];

export default function EarlyBirdPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EarlyBirdCampaign | null>(null);

  const activeCampaigns = mockCampaigns.filter(c => c.status === "Active").length;
  const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalTicketsSold = mockCampaigns.reduce((sum, c) => sum + c.ticketsSold, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-green-600";
      case "Scheduled": return "text-blue-600";
      case "Ended": return "text-gray-500";
      case "Paused": return "text-yellow-600";
      default: return "text-gray-500";
    }
  };

  const filteredCampaigns = activeTab === "all" ? mockCampaigns : mockCampaigns.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Early Bird Pricing</H1>
            <Body className="text-grey-600">Create and manage early bird pricing campaigns with countdown timers</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Campaigns" value={activeCampaigns} className="border-2 border-black" />
            <StatCard label="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}K`} className="border-2 border-black" />
            <StatCard label="Tickets Sold" value={totalTicketsSold.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Avg Discount" value="22%" className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active</Tab>
                <Tab active={activeTab === "scheduled"} onClick={() => setActiveTab("scheduled")}>Scheduled</Tab>
                <Tab active={activeTab === "ended"} onClick={() => setActiveTab("ended")}>Ended</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Campaign</Button>
          </Stack>

          <Table className="border-2 border-black">
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Body className="font-bold">{campaign.name}</Body>
                  </TableCell>
                  <TableCell>
                    <Label className="text-gray-600">{campaign.eventName}</Label>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {campaign.discountType === "Percentage" ? `${campaign.discountValue}% OFF` : `$${campaign.discountValue} OFF`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="font-mono text-sm">{campaign.startDate}</Label>
                      <Label className="font-mono text-sm text-gray-500">to {campaign.endDate}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {campaign.ticketLimit ? (
                      <Stack gap={1}>
                        <Label className="text-sm">{campaign.ticketsSold}/{campaign.ticketLimit}</Label>
                        <Card className="h-2 bg-gray-200 rounded-full overflow-hidden w-20">
                          <Card className="h-full bg-black" style={{ width: `${(campaign.ticketsSold / campaign.ticketLimit) * 100}%` }} />
                        </Card>
                      </Stack>
                    ) : (
                      <Label className="text-sm">{campaign.ticketsSold} sold</Label>
                    )}
                  </TableCell>
                  <TableCell>
                    <Label className="font-mono">${campaign.revenue.toLocaleString()}</Label>
                  </TableCell>
                  <TableCell>
                    <Label className={getStatusColor(campaign.status)}>{campaign.status}</Label>
                  </TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}>View</Button>
                      {campaign.status === "Active" && <Button variant="outline" size="sm">Pause</Button>}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Card className="border-2 border-black p-6">
            <Stack gap={4}>
              <H3>COUNTDOWN TIMER PREVIEW</H3>
              <Card className="p-6 bg-black text-white text-center">
                <Stack gap={4}>
                  <Label className="text-yellow-400">EARLY BIRD ENDS IN</Label>
                  <Grid cols={4} gap={4}>
                    {[{ value: "05", label: "DAYS" }, { value: "12", label: "HOURS" }, { value: "34", label: "MINS" }, { value: "56", label: "SECS" }].map((item) => (
                      <Stack key={item.label} gap={1}>
                        <Label className="text-4xl font-mono">{item.value}</Label>
                        <Label size="xs" className="text-gray-400">{item.label}</Label>
                      </Stack>
                    ))}
                  </Grid>
                  <Body className="text-lg">Save 20% on Summer Fest 2024 tickets!</Body>
                  <Button variant="solid" className="bg-yellow-400 text-black">GET TICKETS NOW</Button>
                </Stack>
              </Card>
              <Label size="xs" className="text-gray-500">This countdown timer will appear on your event page</Label>
            </Stack>
          </Card>

          <Button variant="outline" onClick={() => router.push("/admin/pricing")}>Back to Pricing</Button>
        </Stack>
      </Container>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Early Bird Campaign</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Campaign Name (e.g., Super Early Bird)" />
            <Select>
              <option value="">Select Event...</option>
              <option value="EVT-001">Summer Fest 2024</option>
              <option value="EVT-002">Winter Gala</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Select>
                <option value="Percentage">Percentage Off</option>
                <option value="Fixed">Fixed Amount Off</option>
              </Select>
              <Input type="number" placeholder="Discount Value" />
            </Grid>
            <Grid cols={2} gap={4}>
              <Stack gap={2}>
                <Label>Start Date</Label>
                <Input type="date" />
              </Stack>
              <Stack gap={2}>
                <Label>End Date</Label>
                <Input type="date" />
              </Stack>
            </Grid>
            <Stack gap={2}>
              <Label>Ticket Limit (optional)</Label>
              <Input type="number" placeholder="Leave empty for unlimited" />
              <Label size="xs" className="text-gray-500">Campaign ends when limit is reached or end date passes</Label>
            </Stack>
            <Alert variant="info">Countdown timer will automatically appear on the event page during the campaign period</Alert>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create Campaign</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)}>
        <ModalHeader><H3>Campaign Details</H3></ModalHeader>
        <ModalBody>
          {selectedCampaign && (
            <Stack gap={4}>
              <Body className="font-bold text-lg">{selectedCampaign.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Event</Label><Label>{selectedCampaign.eventName}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Status</Label><Label className={getStatusColor(selectedCampaign.status)}>{selectedCampaign.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Discount</Label><Label>{selectedCampaign.discountType === "Percentage" ? `${selectedCampaign.discountValue}%` : `$${selectedCampaign.discountValue}`}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Revenue</Label><Label className="font-mono">${selectedCampaign.revenue.toLocaleString()}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-gray-500">Period</Label><Label>{selectedCampaign.startDate} to {selectedCampaign.endDate}</Label></Stack>
              {selectedCampaign.ticketLimit && (
                <Stack gap={2}>
                  <Label size="xs" className="text-gray-500">Progress</Label>
                  <Card className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <Card className="h-full bg-black" style={{ width: `${(selectedCampaign.ticketsSold / selectedCampaign.ticketLimit) * 100}%` }} />
                  </Card>
                  <Label className="text-sm">{selectedCampaign.ticketsSold} of {selectedCampaign.ticketLimit} tickets sold</Label>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Close</Button>
          <Button variant="solid">Edit Campaign</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
