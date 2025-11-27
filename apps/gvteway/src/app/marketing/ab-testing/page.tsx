"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface ABTest {
  id: string;
  name: string;
  type: "Landing Page" | "Pricing" | "Email" | "CTA" | "Checkout";
  status: "Running" | "Completed" | "Draft" | "Paused";
  startDate: string;
  endDate?: string;
  variants: { name: string; visitors: number; conversions: number; conversionRate: number }[];
  winner?: string;
  confidence?: number;
}

const mockTests: ABTest[] = [
  { 
    id: "AB-001", 
    name: "Hero Image Test", 
    type: "Landing Page", 
    status: "Running", 
    startDate: "2024-11-15",
    variants: [
      { name: "Control (Festival Photo)", visitors: 4520, conversions: 226, conversionRate: 5.0 },
      { name: "Variant A (Artist Photo)", visitors: 4480, conversions: 269, conversionRate: 6.0 },
    ],
    confidence: 87
  },
  { 
    id: "AB-002", 
    name: "Ticket Price Display", 
    type: "Pricing", 
    status: "Completed", 
    startDate: "2024-11-01",
    endDate: "2024-11-14",
    variants: [
      { name: "Control ($150)", visitors: 8200, conversions: 328, conversionRate: 4.0 },
      { name: "Variant A ($149)", visitors: 8150, conversions: 407, conversionRate: 5.0 },
    ],
    winner: "Variant A ($149)",
    confidence: 95
  },
  { 
    id: "AB-003", 
    name: "CTA Button Color", 
    type: "CTA", 
    status: "Running", 
    startDate: "2024-11-20",
    variants: [
      { name: "Control (Black)", visitors: 2100, conversions: 84, conversionRate: 4.0 },
      { name: "Variant A (Orange)", visitors: 2080, conversions: 104, conversionRate: 5.0 },
      { name: "Variant B (Green)", visitors: 2050, conversions: 82, conversionRate: 4.0 },
    ],
    confidence: 72
  },
  { 
    id: "AB-004", 
    name: "Email Subject Line", 
    type: "Email", 
    status: "Draft", 
    startDate: "2024-12-01",
    variants: [
      { name: "Control", visitors: 0, conversions: 0, conversionRate: 0 },
      { name: "Variant A", visitors: 0, conversions: 0, conversionRate: 0 },
    ]
  },
];

