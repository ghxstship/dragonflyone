"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      Active: 'solid',
      Scheduled: 'outline',
      Ended: 'ghost',
      Paused: 'outline',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status}</Badge>;
  };

  const filteredCampaigns = activeTab === "all" ? mockCampaigns : mockCampaigns.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Admin">
            <FooterLink href="/admin/pricing">Pricing</FooterLink>
            <FooterLink href="/admin/pricing/early-bird">Early Bird</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Pricing</Kicker>
              <H2 size="lg" className="text-white">Early Bird Pricing</H2>
              <Body className="text-on-dark-muted">Create and manage early bird pricing campaigns with countdown timers</Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard label="Active Campaigns" value={activeCampaigns.toString()} inverted />
              <StatCard label="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}K`} inverted />
              <StatCard label="Tickets Sold" value={totalTicketsSold.toLocaleString()} inverted />
              <StatCard label="Avg Discount" value="22%" inverted />
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

          <Card inverted className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-ink-900">
                  <TableHead className="text-on-dark-muted">Campaign</TableHead>
                  <TableHead className="text-on-dark-muted">Event</TableHead>
                  <TableHead className="text-on-dark-muted">Discount</TableHead>
                  <TableHead className="text-on-dark-muted">Period</TableHead>
                  <TableHead className="text-on-dark-muted">Progress</TableHead>
                  <TableHead className="text-on-dark-muted">Revenue</TableHead>
                  <TableHead className="text-on-dark-muted">Status</TableHead>
                  <TableHead className="text-on-dark-muted">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="border-b border-ink-700">
                    <TableCell>
                      <Body className="font-display text-white">{campaign.name}</Body>
                    </TableCell>
                    <TableCell>
                      <Label className="text-on-dark-muted">{campaign.eventName}</Label>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {campaign.discountType === "Percentage" ? `${campaign.discountValue}% OFF` : `$${campaign.discountValue} OFF`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Stack gap={0}>
                        <Label className="font-mono text-white">{campaign.startDate}</Label>
                        <Label size="sm" className="font-mono text-on-dark-disabled">to {campaign.endDate}</Label>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {campaign.ticketLimit ? (
                        <Stack gap={1}>
                          <Label size="sm" className="text-white">{campaign.ticketsSold}/{campaign.ticketLimit}</Label>
                          <div className="h-2 w-20 overflow-hidden rounded-badge bg-ink-700">
                            <div className="h-full bg-white" style={{ width: `${(campaign.ticketsSold / campaign.ticketLimit) * 100}%` }} />
                          </div>
                        </Stack>
                      ) : (
                        <Label size="sm" className="text-white">{campaign.ticketsSold} sold</Label>
                      )}
                    </TableCell>
                    <TableCell>
                      <Label className="font-mono text-white">${campaign.revenue.toLocaleString()}</Label>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(campaign.status)}
                    </TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}>View</Button>
                        {campaign.status === "Active" && <Button variant="outlineInk" size="sm">Pause</Button>}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card inverted className="p-6">
            <Stack gap={4}>
              <H3 className="text-white">Countdown Timer Preview</H3>
              <Card inverted variant="elevated" className="p-6 text-center">
                <Stack gap={4}>
                  <Label className="text-accent">EARLY BIRD ENDS IN</Label>
                  <Grid cols={4} gap={4}>
                    {[{ value: "05", label: "DAYS" }, { value: "12", label: "HOURS" }, { value: "34", label: "MINS" }, { value: "56", label: "SECS" }].map((item) => (
                      <Stack key={item.label} gap={1}>
                        <Label className="font-mono text-h3-md text-white">{item.value}</Label>
                        <Label size="xs" className="text-on-dark-disabled">{item.label}</Label>
                      </Stack>
                    ))}
                  </Grid>
                  <Body className="text-white">Save 20% on Summer Fest 2024 tickets!</Body>
                  <Button variant="solid" inverted>GET TICKETS NOW</Button>
                </Stack>
              </Card>
              <Label size="xs" className="text-on-dark-muted">This countdown timer will appear on your event page</Label>
            </Stack>
          </Card>

          <Button variant="outlineInk" onClick={() => router.push("/admin/pricing")}>Back to Pricing</Button>
          </Stack>
        </Container>
      </Section>

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
              <Label size="xs" className="text-ink-500">Campaign ends when limit is reached or end date passes</Label>
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
              <Body className="font-display">{selectedCampaign.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Event</Label><Label>{selectedCampaign.eventName}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Status</Label>{getStatusBadge(selectedCampaign.status)}</Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Discount</Label><Label>{selectedCampaign.discountType === "Percentage" ? `${selectedCampaign.discountValue}%` : `$${selectedCampaign.discountValue}`}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Revenue</Label><Label className="font-mono">${selectedCampaign.revenue.toLocaleString()}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-on-light-muted">Period</Label><Label>{selectedCampaign.startDate} to {selectedCampaign.endDate}</Label></Stack>
              {selectedCampaign.ticketLimit && (
                <Stack gap={2}>
                  <Label size="xs" className="text-on-light-muted">Progress</Label>
                  <div className="h-3 overflow-hidden rounded-badge bg-ink-200">
                    <div className="h-full bg-ink-900" style={{ width: `${(selectedCampaign.ticketsSold / selectedCampaign.ticketLimit) * 100}%` }} />
                  </div>
                  <Label size="sm">{selectedCampaign.ticketsSold} of {selectedCampaign.ticketLimit} tickets sold</Label>
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
    </PageLayout>
  );
}
