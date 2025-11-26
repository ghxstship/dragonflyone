"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface EarlyBirdCampaign {
  id: string;
  eventName: string;
  tierName: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  startDate: string;
  endDate: string;
  ticketsAllocated: number;
  ticketsSold: number;
  status: "Scheduled" | "Active" | "Ending Soon" | "Ended";
  daysRemaining?: number;
}

const mockCampaigns: EarlyBirdCampaign[] = [
  { id: "EB-001", eventName: "Summer Music Festival 2025", tierName: "Super Early Bird", originalPrice: 150, discountedPrice: 99, discountPercent: 34, startDate: "2024-11-01", endDate: "2024-12-15", ticketsAllocated: 500, ticketsSold: 423, status: "Active", daysRemaining: 20 },
  { id: "EB-002", eventName: "Summer Music Festival 2025", tierName: "Early Bird", originalPrice: 150, discountedPrice: 119, discountPercent: 21, startDate: "2024-12-16", endDate: "2025-01-31", ticketsAllocated: 1000, ticketsSold: 0, status: "Scheduled" },
  { id: "EB-003", eventName: "Tech Conference 2025", tierName: "Early Access", originalPrice: 299, discountedPrice: 199, discountPercent: 33, startDate: "2024-11-15", endDate: "2024-11-30", ticketsAllocated: 200, ticketsSold: 187, status: "Ending Soon", daysRemaining: 5 },
  { id: "EB-004", eventName: "New Year Gala", tierName: "Early Bird", originalPrice: 250, discountedPrice: 175, discountPercent: 30, startDate: "2024-10-01", endDate: "2024-11-15", ticketsAllocated: 300, ticketsSold: 300, status: "Ended" },
];