export default function ABTestingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("running");
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const runningTests = mockTests.filter(t => t.status === "Running").length;
  const completedTests = mockTests.filter(t => t.status === "Completed").length;
  const avgLift = 25; // Mock average lift percentage

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running": return "text-success-600";
      case "Completed": return "text-info-600";
      case "Draft": return "text-ink-600";
      case "Paused": return "text-warning-600";
      default: return "text-ink-600";
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-ink-600";
    if (confidence >= 95) return "text-success-600";
    if (confidence >= 80) return "text-warning-600";
    return "text-error-600";
  };

  const filteredTests = activeTab === "all" ? mockTests :
    mockTests.filter(t => t.status.toLowerCase() === activeTab);

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>A/B TESTING</H1>
            <Body className="text-ink-600">Test landing pages, pricing, and marketing elements</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Running Tests" value={runningTests} className="border-2 border-black" />
            <StatCard label="Completed" value={completedTests} className="border-2 border-black" />
            <StatCard label="Avg Lift" value={`+${avgLift}%`} trend="up" className="border-2 border-black" />
            <StatCard label="Total Visitors" value="32K" className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "running"} onClick={() => setActiveTab("running")}>Running</Tab>
                <Tab active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Completed</Tab>
                <Tab active={activeTab === "draft"} onClick={() => setActiveTab("draft")}>Drafts</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Test</Button>
          </Stack>

          <Stack gap={4}>
            {filteredTests.map((test) => (
              <Card key={test.id} className="border-2 border-black p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Stack gap={1}>
                      <Body className="font-bold">{test.name}</Body>
                      <Stack direction="horizontal" gap={2}>
                        <Badge variant="outline">{test.type}</Badge>
                        <Label className={getStatusColor(test.status)}>{test.status}</Label>
                      </Stack>
                    </Stack>
                    <Stack gap={1} className="text-right">
                      {test.confidence && (
                        <Stack direction="horizontal" gap={2}>
                          <Label className="text-ink-500">Confidence:</Label>
                          <Label className={getConfidenceColor(test.confidence)}>{test.confidence}%</Label>
                        </Stack>
                      )}
                      {test.winner && <Badge variant="solid" className="bg-success-600">Winner: {test.winner}</Badge>}
                    </Stack>
                  </Stack>

                  <Grid cols={2} gap={4}>
                    {test.variants.map((variant, idx) => (
                      <Card key={idx} className={`p-4 border ${test.winner === variant.name ? "border-success-500 bg-success-50" : "border-ink-200"}`}>
                        <Stack gap={3}>
                          <Label className="font-medium">{variant.name}</Label>
                          <Grid cols={3} gap={2}>
                            <Stack gap={0}>
                              <Label className="font-mono">{variant.visitors.toLocaleString()}</Label>
                              <Label size="xs" className="text-ink-500">Visitors</Label>
                            </Stack>
                            <Stack gap={0}>
                              <Label className="font-mono">{variant.conversions}</Label>
                              <Label size="xs" className="text-ink-500">Conversions</Label>
                            </Stack>
                            <Stack gap={0}>
                              <Label className={`font-mono ${idx > 0 && variant.conversionRate > test.variants[0].conversionRate ? "text-success-600" : ""}`}>
                                {variant.conversionRate.toFixed(1)}%
                              </Label>
                              <Label size="xs" className="text-ink-500">Conv Rate</Label>
                            </Stack>
                          </Grid>
                          {test.status === "Running" && (
                            <ProgressBar value={(variant.visitors / 5000) * 100} className="h-2" />
                          )}
                        </Stack>
                      </Card>
                    ))}
                  </Grid>

                  <Stack direction="horizontal" className="justify-between items-center">
                    <Label className="text-ink-500">Started: {test.startDate} {test.endDate && `• Ended: ${test.endDate}`}</Label>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTest(test)}>Details</Button>
                      {test.status === "Running" && <Button variant="ghost" size="sm">Pause</Button>}
                      {test.status === "Completed" && test.winner && <Button variant="solid" size="sm">Apply Winner</Button>}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>

          <Button variant="outline" onClick={() => router.push("/marketing")}>Back to Marketing</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedTest} onClose={() => setSelectedTest(null)}>
        <ModalHeader><H3>Test Details</H3></ModalHeader>
        <ModalBody>
          {selectedTest && (
            <Stack gap={4}>
              <Body className="font-bold">{selectedTest.name}</Body>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedTest.type}</Badge>
                <Label className={getStatusColor(selectedTest.status)}>{selectedTest.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Start Date</Label><Label>{selectedTest.startDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">End Date</Label><Label>{selectedTest.endDate || "Ongoing"}</Label></Stack>
              </Grid>
              {selectedTest.confidence && (
                <Stack gap={1}>
                  <Label className="text-ink-500">Statistical Confidence</Label>
                  <Stack direction="horizontal" gap={2}>
                    <ProgressBar value={selectedTest.confidence} className="h-4 flex-1" />
                    <Label className={getConfidenceColor(selectedTest.confidence)}>{selectedTest.confidence}%</Label>
                  </Stack>
                  {selectedTest.confidence < 95 && (
                    <Label size="xs" className="text-warning-600">Need 95% confidence to declare a winner</Label>
                  )}
                </Stack>
              )}
              <Stack gap={2}>
                <Label className="text-ink-500">Variant Performance</Label>
                {selectedTest.variants.map((variant, idx) => (
                  <Card key={idx} className={`p-3 border ${selectedTest.winner === variant.name ? "border-success-500" : "border-ink-200"}`}>
                    <Stack direction="horizontal" className="justify-between">
                      <Label>{variant.name}</Label>
                      <Label className="font-mono">{variant.conversionRate.toFixed(1)}% conversion</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTest(null)}>Close</Button>
          {selectedTest?.status === "Running" && <Button variant="outline">End Test</Button>}
          {selectedTest?.winner && <Button variant="solid">Apply Winner</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create A/B Test</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Test Name" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Test Type...</option>
              <option value="landing">Landing Page</option>
              <option value="pricing">Pricing</option>
              <option value="email">Email</option>
              <option value="cta">CTA Button</option>
              <option value="checkout">Checkout</option>
            </Select>
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="e1">Summer Music Festival 2025</option>
              <option value="e2">Tech Conference 2025</option>
            </Select>
            <Stack gap={2}>
              <Label className="text-ink-500">Variants</Label>
              <Input placeholder="Control (Original)" className="border-2 border-black" />
              <Input placeholder="Variant A" className="border-2 border-black" />
              <Button variant="outline" size="sm">+ Add Variant</Button>
            </Stack>
            <Grid cols={2} gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-500">Traffic Split</Label>
                <Select className="border-2 border-black">
                  <option value="50">50/50</option>
                  <option value="70">70/30</option>
                  <option value="80">80/20</option>
                </Select>
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-500">Min Sample Size</Label>
                <Input type="number" placeholder="1000" className="border-2 border-black" />
              </Stack>
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline">Save as Draft</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Start Test</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