export default function EarlyBirdPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedCampaign, setSelectedCampaign] = useState<EarlyBirdCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeCampaigns = mockCampaigns.filter(c => c.status === "Active" || c.status === "Ending Soon");
  const totalRevenue = mockCampaigns.reduce((s, c) => s + (c.ticketsSold * c.discountedPrice), 0);
  const totalSaved = mockCampaigns.reduce((s, c) => s + (c.ticketsSold * (c.originalPrice - c.discountedPrice)), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Ending Soon": return "text-warning-600";
      case "Scheduled": return "text-info-600";
      case "Ended": return "text-grey-400";
      default: return "text-grey-600";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredCampaigns = activeTab === "all" ? mockCampaigns :
    activeTab === "active" ? mockCampaigns.filter(c => c.status === "Active" || c.status === "Ending Soon") :
    mockCampaigns.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>EARLY BIRD CAMPAIGNS</H1>
            <Body className="text-grey-600">Manage early bird pricing with countdown timers</Body>
          </Stack>

          <Card className="border-2 border-black p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
            <Stack gap={4}>
              <H3>Active Campaign Countdown</H3>
              <Grid cols={4} gap={4}>
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map((item) => (
                  <Card key={item.label} className="p-4 border-2 border-black text-center bg-white">
                    <Label className="font-mono text-4xl">{String(item.value).padStart(2, "0")}</Label>
                    <Label className="text-grey-500">{item.label}</Label>
                  </Card>
                ))}
              </Grid>
              <Label className="text-grey-600 text-center">Until Super Early Bird ends for Summer Music Festival 2025</Label>
            </Stack>
          </Card>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Campaigns" value={activeCampaigns.length} className="border-2 border-black" />
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} className="border-2 border-black" />
            <StatCard label="Customer Savings" value={formatCurrency(totalSaved)} className="border-2 border-black" />
            <StatCard label="Tickets Sold" value={mockCampaigns.reduce((s, c) => s + c.ticketsSold, 0)} className="border-2 border-black" />
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

          <Stack gap={4}>
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className={`border-2 ${campaign.status === "Ending Soon" ? "border-warning-500" : "border-black"} p-6`}>
                <Grid cols={6} gap={4} className="items-center">
                  <Stack gap={1}>
                    <Body className="font-bold">{campaign.eventName}</Body>
                    <Badge variant="outline">{campaign.tierName}</Badge>
                  </Stack>
                  <Stack gap={1}>
                    <Stack direction="horizontal" gap={2}>
                      <Label className="line-through text-grey-400">{formatCurrency(campaign.originalPrice)}</Label>
                      <Label className="font-bold text-success-600">{formatCurrency(campaign.discountedPrice)}</Label>
                    </Stack>
                    <Badge variant="solid" className="bg-success-600">{campaign.discountPercent}% OFF</Badge>
                  </Stack>
                  <Stack gap={1}>
                    <Label className="text-grey-500">Period</Label>
                    <Label>{campaign.startDate} - {campaign.endDate}</Label>
                  </Stack>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-grey-500">Sold</Label>
                      <Label>{campaign.ticketsSold} / {campaign.ticketsAllocated}</Label>
                    </Stack>
                    <ProgressBar value={(campaign.ticketsSold / campaign.ticketsAllocated) * 100} className="h-2" />
                  </Stack>
                  <Stack gap={1}>
                    <Label className={getStatusColor(campaign.status)}>{campaign.status}</Label>
                    {campaign.daysRemaining !== undefined && (
                      <Label className={campaign.daysRemaining <= 5 ? "text-warning-600" : "text-grey-500"}>
                        {campaign.daysRemaining} days left
                      </Label>
                    )}
                  </Stack>
                  <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaign)}>Manage</Button>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Button variant="outline" onClick={() => router.push("/marketing")}>Back to Marketing</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)}>
        <ModalHeader><H3>Campaign Details</H3></ModalHeader>
        <ModalBody>
          {selectedCampaign && (
            <Stack gap={4}>
              <Body className="font-bold">{selectedCampaign.eventName}</Body>
              <Badge variant="outline">{selectedCampaign.tierName}</Badge>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-grey-500">Original Price</Label><Label className="line-through">{formatCurrency(selectedCampaign.originalPrice)}</Label></Stack>
                <Stack gap={1}><Label className="text-grey-500">Discounted Price</Label><Label className="font-bold text-success-600">{formatCurrency(selectedCampaign.discountedPrice)}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-grey-500">Start Date</Label><Label>{selectedCampaign.startDate}</Label></Stack>
                <Stack gap={1}><Label className="text-grey-500">End Date</Label><Label>{selectedCampaign.endDate}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Stack direction="horizontal" className="justify-between">
                  <Label className="text-grey-500">Tickets Sold</Label>
                  <Label>{selectedCampaign.ticketsSold} / {selectedCampaign.ticketsAllocated}</Label>
                </Stack>
                <ProgressBar value={(selectedCampaign.ticketsSold / selectedCampaign.ticketsAllocated) * 100} className="h-3" />
              </Stack>
              <Stack gap={1}>
                <Label className="text-grey-500">Revenue Generated</Label>
                <Label className="font-mono text-xl">{formatCurrency(selectedCampaign.ticketsSold * selectedCampaign.discountedPrice)}</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Close</Button>
          {selectedCampaign?.status === "Active" && <Button variant="outline" className="text-error-600">End Early</Button>}
          <Button variant="solid">Edit Campaign</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Early Bird Campaign</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="e1">Summer Music Festival 2025</option>
              <option value="e2">Tech Conference 2025</option>
              <option value="e3">New Year Gala</option>
            </Select>
            <Input placeholder="Tier Name (e.g., Super Early Bird)" className="border-2 border-black" />
            <Grid cols={2} gap={4}>
              <Input type="number" placeholder="Original Price" className="border-2 border-black" />
              <Input type="number" placeholder="Discounted Price" className="border-2 border-black" />
            </Grid>
            <Grid cols={2} gap={4}>
              <Input type="date" placeholder="Start Date" className="border-2 border-black" />
              <Input type="date" placeholder="End Date" className="border-2 border-black" />
            </Grid>
            <Input type="number" placeholder="Tickets Allocated" className="border-2 border-black" />
            <Stack gap={2}>
              <Label className="text-grey-500">Countdown Display</Label>
              <Stack direction="horizontal" gap={2}>
                <Input type="checkbox" defaultChecked className="w-4 h-4" />
                <Label>Show countdown timer on event page</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Input type="checkbox" defaultChecked className="w-4 h-4" />
                <Label>Send reminder emails before expiry</Label>
              </Stack>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create Campaign</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
